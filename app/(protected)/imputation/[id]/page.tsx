'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DailyImputationTable from '@/components/ui/daily-imputation-table';
import ImputationStatsWidget from '@/components/ui/imputation-stats-widget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface DailyImputation {
    id: string;
    phase: string;
    dayNumber: number;
    datePrevu: string | null;
    isImputed: boolean;
    imputedAt: string | null;
    imputedBy: string | null;
    comment: string | null;
}

interface Collaborator {
    id: string;
    name: string;
    dailyImputations: DailyImputation[];
}

export default function CollaboratorImputationPage() {
    const params = useParams();
    const collaboratorId = params.id as string;

    const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const response = await fetch(`/api/daily-imputation?collaboratorId=${collaboratorId}`);

            if (!response.ok) {
                throw new Error('Erreur lors du chargement');
            }

            const data = await response.json();

            // Simuler les données du collaborateur
            setCollaborator({
                id: collaboratorId,
                name: data.dailyImputations[0]?.collaborator?.name || 'Collaborateur',
                dailyImputations: data.dailyImputations
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [collaboratorId]);

    const calculateStats = () => {
        if (!collaborator) return null;

        const byPhase: any = {};
        const totalDays = collaborator.dailyImputations.length;
        const imputedDays = collaborator.dailyImputations.filter(d => d.isImputed).length;

        collaborator.dailyImputations.forEach(imp => {
            if (!byPhase[imp.phase]) {
                byPhase[imp.phase] = { total: 0, imputed: 0, percentage: 0 };
            }
            byPhase[imp.phase].total++;
            if (imp.isImputed) {
                byPhase[imp.phase].imputed++;
            }
        });

        Object.keys(byPhase).forEach(phase => {
            byPhase[phase].percentage = Math.round(
                (byPhase[phase].imputed / byPhase[phase].total) * 100
            );
        });

        return {
            totalDays,
            imputedDays,
            remainingDays: totalDays - imputedDays,
            percentage: totalDays > 0 ? Math.round((imputedDays / totalDays) * 100) : 0,
            byPhase,
            byCollaborator: [
                {
                    name: collaborator.name,
                    total: totalDays,
                    imputed: imputedDays,
                    percentage: totalDays > 0 ? Math.round((imputedDays / totalDays) * 100) : 0
                }
            ]
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!collaborator) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card>
                    <CardHeader>
                        <CardTitle>Collaborateur introuvable</CardTitle>
                        <CardDescription>
                            Le collaborateur demandé n'existe pas ou n'a pas d'imputations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/projects">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour aux projets
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const stats = calculateStats();

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Imputation Quotidienne</h1>
                    <p className="text-muted-foreground">
                        Suivi détaillé des imputations par jour et par phase
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchData} disabled={refreshing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Actualiser
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/projects">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Statistiques */}
            {stats && <ImputationStatsWidget stats={stats} />}

            {/* Tableau d'imputation */}
            <DailyImputationTable
                collaboratorId={collaborator.id}
                collaboratorName={collaborator.name}
                dailyImputations={collaborator.dailyImputations}
                onImputationChange={fetchData}
            />
        </div>
    );
}
