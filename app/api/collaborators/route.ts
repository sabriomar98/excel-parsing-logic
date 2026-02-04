import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const collaborators = await prisma.collaboratorLine.findMany({
      where: {
        userId: currentUser.userId, // Filtrer par utilisateur connecté
      },
      include: {
        version: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                reference: true,
                filiale: true,
              },
            },
          },
        },
        _count: {
          select: {
            dailyImputations: true,
          },
        },
      },
      orderBy: [
        { version: { project: { title: 'asc' } } },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collaborators' },
      { status: 500 }
    );
  }
}
