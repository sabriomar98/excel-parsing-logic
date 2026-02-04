'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function ImputationStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ['userStatus'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="p-4 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Chargement...</span>
      </Card>
    );
  }

  const user = data?.user;
  const isImputer = user?.isImputer;

  return (
    <Card
      className={`p-4 flex items-start gap-3 ${
        isImputer
          ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
      }`}
    >
      {isImputer ? (
        <>
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 dark:text-green-300">
              ✓ Utilisateur Imputeur
            </p>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              Vous avez téléchargé des fichiers d'instruction et pouvez gérer les imputations.
            </p>
          </div>
        </>
      ) : (
        <>
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-300">
              ⚠ Utilisateur Non-Imputeur
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Vous n'avez pas encore téléchargé de fichiers. Téléchargez un fichier pour devenir imputeur.
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
