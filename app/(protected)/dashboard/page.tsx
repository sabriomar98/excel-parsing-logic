'use client';

import React from "react"
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, TrendingUp, FileCheck, AlertCircle, ArrowRight, Zap, CheckCircle, Clock, Calendar } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';

export default function DashboardPage() {
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', 'cumulation'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/cumulation');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  const user = userData?.user;
  const projects = projectsData?.projects || [];
  const stats = analyticsData?.byPhase || {};

  // Calculate status counts
  const statusCounts = {
    impute: projects.filter(
      (p: any) => p.versions[0]?.status === 'IMPUTE'
    ).length,
    partiel: projects.filter(
      (p: any) => p.versions[0]?.status === 'PARTIEL'
    ).length,
    nonImpute: projects.filter(
      (p: any) => p.versions[0]?.status === 'NON_IMPUTE'
    ).length,
  };

  const totalProjects = projects.length;
  const recentProjects = projects.slice(0, 5);
  const completionRate = totalProjects > 0 ? Math.round((statusCounts.impute / totalProjects) * 100) : 0;

  return (
    <PageContainer>
      {/* Premium Header */}
      <div className="mb-12">
        <div className="space-y-2 mb-8">
          <h1 className="text-5xl font-bold text-gray-900">
            Bienvenue, {user?.name || 'Utilisateur'}
          </h1>
          <p className="text-lg text-gray-600">
            Gérez et suivez vos fiches d'instruction efficacement
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PremiumStatCard
            label="Total Projets"
            value={totalProjects}
            icon={FileCheck}
            color="blue"
            trend={+5}
          />
          <PremiumStatCard
            label="Terminés"
            value={statusCounts.impute}
            icon={CheckCircle}
            color="green"
            trend={+2}
          />
          <PremiumStatCard
            label="En Cours"
            value={statusCounts.partiel}
            icon={Clock}
            color="yellow"
            trend={-1}
          />
          <PremiumStatCard
            label="En Attente"
            value={statusCounts.nonImpute}
            icon={AlertCircle}
            color="red"
            trend={+3}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Projects Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Projets Récents</h2>
              <Link href="/projects">
                <button className="flex items-center gap-2 text-attijari-orange hover:text-attijari-red font-medium text-sm group">
                  Voir tout
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-attijari-orange" />
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">Aucun projet pour le moment</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Téléchargez votre premier fichier pour commencer</p>
                <Link href="/upload">
                  <Button className="mt-6 bg-attijari-orange hover:bg-attijari-red">
                    <Zap className="h-4 w-4 mr-2" />
                    Télécharger le Premier Fichier
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project: any, idx: number) => {
                  const latestVersion = project.versions[0];
                  const statusColor = {
                    IMPUTE: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/30',
                    PARTIEL: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
                    NON_IMPUTE: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30',
                  };

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                    >
                      <div className={`p-5 border rounded-xl transition-all duration-200 cursor-pointer group ${
                        statusColor[latestVersion?.status as keyof typeof statusColor] || 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-attijari-orange text-white flex items-center justify-center font-semibold text-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-attijari-orange transition-colors">
                                {project.title || 'Untitled'}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {project.filiale} • {project.reference}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ml-4 ${
                              latestVersion?.status === 'IMPUTE'
                                ? 'bg-green-600 text-white'
                                : latestVersion?.status === 'PARTIEL'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {latestVersion?.status === 'IMPUTE' ? '✓ Done' : latestVersion?.status === 'PARTIEL' ? '⊘ In Progress' : '⚠ Pending'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Completion Rate Card */}
          <div className="bg-linear-to-br from-attijari-orange to-attijari-red rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-orange-100 text-sm font-semibold mb-2">TAUX DE COMPLÉTION</p>
                <p className="text-5xl font-bold">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-200" />
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-orange-300 dark:bg-orange-900/50 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            <p className="text-orange-100 text-sm">
              {statusCounts.impute} sur {totalProjects} projets terminés
            </p>
          </div>

          {/* Top Phases Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">Top Phases par JH</h3>
            <div className="space-y-4">
              {Object.entries(stats)
                .filter(([key]) => key !== 'total')
                .sort((a, b) => (b[1] as any) - (a[1] as any))
                .slice(0, 4)
                .map(([phase, hours]: [string, any], idx: number) => (
                  <div key={phase} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/30 text-attijari-orange font-semibold flex items-center justify-center text-xs">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {phase.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-attijari-orange rounded-full"
                          style={{ width: `${Math.min((hours / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 ml-2">
                      {hours.toFixed(0)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ActionCard
            icon={Zap}
            title="Télécharger Fichier"
            description="Ajouter une nouvelle fiche d'instruction"
            href="/upload"
            color="blue"
          />
          <ActionCard
            icon={Calendar}
            title="Imputations"
            description="Suivre les imputations quotidiennes"
            href="/imputation"
            color="orange"
          />
          <ActionCard
            icon={FolderOpen}
            title="Voir Projets"
            description="Parcourir tous vos projets"
            href="/projects"
            color="green"
          />
          <ActionCard
            icon={BarChart3}
            title="Analytique"
            description="Voir les statistiques détaillées"
            href="/analytics"
            color="purple"
          />
        </div>
      </div>
    </PageContainer>
  );
}

function PremiumStatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'yellow' | 'red';
  trend: number;
}) {
  const colorMap = {
    blue: 'bg-orange-50 dark:bg-orange-950/20 text-attijari-orange border-orange-200 dark:border-orange-900/30',
    green: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30',
    red: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30',
  };

  const trendColor = trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className={`p-5 rounded-xl border transition-all hover:shadow-lg ${colorMap[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <Icon className="h-5 w-5" />
        <span className={`text-xs font-bold ${trendColor}`}>
          {trend >= 0 ? '+' : ''}{trend}
        </span>
      </div>
      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorMap = {
    blue: 'bg-attijari-orange',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  return (
    <Link href={href}>
      <div className={`group relative overflow-hidden rounded-xl p-6 text-white cursor-pointer transition-all hover:shadow-xl`}>
        <div className={`absolute inset-0 ${colorMap[color]} group-hover:scale-105 transition-transform duration-300`} />
        <div className="relative z-10">
          <Icon className="h-8 w-8 mb-3" />
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-white/90 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );
}

import { BarChart3, FolderOpen } from 'lucide-react';
