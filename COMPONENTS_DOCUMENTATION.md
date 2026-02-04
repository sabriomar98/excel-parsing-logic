# Advanced Components Documentation

## Vue d'ensemble

Vous avez maintenant une suite complète de composants UI avancés pour créer des interfaces modernes et réactives.

## Composants Disponibles

### 1. **DataTable** - Tableau Avancé
Utilisé pour afficher de grandes quantités de données avec tri, pagination et filtrage.

```tsx
import { DataTable } from '@/components/ui/advanced-table'
import { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<YourData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
]

<DataTable
  columns={columns}
  data={data}
  pageSize={10}
  title="Projects"
  description="Manage all your projects"
/>
```

**Fonctionnalités:**
- Tri multi-colonnes (cliquer sur les en-têtes)
- Pagination automatique
- Recherche globale
- Alternance de couleurs de lignes
- Responsive design

### 2. **AdvancedStat** - Statistique Avancée
Pour afficher des KPIs avec tendances et icônes.

```tsx
import { AdvancedStat } from '@/components/ui/advanced-stats'
import { TrendingUp } from 'lucide-react'

<AdvancedStat
  label="Total Projects"
  value={42}
  icon={<TrendingUp className="h-6 w-6" />}
  color="blue"
  trend={{ direction: 'up', percentage: 12 }}
  subtext="vs last month"
/>
```

**Couleurs disponibles:** blue, green, yellow, red, purple

### 3. **ProgressCard** - Carte de Progression
Pour visualiser les progressions avec barres animées.

```tsx
import { ProgressCard } from '@/components/ui/advanced-stats'

<ProgressCard
  title="Imputation Status"
  items={[
    { label: 'Completed', value: 45, max: 100, color: 'green' },
    { label: 'In Progress', value: 30, max: 100, color: 'yellow' },
    { label: 'Pending', value: 25, max: 100, color: 'red' },
  ]}
/>
```

### 4. **ActivityTimeline** - Fil d'Activité
Pour afficher une chronologie d'événements avec statuts.

```tsx
import { ActivityTimeline } from '@/components/ui/activity-components'

<ActivityTimeline
  items={[
    {
      id: '1',
      type: 'upload',
      title: 'File Uploaded',
      description: 'Project_2025.xlsx',
      timestamp: '2 hours ago',
      status: 'success',
    },
    // ...
  ]}
/>
```

### 5. **MetricsGrid** - Grille de Métriques
Pour afficher plusieurs métriques dans une grille responsive.

```tsx
import { MetricsGrid } from '@/components/ui/activity-components'

<MetricsGrid
  items={[
    { id: '1', title: 'Total JH', value: 1250, unit: 'hours', color: 'blue' },
    { id: '2', title: 'Projects', value: 42, color: 'green' },
    { id: '3', title: 'Collaborators', value: 18, color: 'purple' },
    { id: '4', title: 'Pending', value: 5, color: 'red' },
  ]}
/>
```

### 6. **AdvancedFilter** - Filtre Avancé
Pour filtrer les données avec plusieurs critères.

```tsx
import { AdvancedFilter } from '@/components/ui/filter-components'

const [filters, setFilters] = useState({})

<AdvancedFilter
  filters={[
    {
      name: 'Status',
      options: [
        { id: '1', label: 'Imputed', value: 'impute' },
        { id: '2', label: 'Partial', value: 'partial' },
      ],
    },
  ]}
  onFilterChange={setFilters}
  searchPlaceholder="Search projects..."
/>
```

### 7. **PageContainer** - Conteneur de Page
Wrapper pour garantir que le contenu couvre toute la largeur avec padding.

```tsx
import { PageContainer } from '@/components/layout/page-container'

<PageContainer>
  {/* Your content here */}
</PageContainer>
```

## Mises à jour des Pages

### Pages Mises à Jour:
1. **Dashboard** - Utilise PageContainer et AdvancedStats
2. **Projects** - Full-width avec card grid
3. **Analytics** - Utilise DataTable pour projets et collaborateurs
4. **Upload** - Full-width avec meilleure présentation

## Tailwind Classes Utilisées

### Largeur complète:
```tailwind
w-full           # Largeur 100%
min-h-screen     # Hauteur minimum écran
```

### Padding:
```tailwind
px-6 md:px-8 lg:px-10   # Padding horizontal responsive
py-8                     # Padding vertical
```

### Couleurs:
```tailwind
bg-blue-50, bg-green-50, bg-yellow-50, bg-red-50, bg-purple-50
text-blue-600, text-green-600, etc.
```

### Responsive:
```tailwind
grid-cols-1 md:grid-cols-2 lg:grid-cols-4    # Grilles responsive
```

## Best Practices

1. **DataTable**: Utilisez pour les listes de 50+ éléments
2. **AdvancedStat**: Pour afficher les KPIs importants
3. **ProgressCard**: Pour montrer les étapes ou pourcentages
4. **ActivityTimeline**: Pour les journaux ou historiques
5. **AdvancedFilter**: Combinez avec DataTable pour les recherches avancées

## Responsive Design

Tous les composants sont optimisés pour:
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

Le padding et les grilles s'ajustent automatiquement selon la taille de l'écran.

## Couleurs et Accessibilité

- Utilisation cohérente des couleurs Tailwind
- Contraste suffisant pour l'accessibilité
- Support du mode sombre via CSS custom properties

## Performance

- Utilisation de `react-table` pour les tableaux (virtualisation possible)
- Pagination intégrée pour les grandes listes
- Images optimisées et lazy loading

## Exemples Complets

Voir les pages mises à jour:
- `/app/(protected)/dashboard/page.tsx`
- `/app/(protected)/analytics/page.tsx`
- `/app/(protected)/projects/page.tsx`
- `/app/(protected)/upload/page.tsx`
