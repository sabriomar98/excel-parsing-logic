import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const collaboratorName = searchParams.get('collaborator');
    const phase = searchParams.get('phase');

    let where: any = {
      userId: user.userId, // Filtrer par utilisateur
    };
    if (projectId) {
      where.version = { projectId };
    }

    // Get all collaborators for current user
    const collaborators = await db.collaboratorLine.findMany({
      where,
      include: { version: { include: { project: true } } },
    });

    // Calculate cumulation by project
    const byProject: Record<string, any> = {};
    for (const collab of collaborators) {
      const key = `${collab.version.project.filiale}-${collab.version.project.reference}`;
      if (!byProject[key]) {
        byProject[key] = {
          projectId: collab.version.projectId,
          filiale: collab.version.project.filiale,
          reference: collab.version.project.reference,
          title: collab.version.project.title,
          charges: {},
        };
      }
      // Accumulate all phases
      byProject[key].charges.instruction = (byProject[key].charges.instruction || 0) + collab.instruction;
      byProject[key].charges.cadrage = (byProject[key].charges.cadrage || 0) + collab.cadrage;
      byProject[key].charges.conception = (byProject[key].charges.conception || 0) + collab.conception;
      byProject[key].charges.administration = (byProject[key].charges.administration || 0) + collab.administration;
      byProject[key].charges.technique = (byProject[key].charges.technique || 0) + collab.technique;
      byProject[key].charges.developpement = (byProject[key].charges.developpement || 0) + collab.developpement;
      byProject[key].charges.testUnitaire = (byProject[key].charges.testUnitaire || 0) + collab.testUnitaire;
      byProject[key].charges.testIntegration = (byProject[key].charges.testIntegration || 0) + collab.testIntegration;
      byProject[key].charges.assistanceRecette = (byProject[key].charges.assistanceRecette || 0) + collab.assistanceRecette;
      byProject[key].charges.deploiement = (byProject[key].charges.deploiement || 0) + collab.deploiement;
      byProject[key].charges.assistancePost = (byProject[key].charges.assistancePost || 0) + collab.assistancePost;
      byProject[key].charges.total = (byProject[key].charges.total || 0) + collab.total;
    }

    // Calculate cumulation by collaborator
    const byCollaborator: Record<string, any> = {};
    for (const collab of collaborators) {
      if (!byCollaborator[collab.name]) {
        byCollaborator[collab.name] = {
          name: collab.name,
          charges: {},
        };
      }
      byCollaborator[collab.name].charges.instruction = (byCollaborator[collab.name].charges.instruction || 0) + collab.instruction;
      byCollaborator[collab.name].charges.cadrage = (byCollaborator[collab.name].charges.cadrage || 0) + collab.cadrage;
      byCollaborator[collab.name].charges.conception = (byCollaborator[collab.name].charges.conception || 0) + collab.conception;
      byCollaborator[collab.name].charges.administration = (byCollaborator[collab.name].charges.administration || 0) + collab.administration;
      byCollaborator[collab.name].charges.technique = (byCollaborator[collab.name].charges.technique || 0) + collab.technique;
      byCollaborator[collab.name].charges.developpement = (byCollaborator[collab.name].charges.developpement || 0) + collab.developpement;
      byCollaborator[collab.name].charges.testUnitaire = (byCollaborator[collab.name].charges.testUnitaire || 0) + collab.testUnitaire;
      byCollaborator[collab.name].charges.testIntegration = (byCollaborator[collab.name].charges.testIntegration || 0) + collab.testIntegration;
      byCollaborator[collab.name].charges.assistanceRecette = (byCollaborator[collab.name].charges.assistanceRecette || 0) + collab.assistanceRecette;
      byCollaborator[collab.name].charges.deploiement = (byCollaborator[collab.name].charges.deploiement || 0) + collab.deploiement;
      byCollaborator[collab.name].charges.assistancePost = (byCollaborator[collab.name].charges.assistancePost || 0) + collab.assistancePost;
      byCollaborator[collab.name].charges.total = (byCollaborator[collab.name].charges.total || 0) + collab.total;
    }

    // Calculate cumulation by phase
    const byPhase: Record<string, number> = {
      instruction: 0,
      cadrage: 0,
      conception: 0,
      administration: 0,
      technique: 0,
      developpement: 0,
      testUnitaire: 0,
      testIntegration: 0,
      assistanceRecette: 0,
      deploiement: 0,
      assistancePost: 0,
      total: 0,
    };

    for (const collab of collaborators) {
      byPhase.instruction += collab.instruction;
      byPhase.cadrage += collab.cadrage;
      byPhase.conception += collab.conception;
      byPhase.administration += collab.administration;
      byPhase.technique += collab.technique;
      byPhase.developpement += collab.developpement;
      byPhase.testUnitaire += collab.testUnitaire;
      byPhase.testIntegration += collab.testIntegration;
      byPhase.assistanceRecette += collab.assistanceRecette;
      byPhase.deploiement += collab.deploiement;
      byPhase.assistancePost += collab.assistancePost;
      byPhase.total += collab.total;
    }

    return NextResponse.json({
      byProject: Object.values(byProject),
      byCollaborator: Object.values(byCollaborator),
      byPhase,
    });
  } catch (error) {
    console.error('Cumulation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
