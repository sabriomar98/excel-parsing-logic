'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Calendar,
    Check,
    Clock,
    MessageSquare,
    TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useInvalidateCache } from '@/lib/hooks/useInvalidateCache';

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

interface DailyImputationTableProps {
    collaboratorId: string;
    collaboratorName: string;
    dailyImputations: DailyImputation[];
    onImputationChange?: () => void;
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
    assistancePost: 'Assistance Post-Déploiement'
};

const PHASE_COLORS: { [key: string]: string } = {
    instruction: 'bg-attijari-orange',
    cadrage: 'bg-green-500',
    conception: 'bg-purple-500',
    administration: 'bg-orange-500',
    technique: 'bg-pink-500',
    developpement: 'bg-indigo-500',
    testUnitaire: 'bg-yellow-500',
    testIntegration: 'bg-cyan-500',
    assistanceRecette: 'bg-teal-500',
    deploiement: 'bg-red-500',
    assistancePost: 'bg-gray-500'
};

export default function DailyImputationTable({
    collaboratorId,
    collaboratorName,
    dailyImputations,
    onImputationChange
}: DailyImputationTableProps) {
    const { invalidateAfterImputation } = useInvalidateCache();
    const [selectedImputation, setSelectedImputation] = useState<DailyImputation | null>(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCommentDialog, setShowCommentDialog] = useState(false);

    // Grouper par phase
    const groupedByPhase = dailyImputations.reduce((acc, imp) => {
        if (!acc[imp.phase]) {
            acc[imp.phase] = [];
        }
        acc[imp.phase].push(imp);
        return acc;
    }, {} as Record<string, DailyImputation[]>);

    // Calculer les statistiques
    const totalDays = dailyImputations.length;
    const imputedDays = dailyImputations.filter(d => d.isImputed).length;
    const percentage = totalDays > 0 ? Math.round((imputedDays / totalDays) * 100) : 0;

    const handleImputationToggle = async (imputation: DailyImputation, checked: boolean) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/daily-imputation/${imputation.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isImputed: checked,
                    userId: 'current-user-id', // À remplacer par l'ID utilisateur réel
                    comment: comment || null
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour');
            }

            // Invalider les caches pour synchroniser les données
            invalidateAfterImputation();
            
            onImputationChange?.();
        } catch (error) {
            console.error('Error updating imputation:', error);
            alert('Erreur lors de la mise à jour de l\'imputation');
        } finally {
            setLoading(false);
            setComment('');
            setShowCommentDialog(false);
        }
    };

    const openCommentDialog = (imputation: DailyImputation) => {
        setSelectedImputation(imputation);
        setComment(imputation.comment || '');
        setShowCommentDialog(true);
    };

    const handleCommentSave = () => {
        if (selectedImputation) {
            handleImputationToggle(selectedImputation, !selectedImputation.isImputed);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Imputation Quotidienne</CardTitle>
                        <CardDescription>
                            Collaborateur: {collaboratorName}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Progression</div>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold">{percentage}%</div>
                                <Badge variant={percentage === 100 ? 'default' : 'secondary'}>
                                    {imputedDays} / {totalDays} jours
                                </Badge>
                            </div>
                        </div>
                        <div className="w-32 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 dark:bg-green-600 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {Object.entries(groupedByPhase).map(([phase, imputations]) => {
                        const phaseImputedCount = imputations.filter(i => i.isImputed).length;
                        const phaseTotal = imputations.length;
                        const phasePercentage = Math.round((phaseImputedCount / phaseTotal) * 100);

                        return (
                            <div key={phase} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${PHASE_COLORS[phase]}`} />
                                        <h3 className="font-semibold text-lg">{PHASE_LABELS[phase]}</h3>
                                        <Badge variant="outline">
                                            {phaseImputedCount} / {phaseTotal} jours ({phasePercentage}%)
                                        </Badge>
                                    </div>
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">✓</TableHead>
                                                <TableHead>Jour</TableHead>
                                                <TableHead>Date Prévue</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead>Imputé le</TableHead>
                                                <TableHead>Commentaire</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {imputations.map((imputation) => (
                                                <TableRow
                                                    key={imputation.id}
                                                    className={imputation.isImputed ? 'bg-green-50 dark:bg-green-950/20' : ''}
                                                >
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={imputation.isImputed}
                                                            onCheckedChange={(checked) =>
                                                                handleImputationToggle(imputation, checked as boolean)
                                                            }
                                                            disabled={loading}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        Jour {imputation.dayNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        {imputation.datePrevu ? (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                                {format(new Date(imputation.datePrevu), 'dd MMM yyyy', {
                                                                    locale: fr
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">Non planifié</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {imputation.isImputed ? (
                                                            <Badge className="bg-green-500 dark:bg-green-600 text-white">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Imputé
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                En attente
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {imputation.imputedAt ? (
                                                            <span className="text-sm text-muted-foreground">
                                                                {format(new Date(imputation.imputedAt), 'dd/MM/yyyy HH:mm', {
                                                                    locale: fr
                                                                })}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openCommentDialog(imputation)}
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                            {imputation.comment && (
                                                                <span className="ml-1 text-xs">(1)</span>
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Dialog pour ajouter un commentaire */}
                <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Commentaire</DialogTitle>
                            <DialogDescription>
                                Ajouter un commentaire pour le jour {selectedImputation?.dayNumber} -{' '}
                                {selectedImputation && PHASE_LABELS[selectedImputation.phase]}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea
                                placeholder="Votre commentaire..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleCommentSave} disabled={loading}>
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
