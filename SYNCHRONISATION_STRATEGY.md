# Stratégie de Synchronisation des Données

## Vue d'ensemble

L'application utilise une stratégie centralisée de synchronisation des données via React Query pour garantir que toutes les vues restent à jour automatiquement sans nécessiter de rafraîchissement manuel.

## Hook Centralisé : `useInvalidateCache`

### Localisation
`lib/hooks/useInvalidateCache.ts`

### Méthodes Disponibles

#### Méthodes Granulaires
- `invalidateProjects()` - Invalide tous les caches de projets
- `invalidateProject(projectId)` - Invalide un projet spécifique
- `invalidateCollaborators()` - Invalide les caches de collaborateurs
- `invalidateDailyImputations()` - Invalide les caches d'imputations quotidiennes
- `invalidateAnalytics()` - Invalide les caches d'analytiques
- `invalidateUser()` - Invalide les caches utilisateur

#### Méthodes Groupées (Actions Complètes)
- `invalidateAfterUpload()` - À utiliser après l'upload d'un fichier Excel
  - Invalide : projets, collaborateurs, imputations quotidiennes, analytics
  
- `invalidateAfterImputation(projectId?)` - À utiliser après la mise à jour d'une imputation
  - Invalide : imputations quotidiennes, collaborateurs, projet spécifique (si fourni), analytics
  
- `invalidateAfterDelete()` - À utiliser après la suppression d'un projet
  - Invalide : projets, collaborateurs, imputations quotidiennes, analytics
  
- `invalidateAll()` - Invalide tous les caches (à utiliser avec parcimonie)

## Points d'Invalidation dans l'Application

### 1. Upload de Fichier
**Fichier** : `app/(protected)/upload/page.tsx`
**Mutation** : `uploadMutation`
**Invalidation** : `invalidateAfterUpload()`
**Raison** : Nouveaux projets, collaborateurs et imputations créés

### 2. Mise à Jour d'Imputation (Page Projet)
**Fichier** : `app/(protected)/projects/[id]/page.tsx`
**Mutation** : `imputationMutation`
**Invalidation** : `invalidateAfterImputation(projectId)`
**Raison** : Statut d'imputation modifié pour plusieurs collaborateurs

### 3. Suppression de Projet (Page Projet)
**Fichier** : `app/(protected)/projects/[id]/page.tsx`
**Mutation** : `deleteProjectMutation`
**Invalidation** : `invalidateAfterDelete()`
**Raison** : Projet et toutes ses données associées supprimés

### 4. Suppression de Projet (Liste Projets)
**Fichier** : `app/(protected)/projects/page.tsx`
**Mutation** : `deleteProjectMutation`
**Invalidation** : `invalidateAfterDelete()`
**Raison** : Projet supprimé de la liste

### 5. Mise à Jour d'Imputation (Table Quotidienne)
**Fichier** : `components/ui/daily-imputation-table.tsx`
**Action** : `handleImputationToggle`
**Invalidation** : `invalidateAfterImputation()`
**Raison** : Imputation individuelle modifiée

## Configuration React Query

### Localisation
`app/providers.tsx`

### Paramètres Globaux
```typescript
{
  staleTime: 1000 * 30,           // 30 secondes
  refetchOnWindowFocus: true,      // Rafraîchir au focus de la fenêtre
  refetchOnMount: true,            // Rafraîchir au montage du composant
  refetchOnReconnect: true         // Rafraîchir à la reconnexion
}
```

## Clés de Cache Utilisées

### Projets
- `['projects']` - Liste de tous les projets
- `['projects', 'all']` - Alternative pour liste complète
- `['projects', projectId]` - Projet spécifique

### Collaborateurs
- `['all-collaborators']` - Tous les collaborateurs avec leurs projets

### Imputations Quotidiennes
- `['daily-imputation']` - Toutes les imputations
- `['daily-imputation', collaboratorId]` - Imputations d'un collaborateur

### Analytics
- `['analytics']` - Données analytiques générales
- `['analytics', 'cumulation']` - Cumulation des charges

### Utilisateur
- `['user']` - Données utilisateur
- `['auth', 'me']` - Information d'authentification
- `['userStatus']` - Statut utilisateur

