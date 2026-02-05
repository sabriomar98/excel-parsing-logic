'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar, Users, TrendingUp, CheckCircle, ArrowLeft, Zap, BarChart3, Flag, Clock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { DataTable } from '@/components/ui/advanced-table';
import { AdvancedStat } from '@/components/ui/advanced-stats';
import { ColumnDef } from '@tanstack/react-table';
import { DeleteProjectDialog } from '@/components/dialogs/delete-project-dialog';
import { useInvalidateCache } from '@/lib/hooks/useInvalidateCache';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const { invalidateAfterImputation, invalidateAfterDelete } = useInvalidateCache();
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [selectedCollaborators, setSelectedCollaborators] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return response.json();
    },
  });

  const imputationMutation = useMutation({
    mutationFn: async (collaboratorIds: string[]) => {
      const versionId = selectedVersion || latestVersion?.id;
      
      if (!versionId) {
        throw new Error('No version selected');
      }

      const response = await fetch(`/api/versions/${versionId}/imputation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collaboratorIds }),
      });

      if (!response.ok) throw new Error('Failed to update imputation');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Imputation status updated');
      // Invalider les caches pour synchroniser
      invalidateAfterImputation(projectId);
      setSelectedCollaborators(new Set());
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update'
      );
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Project deleted successfully');
      // Invalider tous les caches liés aux projets
      invalidateAfterDelete();
      router.push('/projects');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete project'
      );
    },
  });

  const project = data?.project;
  const latestVersion = project?.versions[0];

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-attijari-orange" />
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <p className="text-gray-600 text-center py-8">Project not found</p>
      </PageContainer>
    );
  }

  const versionToDisplay = project.versions.find(
    (v: any) => v.id === selectedVersion
  ) || latestVersion;

  // Définir les colonnes pour DataTable
  const collaboratorColumns: ColumnDef<any>[] = [
    {
      id: 'select',
      header: 'Select',
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedCollaborators.has(row.original.id)}
          onChange={() => handleCollaboratorToggle(row.original.id)}
          className="w-4 h-4 cursor-pointer"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'instruction',
      header: 'Instr',
      cell: ({ row }) => <div className="text-right">{row.getValue('instruction') || '-'}</div>,
    },
    {
      accessorKey: 'cadrage',
      header: 'Cadr',
      cell: ({ row }) => <div className="text-right">{row.getValue('cadrage') || '-'}</div>,
    },
    {
      accessorKey: 'conception',
      header: 'Conc',
      cell: ({ row }) => <div className="text-right">{row.getValue('conception') || '-'}</div>,
    },
    {
      accessorKey: 'administration',
      header: 'Admin',
      cell: ({ row }) => <div className="text-right">{row.getValue('administration') || '-'}</div>,
    },
    {
      accessorKey: 'technique',
      header: 'Tech',
      cell: ({ row }) => <div className="text-right">{row.getValue('technique') || '-'}</div>,
    },
    {
      accessorKey: 'developpement',
      header: 'Dev',
      cell: ({ row }) => <div className="text-right">{row.getValue('developpement') || '-'}</div>,
    },
    {
      accessorKey: 'testUnitaire',
      header: 'Test U',
      cell: ({ row }) => <div className="text-right">{row.getValue('testUnitaire') || '-'}</div>,
    },
    {
      accessorKey: 'testIntegration',
      header: 'Test I',
      cell: ({ row }) => <div className="text-right">{row.getValue('testIntegration') || '-'}</div>,
    },
    {
      accessorKey: 'assistanceRecette',
      header: 'Assist R',
      cell: ({ row }) => <div className="text-right">{row.getValue('assistanceRecette') || '-'}</div>,
    },
    {
      accessorKey: 'deploiement',
      header: 'Deploy',
      cell: ({ row }) => <div className="text-right">{row.getValue('deploiement') || '-'}</div>,
    },
    {
      accessorKey: 'assistancePost',
      header: 'Assist P',
      cell: ({ row }) => <div className="text-right">{row.getValue('assistancePost') || '-'}</div>,
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => <span className="font-bold text-right block">{row.getValue('total') || 0}</span>,
    },
    {
      id: 'actions',
      header: 'Imputation',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Link href={`/imputation/${row.original.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-orange-50 hover:bg-orange-100 text-attijari-orange border-orange-200"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Voir
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const handleCollaboratorToggle = (id: string) => {
    const newSet = new Set(selectedCollaborators);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCollaborators(newSet);
  };

  const handleMarkImputed = () => {
    if (selectedCollaborators.size === 0) {
      toast.error('Please select at least one collaborator');
      return;
    }
    imputationMutation.mutate(Array.from(selectedCollaborators));
  };

  return (
    <PageContainer>
      {/* Premium Header with Gradient Background */}
      <div className="mb-12">
        {/* Back Button */}
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-attijari-orange hover:text-attijari-red mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Retour aux Projets</span>
        </Link>

        {/* Hero Section */}
        <div className="mb-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {project.title || 'Untitled Project'}
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Flag className="h-5 w-5" />
                <span>{project.filiale}</span>
              </div>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Zap className="h-5 w-5" />
                <span className="font-mono">{project.reference}</span>
              </div>
            </div>
          </div>

          {/* Actions - Status and Delete */}
          <div className="flex items-center gap-3 mt-6">
            {/* Status Badge - Premium */}
            <div
              className={`px-6 py-3 rounded-2xl font-semibold text-center transition-all ${
                latestVersion?.status === 'IMPUTE'
                  ? 'bg-green-500 text-white shadow-lg'
                  : latestVersion?.status === 'PARTIEL'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-red-500 text-white shadow-lg'
              }`}
            >
              <div className="text-xs font-medium mb-1 opacity-90">STATUS</div>
              {latestVersion?.status || 'UNKNOWN'}
            </div>

            {/* Delete Button */}
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="outline"
              size="sm"
              className="border-gray-300 dark:border-gray-700 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all"
              disabled={deleteProjectMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-2">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={async () => deleteProjectMutation.mutate()}
        projectName={project.title || 'Untitled Project'}
        versionCount={project.versions.length}
        isLoading={deleteProjectMutation.isPending}
      />

      {/* Version Selector - Premium */}
      {project.versions.length > 1 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Sélectionner Version</h3>
            <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm font-semibold rounded-full">
              {project.versions.length} versions
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {project.versions.map((version: any) => (
              <button
                key={version.id}
                onClick={() => {
                  setSelectedVersion(version.id);
                  setSelectedCollaborators(new Set());
                }}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  selectedVersion === version.id
                    ? 'bg-attijari-orange text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 hover:shadow-md'
                }`}
              >
                v{version.versionNumber}
                {selectedVersion === version.id && (
                  <span className="ml-2 inline-block w-2 h-2 bg-white dark:bg-slate-200 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Project Stats - Premium Grid */}
      {versionToDisplay && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-attijari-orange" />
            Aperçu Projet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <AdvancedStat
              label="Total JH"
              value={`${versionToDisplay.chargeTotale?.toFixed(1) || '0'} h`}
              icon={<TrendingUp className="h-6 w-6" />}
              color="blue"
              subtext="Durée totale de travail"
            />
            <AdvancedStat
              label="Collaborateurs"
              value={versionToDisplay.collaborators?.length || 0}
              icon={<Users className="h-6 w-6" />}
              color="green"
              subtext="Membres de l'équipe"
            />
            <AdvancedStat
              label="Date de début"
              value={
                versionToDisplay.dateDebut
                  ? new Date(versionToDisplay.dateDebut).toLocaleDateString('fr-FR')
                  : '-'
              }
              icon={<Calendar className="h-6 w-6" />}
              color="purple"
              subtext="Début du projet"
            />
            <AdvancedStat
              label="Date de MEP"
              value={
                versionToDisplay.dateMEP
                  ? new Date(versionToDisplay.dateMEP).toLocaleDateString('fr-FR')
                  : '-'
              }
              icon={<CheckCircle className="h-6 w-6" />}
              color={
                versionToDisplay.status === 'IMPUTE' ? 'green' :
                versionToDisplay.status === 'PARTIEL' ? 'yellow' : 'red'
              }
              subtext="Mise en production prévue"
            />
          </div>
        </div>
      )}

      {/* Tabs Content - Premium */}
      <Tabs defaultValue="collaborators" className="space-y-8">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <TabsList className="bg-transparent border-0">
            <TabsTrigger 
              value="collaborators" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 data-[state=active]:bg-transparent rounded-none px-6 py-4 gap-2 font-semibold text-gray-700 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 border-0"
            >
              <Users className="h-5 w-5" />
              Collaborateurs & Charges
            </TabsTrigger>
            <TabsTrigger 
              value="planning" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 data-[state=active]:bg-transparent rounded-none px-6 py-4 gap-2 font-semibold text-gray-700 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 border-0"
            >
              <Clock className="h-5 w-5" />
              Planning
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Collaborators Tab */}
        <TabsContent value="collaborators" className="space-y-6 mt-0">
          {selectedCollaborators.size > 0 && (
            <div className="bg-linear-to-r from-attijari-orange to-attijari-red rounded-2xl p-6 text-white shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <p className="font-bold text-lg">
                  {selectedCollaborators.size} collaborateur(s) sélectionné(s)
                </p>
                <p className="text-orange-100 text-sm mt-1">Marquez-les comme imputés pour mettre à jour leur statut</p>
              </div>
              <Button
                onClick={handleMarkImputed}
                disabled={imputationMutation.isPending}
                className="bg-white dark:bg-slate-200 text-attijari-orange hover:bg-orange-50 dark:hover:bg-orange-100 font-semibold shadow-lg"
              >
                {imputationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  `Marquer ${selectedCollaborators.size} comme Imputés`
                )}
              </Button>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-800">
            {versionToDisplay?.collaborators && versionToDisplay.collaborators.length > 0 ? (
              <DataTable
                columns={collaboratorColumns}
                data={versionToDisplay.collaborators}
                pageSize={10}
                title="Chiffrage Prévisionnel"
                description="Tous les collaborateurs du projet et leurs charges attribuées par phase"
              />
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full mb-4">
                  <Users className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Aucun collaborateur assigné</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Commencez par ajouter des collaborateurs au projet</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planning" className="mt-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-attijari-orange" />
              Calendrier Prévisionnel
            </h2>

            {versionToDisplay?.plannings && versionToDisplay.plannings.length > 0 ? (
              <div className="space-y-4">
                {versionToDisplay.plannings.map((plan: any, idx: number) => (
                  <div
                    key={plan.id}
                    className="group p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl hover:shadow-xl transition-all duration-300 hover:border-orange-200 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Phase Number */}
                        <div className="shrink-0 w-10 h-10 bg-attijari-orange dark:text-white font-bold rounded-full flex items-center justify-center text-sm group-hover:shadow-lg transition-shadow">
                          {idx + 1}
                        </div>

                        {/* Phase Info */}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2 group-hover:text-attijari-orange transition-colors">
                            {plan.phase}
                          </h3>
                          {plan.note && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                              {plan.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Dates */}
                      {plan.startDate && (
                        <div className="shrink-0 text-right">
                          <div className="bg-orange-50 dark:bg-orange-900 px-4 py-3 rounded-lg border border-orange-200 dark:border-orange-600">
                            <p className="text-xs text-attijari-orange font-semibold mb-1">DÉBUT</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {new Date(plan.startDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          {plan.endDate && (
                            <div className="mt-3 text-xs dark:text-gray-300">
                              <p className="font-semibold mb-1">FIN</p>
                              <p>{new Date(plan.endDate).toLocaleDateString('fr-FR')}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Duration Bar */}
                    {plan.startDate && plan.endDate && (
                      <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-attijari-orange rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Pas d'information de planning</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Le calendrier prévisionnel apparaîtra ici</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
