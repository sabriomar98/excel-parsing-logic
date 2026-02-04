'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, FileText, Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { toast } from 'sonner';
import { DeleteProjectDialog } from '@/components/dialogs/delete-project-dialog';
import { useInvalidateCache } from '@/lib/hooks/useInvalidateCache';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL_STATUS');
  const [filiale, setFiliale] = useState('ALL_FILIALE');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { invalidateAfterDelete } = useInvalidateCache();

  const { data, isLoading } = useQuery({
    queryKey: ['projects', { search, status, filiale }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'ALL_STATUS') params.append('status', status);
      if (filiale !== 'ALL_FILIALE') params.append('filiale', filiale);

      const response = await fetch(`/api/projects?${params}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
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
      setIsDeleteDialogOpen(false);
      setDeleteProjectId(null);
      invalidateAfterDelete();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete project'
      );
    },
  });

  const projects = data?.projects || [];
  const uniqueFilialsSet = new Set(projects.map((p: any) => p.filiale));
  const uniqueFilialsArray = Array.from(uniqueFilialsSet);

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and track all instruction sheets
          </p>
        </div>
        <Link href="/upload">
          <Button>Upload File</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filiale
            </label>
            <Select value={filiale} onValueChange={setFiliale}>
              <SelectTrigger>
                <SelectValue placeholder="All Filialsee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_FILIALE">All Filialsee</SelectItem>
                {uniqueFilialsArray.map((f: any) => (
                  <SelectItem key={f as string} value={String(f)}>
                    {String(f)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_STATUS">All Status</SelectItem>
                <SelectItem value="IMPUTE">Imputed</SelectItem>
                <SelectItem value="PARTIEL">Partial</SelectItem>
                <SelectItem value="NON_IMPUTE">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-attijari-orange" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <FileText className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {search || status !== 'ALL_STATUS' || filiale !== 'ALL_FILIALE'
              ? 'Try adjusting your filters'
              : 'Start by uploading your first instruction file'}
          </p>
          <Link href="/upload">
            <Button>Upload File</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project: any) => {
              const latestVersion = project.versions[0];
              return (
                <Card key={project.id} className="p-6 hover:shadow-lg transition h-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {project.title || 'Untitled'}
                        </h3>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded">
                          v{latestVersion?.versionNumber || 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Filiale</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {project.filiale}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Reference</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {project.reference}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total JH</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {latestVersion?.chargeTotale?.toFixed(1) || '0'} JH
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Collaborators</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {latestVersion?.collaborators?.length || 0}
                          </p>
                        </div>
                      </div>
                    </Link>

                    <div className="ml-4 flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          latestVersion?.status === 'IMPUTE'
                            ? 'bg-green-100 text-green-800'
                            : latestVersion?.status === 'PARTIEL'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {latestVersion?.status || 'UNKNOWN'}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteProjectId(project.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        disabled={deleteProjectMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Delete Project Dialog */}
          {deleteProjectId && (
            <DeleteProjectDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              onConfirm={() => {
                if (deleteProjectId) {
                  deleteProjectMutation.mutate(deleteProjectId);
                }
              }}
              projectName={
                projects.find((p: any) => p.id === deleteProjectId)?.title ||
                'Untitled Project'
              }
              versionCount={
                projects.find((p: any) => p.id === deleteProjectId)?.versions
                  ?.length || 0
              }
              isLoading={deleteProjectMutation.isPending}
            />
          )}
        </>
      )}
    </PageContainer>
  );
}