## Bonnes Pratiques

### ✅ À FAIRE
1. **Toujours utiliser le hook centralisé** pour les invalidations
2. **Choisir la méthode groupée appropriée** (invalidateAfterUpload, etc.)
3. **Passer le projectId** quand disponible pour des invalidations ciblées
4. **Invalider après chaque mutation** qui modifie les données

### ❌ À ÉVITER
1. **Ne pas appeler queryClient.invalidateQueries directement** dans les composants
2. **Ne pas utiliser invalidateAll()** sauf en cas de changement majeur
3. **Ne pas oublier d'invalider** après une mutation
4. **Ne pas invalider trop de caches** pour des changements mineurs

## Flux de Données Typique

### Upload de Fichier Excel
```
User Upload → API créé Projet → uploadMutation.onSuccess →
invalidateAfterUpload() → React Query rafraîchit automatiquement :
  - Liste des projets (/projects)
  - Dashboard stats (/dashboard)
  - Liste des collaborateurs (/imputation)
  - Analytics
```

### Mise à Jour d'Imputation
```
User Toggle Imputation → API met à jour DailyImputation →
handleImputationToggle → invalidateAfterImputation() →
React Query rafraîchit automatiquement :
  - Table des imputations
  - Statut du collaborateur
  - Stats du projet
  - Analytics
```

### Suppression de Projet
```
User Delete Projet → API supprime Projet (cascade) →
deleteProjectMutation.onSuccess → invalidateAfterDelete() →
React Query rafraîchit automatiquement :
  - Liste des projets
  - Dashboard stats
  - Liste des collaborateurs
  - Analytics
→ Router redirect vers /projects
```

## Test de la Synchronisation

Pour vérifier que la synchronisation fonctionne :

1. **Test Upload** :
   - Ouvrir `/projects` dans un onglet
   - Ouvrir `/dashboard` dans un autre onglet
   - Uploader un fichier depuis `/upload`
   - Vérifier que les deux onglets se mettent à jour automatiquement

2. **Test Imputation** :
   - Ouvrir la page d'un projet
   - Ouvrir `/imputation` dans un autre onglet
   - Marquer une imputation comme complète
   - Vérifier que le statut se met à jour dans les deux onglets

3. **Test Suppression** :
   - Ouvrir `/projects`
   - Ouvrir `/dashboard` dans un autre onglet
   - Supprimer un projet
   - Vérifier que les stats et la liste se mettent à jour automatiquement

## Dépannage

### Les données ne se synchronisent pas

1. **Vérifier que le hook est importé** :
   ```typescript
   import { useInvalidateCache } from '@/lib/hooks/useInvalidateCache';
   ```

2. **Vérifier que la méthode est appelée** dans `onSuccess` de la mutation :
   ```typescript
   const { invalidateAfterUpload } = useInvalidateCache();
   
   const mutation = useMutation({
     mutationFn: ...,
     onSuccess: () => {
       invalidateAfterUpload(); // ✅ Appelée
       toast.success('...');
     }
   });
   ```

3. **Vérifier les clés de cache** dans les queries :
   ```typescript
   useQuery({
     queryKey: ['projects'], // Doit correspondre aux clés invalidées
     queryFn: ...
   });
   ```

4. **Vérifier la configuration React Query** dans `app/providers.tsx`

### Performance

Si l'application devient lente :

1. **Utiliser des méthodes granulaires** au lieu de `invalidateAll()`
2. **Passer le projectId** aux méthodes pour des invalidations ciblées
3. **Augmenter le staleTime** dans `app/providers.tsx` si nécessaire
4. **Utiliser des mutations optimistes** pour les mises à jour fréquentes

## Maintenance Future

Lors de l'ajout de nouvelles fonctionnalités :

1. **Nouvelle mutation** → Ajouter l'invalidation appropriée dans `onSuccess`
2. **Nouvelle clé de cache** → Ajouter une méthode dans `useInvalidateCache`
3. **Nouveau type de donnée** → Créer une méthode `invalidateAfter*` appropriée
4. **Test** → Vérifier la synchronisation entre les vues après chaque mutation

---

*Dernière mise à jour : Décembre 2024*
