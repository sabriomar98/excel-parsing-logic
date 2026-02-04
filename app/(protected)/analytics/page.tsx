'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingUp, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/advanced-table';

interface ProjectData {
  projectId: string;
  title: string;
  filiale: string;
  charges: {
    total: number;
    [key: string]: number;
  };
}

interface CollaboratorData {
  name: string;
  charges: {
    total: number;
    [key: string]: number;
  };
}

const projectColumns: ColumnDef<ProjectData>[] = [
  {
    accessorKey: 'title',
    header: 'Project',
    cell: ({ row }) => <span className="font-medium">{row.getValue('title') || 'Untitled'}</span>,
  },
  {
    accessorKey: 'filiale',
    header: 'Filiale',
  },
  {
    accessorKey: 'charges.total',
    header: 'Total JH',
    cell: ({ row }) => <span className="font-semibold text-right">{(row.original.charges.total || 0).toFixed(1)}</span>,
  },
];

const collaboratorColumns: ColumnDef<CollaboratorData>[] = [
  {
    accessorKey: 'name',
    header: 'Collaborator',
    cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'charges.total',
    header: 'Total JH',
    cell: ({ row }) => <span className="font-semibold text-right">{(row.original.charges.total || 0).toFixed(1)}</span>,
  },
];

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'cumulation'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/cumulation');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  const byPhase = data?.byPhase || {};
  const byProject = (data?.byProject || []).sort((a: any, b: any) => (b.charges.total || 0) - (a.charges.total || 0));
  const byCollaborator = (data?.byCollaborator || []).sort((a: any, b: any) => (b.charges.total || 0) - (a.charges.total || 0));

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-attijari-orange" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">Analytics & Cumulation</h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-slate-900 border-orange-100 dark:border-orange-900/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-200 dark:bg-orange-900/50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-attijari-orange dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total JH</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{byPhase.total?.toFixed(1) || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-slate-900 border-purple-100 dark:border-purple-900/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-200 dark:bg-purple-900/50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Collaborators</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{byCollaborator.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charges by Phase */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Total JH by Phase</h2>
        <div className="space-y-4">
          {Object.entries(byPhase)
            .filter(([key]) => key !== 'total')
            .map(([phase, hours]: [string, any]) => {
              const percentage = Math.min((hours / (byPhase.total || 1)) * 100, 100);
              return (
                <div key={phase} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {phase.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {hours.toFixed(1)} JH ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-attijari-orange to-orange-400 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Projects Table */}
      <Card className="p-6 mb-8">
        <DataTable
          columns={projectColumns}
          data={byProject}
          pageSize={10}
          title="Projects Summary"
          description="Detailed breakdown of total working hours per project"
        />
      </Card>

      {/* Collaborators Table */}
      <Card className="p-6">
        <DataTable
          columns={collaboratorColumns}
          data={byCollaborator.slice(0, 100)}
          pageSize={10}
          title="Collaborators Summary"
          description="Detailed breakdown of total working hours per collaborator"
        />
      </Card>
    </PageContainer>
  );
}
