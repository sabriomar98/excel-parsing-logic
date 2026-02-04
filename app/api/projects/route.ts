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
    const filiale = searchParams.get('filiale');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Filter by userId - only show projects owned by current user
    const where: any = {
      userId: user.userId, // Filtrer par propriétaire du projet
    };
    if (filiale) where.filiale = filiale;

    const projects = await db.project.findMany({
      where,
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            collaborators: true,
            plannings: true,
          },
        },
      },
    });

    // Apply client-side filtering for status and search
    let filtered = projects;

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.reference.toLowerCase().includes(search.toLowerCase()) ||
          p.filiale.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filtered = filtered.filter((p) => {
        const latestVersion = p.versions[0];
        return latestVersion?.status === status;
      });
    }

    return NextResponse.json({ projects: filtered });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
