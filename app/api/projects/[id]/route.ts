import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(
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
    const project = await db.project.findUnique({
      where: { id },
      include: {
        versions: {
          include: {
            collaborators: true,
            plannings: true,
            uploadedByUser: {
              select: { id: true, email: true, name: true },
            },
          },
          orderBy: { versionNumber: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Vérifier que le projet appartient à l'utilisateur
    if (project.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Accès refusé - Ce projet ne vous appartient pas' },
        { status: 403 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify project exists and belongs to user
    const project = await db.project.findUnique({
      where: { id },
      include: {
        versions: {
          select: { id: true, uploadedBy: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Vérifier que le projet appartient à l'utilisateur
    if (project.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de supprimer ce projet' },
        { status: 403 }
      );
    }

    // Delete all versions (cascade delete collaborators and plannings)
    await db.instructionVersion.deleteMany({
      where: { projectId: id },
    });

    // Delete project
    const deletedProject = await db.project.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Project deleted successfully',
      project: deletedProject,
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
