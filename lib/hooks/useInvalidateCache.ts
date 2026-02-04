import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook personnalisé pour gérer les invalidations de cache de manière centralisée
 * Garantit que toutes les données sont synchronisées après chaque mutation
 */
export function useInvalidateCache() {
  const queryClient = useQueryClient();

  /**
   * Invalide tous les caches liés aux projets
   * À utiliser après : upload, suppression de projet, modification de projet
   */
  const invalidateProjects = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['projects', 'all'] });
  };

  /**
   * Invalide tous les caches liés aux collaborateurs
   * À utiliser après : modification de collaborateur, upload, suppression
   */
  const invalidateCollaborators = () => {
    queryClient.invalidateQueries({ queryKey: ['all-collaborators'] });
  };

  /**
   * Invalide tous les caches liés aux imputations quotidiennes
   * À utiliser après : modification d'imputation, upload avec génération d'imputations
   */
  const invalidateDailyImputations = () => {
    queryClient.invalidateQueries({ queryKey: ['daily-imputation'] });
  };

  /**
   * Invalide tous les caches liés aux analytics
   * À utiliser après : tout changement qui affecte les statistiques
   */
  const invalidateAnalytics = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['analytics', 'cumulation'] });
  };

  /**
   * Invalide tous les caches utilisateur
   * À utiliser après : login, logout, mise à jour profil
   */
  const invalidateUser = () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    queryClient.invalidateQueries({ queryKey: ['userStatus'] });
  };

  /**
   * Invalide TOUS les caches de l'application
   * À utiliser après des opérations majeures (upload, suppression)
   */
  const invalidateAll = () => {
    invalidateProjects();
    invalidateCollaborators();
    invalidateDailyImputations();
    invalidateAnalytics();
    // Ne pas invalider user pour éviter des requêtes inutiles
  };

  /**
   * Invalide un projet spécifique et ses dépendances
   */
  const invalidateProject = (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    invalidateProjects();
    invalidateAnalytics();
  };

  /**
   * Invalide après une opération d'upload
   * Upload = nouveau projet + collaborateurs + imputations + stats
   */
  const invalidateAfterUpload = () => {
    invalidateProjects();
    invalidateCollaborators();
    invalidateDailyImputations();
    invalidateAnalytics();
  };

  /**
   * Invalide après une modification d'imputation
   * Imputation = collaborateurs + projet + imputations + stats
   */
  const invalidateAfterImputation = (projectId?: string) => {
    invalidateDailyImputations();
    invalidateCollaborators();
    if (projectId) {
      invalidateProject(projectId);
    } else {
      invalidateProjects();
    }
    invalidateAnalytics();
  };

  /**
   * Invalide après une suppression de projet
   * Suppression = projets + collaborateurs + imputations + stats
   */
  const invalidateAfterDelete = () => {
    invalidateProjects();
    invalidateCollaborators();
    invalidateDailyImputations();
    invalidateAnalytics();
  };

  return {
    // Invalidations granulaires
    invalidateProjects,
    invalidateCollaborators,
    invalidateDailyImputations,
    invalidateAnalytics,
    invalidateUser,
    invalidateProject,
    
    // Invalidations groupées par action
    invalidateAll,
    invalidateAfterUpload,
    invalidateAfterImputation,
    invalidateAfterDelete,
    
    // Accès direct au queryClient si besoin
    queryClient,
  };
}
