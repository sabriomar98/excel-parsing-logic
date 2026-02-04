import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/daily-imputation?collaboratorId=xxx
 * Récupère toutes les imputations quotidiennes d'un collaborateur
 */
export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const collaboratorId = searchParams.get('collaboratorId');
        const versionId = searchParams.get('versionId');

        if (!collaboratorId && !versionId) {
            return NextResponse.json(
                { error: 'collaboratorId ou versionId requis' },
                { status: 400 }
            );
        }

        let dailyImputations: any[] = [];

        if (collaboratorId) {
            // Récupérer pour un collaborateur spécifique (filtré par userId)
            dailyImputations = await prisma.dailyImputation.findMany({
                where: { 
                    collaboratorId,
                    userId: currentUser.userId, // Filtrer par utilisateur
                },
                orderBy: [
                    { phase: 'asc' },
                    { dayNumber: 'asc' }
                ],
                include: {
                    collaborator: {
                        select: {
                            name: true,
                            versionId: true
                        }
                    }
                }
            });
        } else if (versionId) {
            // Récupérer pour toute une version (filtré par userId)
            dailyImputations = await prisma.dailyImputation.findMany({
                where: {
                    userId: currentUser.userId, // Filtrer par utilisateur
                    collaborator: {
                        versionId
                    }
                },
                orderBy: [
                    { collaborator: { name: 'asc' } },
                    { phase: 'asc' },
                    { dayNumber: 'asc' }
                ],
                include: {
                    collaborator: {
                        select: {
                            name: true,
                            versionId: true
                        }
                    }
                }
            });
        }

        // Calculer les statistiques
        const total = dailyImputations?.length || 0;
        const imputed = dailyImputations?.filter(d => d.isImputed).length || 0;
        const remaining = total - imputed;
        const percentage = total > 0 ? Math.round((imputed / total) * 100) : 0;

        return NextResponse.json({
            dailyImputations,
            stats: {
                total,
                imputed,
                remaining,
                percentage
            }
        });
    } catch (error) {
        console.error('Error fetching daily imputations:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des imputations quotidiennes' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/daily-imputation
 * Crée des imputations quotidiennes pour un collaborateur
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { collaboratorId, dailyImputations } = body;

        if (!collaboratorId || !dailyImputations) {
            return NextResponse.json(
                { error: 'collaboratorId et dailyImputations requis' },
                { status: 400 }
            );
        }

        // Créer les imputations en batch
        const created = await prisma.dailyImputation.createMany({
            data: dailyImputations.map((imputation: any) => ({
                collaboratorId,
                phase: imputation.phase,
                dayNumber: imputation.dayNumber,
                datePrevu: imputation.datePrevu ? new Date(imputation.datePrevu) : null,
            }))
        });

        return NextResponse.json({
            success: true,
            created: created.count
        });
    } catch (error) {
        console.error('Error creating daily imputations:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création des imputations quotidiennes' },
            { status: 500 }
        );
    }
}
