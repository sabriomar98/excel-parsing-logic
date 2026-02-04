import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * PATCH /api/daily-imputation/[id]
 * Marquer/démarquer une imputation quotidienne
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isImputed, userId, comment } = body;

    const updated = await prisma.dailyImputation.update({
      where: { id },
      data: {
        isImputed,
        imputedAt: isImputed ? new Date() : null,
        imputedBy: isImputed ? userId : null,
        comment: comment || null
      },
      include: {
        collaborator: {
          select: {
            id: true,
            name: true,
            versionId: true
          }
        }
      }
    });

    // Recalculer le statut du collaborateur
    const collaboratorId = updated.collaboratorId;
    const allDailyImputations = await prisma.dailyImputation.findMany({
      where: { collaboratorId }
    });

    const totalDays = allDailyImputations.length;
    const imputedDays = allDailyImputations.filter(d => d.isImputed).length;

    let collaboratorStatus = 'NON_IMPUTE';
    if (imputedDays > 0 && imputedDays < totalDays) {
      collaboratorStatus = 'PARTIEL';
    } else if (imputedDays === totalDays) {
      collaboratorStatus = 'IMPUTE';
    }

    // Mettre à jour le statut du collaborateur
    await prisma.collaboratorLine.update({
      where: { id: collaboratorId },
      data: {
        isImputed: collaboratorStatus === 'IMPUTE',
        imputedAt: collaboratorStatus === 'IMPUTE' ? new Date() : null
      }
    });

    // Recalculer le statut de la version
    const versionId = updated.collaborator.versionId;
    const allCollaborators = await prisma.collaboratorLine.findMany({
      where: { versionId },
      select: { id: true, isImputed: true }
    });

    const totalCollaborators = allCollaborators.length;
    const imputedCollaborators = allCollaborators.filter(c => c.isImputed).length;

    let versionStatus = 'NON_IMPUTE';
    if (imputedCollaborators > 0 && imputedCollaborators < totalCollaborators) {
      versionStatus = 'PARTIEL';
    } else if (imputedCollaborators === totalCollaborators) {
      versionStatus = 'IMPUTE';
    }

    await prisma.instructionVersion.update({
      where: { id: versionId },
      data: { status: versionStatus }
    });

    return NextResponse.json({
      success: true,
      dailyImputation: updated,
      collaboratorStatus,
      versionStatus,
      stats: {
        totalDays,
        imputedDays,
        remainingDays: totalDays - imputedDays
      }
    });
  } catch (error) {
    console.error('Error updating daily imputation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'imputation quotidienne' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/daily-imputation/[id]
 * Supprimer une imputation quotidienne
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.dailyImputation.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Imputation quotidienne supprimée'
    });
  } catch (error) {
    console.error('Error deleting daily imputation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'imputation quotidienne' },
      { status: 500 }
    );
  }
}
