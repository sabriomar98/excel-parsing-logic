'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Calendar,
    Check,
    Clock,
    TrendingUp,
    Users,
    BarChart3
} from 'lucide-react';

interface ImputationStats {
    totalDays: number;
    imputedDays: number;
    remainingDays: number;
    percentage: number;
    byPhase: {
        [phase: string]: {
            total: number;
            imputed: number;
            percentage: number;
        };
    };
    byCollaborator: {
        name: string;
        total: number;
        imputed: number;
        percentage: number;
    }[];
}

interface ImputationStatsWidgetProps {
    stats: ImputationStats;
}

const PHASE_LABELS: { [key: string]: string } = {
    instruction: 'Instruction',
    cadrage: 'Cadrage',
    conception: 'Conception',
    administration: 'Administration',
    technique: 'Technique',
    developpement: 'Développement',
    testUnitaire: 'Test Unitaire',
    testIntegration: 'Test Intégration',
    assistanceRecette: 'Assistance Recette',
    deploiement: 'Déploiement',
    assistancePost: 'Assistance Post'
};

export default function ImputationStatsWidget({ stats }: ImputationStatsWidgetProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total général */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Jours</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDays}</div>
                    <p className="text-xs text-muted-foreground">
                        Jours d'imputation prévus
                    </p>
                </CardContent>
            </Card>

            {/* Jours imputés */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Jours Imputés</CardTitle>
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.imputedDays}</div>
                    <Progress value={stats.percentage} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                        {stats.percentage}% complété
                    </p>
                </CardContent>
            </Card>

            {/* Jours restants */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Jours Restants</CardTitle>
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.remainingDays}</div>
                    <p className="text-xs text-muted-foreground">
                        Jours à imputer
                    </p>
                </CardContent>
            </Card>

            {/* Progression */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progression</CardTitle>
                    <TrendingUp className="h-4 w-4 text-attijari-orange" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-attijari-orange">{stats.percentage}%</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.imputedDays} / {stats.totalDays}
                    </p>
                </CardContent>
            </Card>

            {/* Par Phase */}
            <Card className="md:col-span-2 lg:col-span-2">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        <CardTitle>Imputation par Phase</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Object.entries(stats.byPhase).map(([phase, data]) => (
                            <div key={phase}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">
                                        {PHASE_LABELS[phase] || phase}
                                    </span>
                                    <Badge variant={data.percentage === 100 ? 'default' : 'secondary'}>
                                        {data.imputed} / {data.total}
                                    </Badge>
                                </div>
                                <Progress value={data.percentage} className="h-2" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Par Collaborateur */}
            <Card className="md:col-span-2 lg:col-span-2">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <CardTitle>Imputation par Collaborateur</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stats.byCollaborator.map((collab) => (
                            <div key={collab.name}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium truncate max-w-50">
                                        {collab.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {collab.percentage}%
                                        </span>
                                        <Badge variant={collab.percentage === 100 ? 'default' : 'secondary'}>
                                            {collab.imputed} / {collab.total}
                                        </Badge>
                                    </div>
                                </div>
                                <Progress value={collab.percentage} className="h-2" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
