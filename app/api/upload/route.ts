import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { parseExcelFile, generateDailyImputations } from '@/lib/excel-parser';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse form data - get file from form
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Parse Excel directly from buffer (no disk write)
    const parsed = await parseExcelFile(fileBuffer as any);

    // Filter out invalid collaborators instead of rejecting the entire file
    // Keep only collaborators with valid names
    const validCollaborators = parsed.collaborators.filter(collab => {
      const hasParentheses = /\([A-Za-zÀ-ÿ\s.]+\)/.test(collab.name);
      const words = collab.name.split(/\s+/).filter(word => /^[A-Za-zÀ-ÿ\-'.]+$/.test(word));
      const hasMultipleRealWords = words.length >= 2;
      return hasParentheses || hasMultipleRealWords;
    });

    // If no valid collaborators found, reject the file
    if (validCollaborators.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid collaborators found in Excel file',
          details: 'File must contain at least one collaborator with format like "Collaborateur (I.KADA)" or "Jean Dupont"',
          invalidCollaborators: parsed.invalidCollaborators,
        },
        { status: 400 }
      );
    }

    // Check for duplicate file
    const existingVersion = await db.instructionVersion.findUnique({
      where: { fileHash: parsed.fileHash },
    });

    if (existingVersion) {
      return NextResponse.json(
        { 
          error: 'This file has already been uploaded',
          details: 'This file has already been uploaded. Please check your projects or upload a modified version.',
          versionId: existingVersion.id 
        },
        { status: 409 }
      );
    }

    // Check if this is a new version of existing project
    let project = await db.project.findUnique({
      where: {
        filiale_reference_userId: {
          filiale: parsed.metadata.filiale,
          reference: parsed.metadata.reference,
          userId: user.userId, // Filtrer par utilisateur
        },
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    let versionNumber = 1;
    if (project) {
      versionNumber = (project.versions[0]?.versionNumber ?? 0) + 1;
    } else {
      project = await db.project.create({
        data: {
          filiale: parsed.metadata.filiale,
          reference: parsed.metadata.reference,
          title: parsed.metadata.titre,
          context: parsed.metadata.contexte,
          userId: user.userId, // Associer le projet à l'utilisateur
        },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });
    }

    // Generate a logical file name (no physical storage in Vercel)
    const fileName = `${project.id}-v${versionNumber}.xlsx`;

    // Create version record
    const version = await db.instructionVersion.create({
      data: {
        projectId: project.id,
        versionNumber,
        fileHash: parsed.fileHash,
        fileName,
        // No physical file stored in serverless environment
        filePath: '',
        demandeur: parsed.metadata.demandeur,
        chargeTotale: parsed.metadata.chargeTotale,
        dateDebut: parsed.metadata.dateDebut,
        dateMEP: parsed.metadata.dateMEP,
        dateValidation: parsed.metadata.dateValidation,
        uploadedBy: user.userId,
        collaborators: {
          createMany: {
            data: validCollaborators.map((collab) => ({
              name: collab.name,
              userId: user.userId, // Associer le collaborateur à l'utilisateur
              instruction: collab.instruction,
              cadrage: collab.cadrage,
              conception: collab.conception,
              administration: collab.administration,
              technique: collab.technique,
              developpement: collab.developpement,
              testUnitaire: collab.testUnitaire,
              testIntegration: collab.testIntegration,
              assistanceRecette: collab.assistanceRecette,
              deploiement: collab.deploiement,
              assistancePost: collab.assistancePost,
              total: collab.total,
            })),
          },
        },
        plannings: {
          createMany: {
            data: parsed.planning.map((plan) => ({
              phase: plan.phase,
              startDate: plan.startDate,
              endDate: plan.endDate,
              note: plan.note,
            })),
          },
        },
      },
      include: {
        collaborators: true,
        plannings: true,
      },
    });

    // Créer les imputations quotidiennes pour chaque collaborateur
    for (const collaborator of version.collaborators) {
      // Trouver les données du collaborateur depuis le parsing
      const collabData = validCollaborators.find(c => c.name === collaborator.name);
      if (collabData) {
        // Générer les lignes d'imputation quotidienne
        const dailyImputations = generateDailyImputations(collabData, parsed.planning);
        
        // Créer en batch pour performance
        if (dailyImputations.length > 0) {
          await db.dailyImputation.createMany({
            data: dailyImputations.map(imp => ({
              collaboratorId: collaborator.id,
              userId: user.userId, // Associer l'imputation à l'utilisateur
              phase: imp.phase,
              dayNumber: imp.dayNumber,
              datePrevu: imp.datePrevu,
            }))
          });
        }
      }
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      projectId: project.id,
      versionId: version.id,
      versionNumber,
      dailyImputationsCreated: true,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: 'Failed to process upload',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
