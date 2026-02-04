'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/components/layout/page-container';
import { Loader2, Calendar, Search, Users, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function ImputationPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['all-collaborators'],
        queryFn: async () => {
            const response = await fetch('/api/collaborators');
            if (!response.ok) throw new Error('Failed to fetch collaborators');
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </PageContainer>
        );
    }

    const collaborators = data?.collaborators || [];

    // Filter collaborators based on search term
    const filteredCollaborators = collaborators.filter((collab: any) =>
        collab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collab.version?.project?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by project
    const collaboratorsByProject = filteredCollaborators.reduce((acc: any, collab: any) => {
        const projectTitle = collab.version?.project?.title || 'Sans Projet';
        if (!acc[projectTitle]) {
            acc[projectTitle] = [];
        }
        acc[projectTitle].push(collab);
        return acc;
    }, {});

    const getStatusBadge = (status: string) => {
        const config = {
            IMPUTE: { label: 'Imputé', className: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' },
            PARTIEL: { label: 'Partiel', className: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
            NON_IMPUTE: { label: 'Non Imputé', className: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
        }[status] || { label: status, className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700' };

        return (
            <Badge variant="outline" className={config.className}>
                {config.label}
            </Badge>
        );
    };

    return (
        <PageContainer>
            {/* Header */}
            <div className="mb-12">
                <div className="space-y-2 mb-8">
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                        Imputations Quotidiennes
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Suivi jour par jour de l'avancement des collaborateurs
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-linear-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-slate-900 border-orange-100 dark:border-orange-900/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Collaborateurs</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{collaborators.length}</p>
                        </div>
                        <Users className="h-10 w-10 text-attijari-orange opacity-50" />
                    </div>
                </Card>

                <Card className="p-6 bg-linear-to-br from-green-50 to-white dark:from-green-950/30 dark:to-slate-900 border-green-100 dark:border-green-900/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Imputés</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {collaborators.filter((c: any) => c.status === 'IMPUTE').length}
                            </p>
                        </div>
                        <TrendingUp className="h-10 w-10 text-green-600 dark:text-green-400 opacity-50" />
                    </div>
                </Card>

                <Card className="p-6 bg-linear-to-br from-yellow-50 to-white dark:from-yellow-950/30 dark:to-slate-900 border-yellow-100 dark:border-yellow-900/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Partiels</p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                {collaborators.filter((c: any) => c.status === 'PARTIEL').length}
                            </p>
                        </div>
                        <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400 opacity-50" />
                    </div>
                </Card>

                <Card className="p-6 bg-linear-to-br from-red-50 to-white dark:from-red-950/30 dark:to-slate-900 border-red-100 dark:border-red-900/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Non Imputés</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {collaborators.filter((c: any) => c.status === 'NON_IMPUTE').length}
                            </p>
                        </div>
                        <Users className="h-10 w-10 text-red-600 dark:text-red-400 opacity-50" />
                    </div>
                </Card>
            </div>

            {/* Search Bar */}
            <Card className="p-6 mb-8 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                        placeholder="Rechercher par nom de collaborateur ou projet..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 text-lg"
                    />
                </div>
            </Card>

            {/* Collaborators by Project */}
            <div className="space-y-8">
                {Object.entries(collaboratorsByProject).map(([projectTitle, collabs]: [string, any]) => (
                    <Card key={projectTitle} className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                <div className="w-2 h-8 bg-attijari-orange rounded-full" />
                                {projectTitle}
                            </h2>
                            <Badge variant="outline" className="text-sm">
                                {collabs.length} collaborateur{collabs.length > 1 ? 's' : ''}
                            </Badge>
                        </div>

                        <div className="grid gap-4">
                            {collabs.map((collab: any) => (
                                <Link key={collab.id} href={`/imputation/${collab.id}`}>
                                    <div className="group p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6 flex-1">
                                                {/* Avatar */}
                                                <div className="w-14 h-14 bg-linear-to-br from-attijari-orange to-attijari-red rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                    {collab.name.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-attijari-orange transition-colors">
                                                        {collab.name}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            Total: {collab.total || 0} JH
                                                        </span>
                                                        {collab.version?.versionName && (
                                                            <>
                                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                                <span>Version: {collab.version.versionName}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status & Action */}
                                            <div className="flex items-center gap-4">
                                                {getStatusBadge(collab.status)}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-attijari-orange border-orange-200 dark:border-orange-800 group-hover:shadow-md transition-all"
                                                >
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Voir Imputation
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {collab._count?.dailyImputations !== undefined && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                                                <div className="flex items-center justify-between text-sm mb-2">
                                                    <span className="text-gray-600 dark:text-gray-400">Progression</span>
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {/* Calculate from daily imputations if available */}
                                                        {collab.status === 'IMPUTE' ? '100%' : collab.status === 'PARTIEL' ? 'En cours' : '0%'}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${collab.status === 'IMPUTE'
                                                                ? 'bg-green-500 w-full'
                                                                : collab.status === 'PARTIEL'
                                                                    ? 'bg-yellow-500 w-1/2'
                                                                    : 'bg-red-500 w-0'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Card>
                ))}

                {filteredCollaborators.length === 0 && (
                    <Card className="p-12 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full mb-4">
                                <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">Aucun collaborateur trouvé</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                                {searchTerm ? 'Essayez une autre recherche' : 'Commencez par uploader un fichier Excel'}
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </PageContainer>
    );
}
