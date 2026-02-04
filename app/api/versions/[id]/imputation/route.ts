import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { collaboratorIds } = body;

    // Get current version
    const version = await db.instructionVersion.findUnique({
      where: { id },
      include: { collaborators: true },
    });

    if (!version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Update collaborator imputation status
    if (collaboratorIds && Array.isArray(collaboratorIds)) {
      const now = new Date();
      for (const collabId of collaboratorIds) {
        await db.collaboratorLine.update({
          where: { id: collabId },
          data: {
            isImputed: true,
            imputedAt: now,
          },
        });
      }
    }

    // Recalculate version status
    const allCollaborators = await db.collaboratorLine.findMany({
      where: { versionId: id },
    });

    const totalCollabs = allCollaborators.length;
    const imputedCollabs = allCollaborators.filter((c) => c.isImputed).length;

    let newStatus = 'NON_IMPUTE';
    if (imputedCollabs === totalCollabs) {
      newStatus = 'IMPUTE';
    } else if (imputedCollabs > 0) {
      newStatus = 'PARTIEL';
    }

    const updatedVersion = await db.instructionVersion.update({
      where: { id },
      data: {
        status: newStatus,
        imputedBy: user.userId,
      },
      include: {
        collaborators: true,
      },
    });

    return NextResponse.json({
      version: updatedVersion,
      message: `Version status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error('Imputation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
