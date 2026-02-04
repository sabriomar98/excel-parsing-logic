# 🚀 Quick Start Guide - Nouveaux Composants

## Installation Rapide

Tous les composants sont déjà intégrés. Pas d'installation supplémentaire nécessaire!

---

## 5 Minutes Tutorial

### 1. Créer une Page Full-Width

```tsx
import { PageContainer } from '@/components/layout/page-container'

export default function MyPage() {
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-8">Mon Contenu</h1>
      {/* Your content here */}
    </PageContainer>
  )
}
```

✅ Le contenu couvre automatiquement 100% de la largeur avec padding responsive

---

### 2. Ajouter des Statistiques

```tsx
import { AdvancedStat } from '@/components/ui/advanced-stats'
import { TrendingUp, Users } from 'lucide-react'

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <AdvancedStat
    label="Total Projects"
    value={42}
    icon={<TrendingUp className="h-6 w-6" />}
    color="blue"
    trend={{ direction: 'up', percentage: 12 }}
  />
  
  <AdvancedStat
    label="Team Members"
    value={18}
    icon={<Users className="h-6 w-6" />}
    color="green"
  />
</div>
```

✅ Statistiques avec icônes et tendances

---

### 3. Afficher un Tableau Avancé

```tsx
import { DataTable } from '@/components/ui/advanced-table'
import { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded ${
        row.getValue('status') === 'active' 
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {row.getValue('status')}
      </span>
    ),
  },
]

const data = [
  { name: 'John', email: 'john@example.com', status: 'active' },
  { name: 'Jane', email: 'jane@example.com', status: 'inactive' },
]

<DataTable 
  columns={columns} 
  data={data} 
  pageSize={10}
  title="Users"
  description="Manage all users"
/>
```

✅ Tableau avec tri, pagination et recherche automatique

---

### 4. Ajouter des Filtres

```tsx
import { AdvancedFilter } from '@/components/ui/filter-components'
import { useState } from 'react'

const [filters, setFilters] = useState({})

<AdvancedFilter
  filters={[
    {
      name: 'Status',
      options: [
        { id: '1', label: 'Active', value: 'active' },
        { id: '2', label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'Role',
      options: [
        { id: '1', label: 'Admin', value: 'admin' },
        { id: '2', label: 'User', value: 'user' },
      ],
    },
  ]}
  onFilterChange={setFilters}
/>

// Filtrer les données
const filteredData = data.filter(item => {
  if (filters.status && !filters.status.includes(item.status)) return false
  if (filters.role && !filters.role.includes(item.role)) return false
  return true
})
```

✅ Filtres multi-critères avec recherche

---

### 5. Progression et Métriques

```tsx
import { ProgressCard } from '@/components/ui/advanced-stats'
import { MetricsGrid } from '@/components/ui/activity-components'

<ProgressCard
  title="Imputation Progress"
  items={[
    { label: 'Analysis', value: 100, max: 100, color: 'green' },
    { label: 'Processing', value: 75, max: 100, color: 'blue' },
    { label: 'Validation', value: 40, max: 100, color: 'yellow' },
  ]}
/>

<MetricsGrid
  items={[
    { id: '1', title: 'Total JH', value: 2450, unit: 'hours', color: 'blue' },
    { id: '2', title: 'Projects', value: 28, color: 'green' },
    { id: '3', title: 'Collaborators', value: 18, color: 'purple' },
    { id: '4', title: 'Pending', value: 5, color: 'red' },
  ]}
/>
```

✅ Visualisations de progression et KPIs

---

## 🎨 Couleurs Disponibles

```tsx
color="blue"      // Bleu (défaut)
color="green"     // Vert (succès)
color="yellow"    // Jaune (avertissement)
color="red"       // Rouge (erreur)
color="purple"    // Violet (info)
```

---

## 📱 Responsive Classes

```tsx
// Grilles
grid-cols-1              // 1 colonne sur mobile
md:grid-cols-2           // 2 colonnes sur tablet
lg:grid-cols-4           // 4 colonnes sur desktop

// Padding
px-6 md:px-8 lg:px-10    // Padding responsive
py-8                     // Padding vertical

// Texte
text-lg md:text-xl lg:text-2xl
```

---

## 💡 Cas d'Utilisation Courants

### Dashboard
```tsx
<PageContainer>
  <MetricsGrid items={metrics} />
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
    <ProgressCard />
    <ActivityTimeline />
  </div>
</PageContainer>
```

### Liste avec Filtrage
```tsx
<PageContainer>
  <AdvancedFilter filters={filters} onFilterChange={setFilters} />
  <DataTable columns={columns} data={filteredData} />
</PageContainer>
```

### Statistiques
```tsx
<PageContainer>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <AdvancedStat />
    <AdvancedStat />
    <AdvancedStat />
    <AdvancedStat />
  </div>
</PageContainer>
```

---

## 🔄 Workflow Typique

```
1. Créer une page avec PageContainer
   ↓
2. Ajouter les statistiques (AdvancedStat)
   ↓
3. Ajouter les filtres (AdvancedFilter)
   ↓
4. Afficher les données (DataTable)
   ↓
5. Ajouter une progression (ProgressCard)
```

---

## 🛠️ Commandes Utiles

```bash
# Vérifier les erreurs TypeScript
npm run type-check

# Builder le projet
npm run build

# Lancer en développement
npm run dev

# Formater le code
npm run format
```

---

## 📖 Documentation Complète

Pour plus de détails:
- **COMPONENTS_DOCUMENTATION.md** - Guide complet
- **ADVANCED_COMPONENTS_EXAMPLES.tsx** - 7 exemples
- **CHANGELOG_UI_IMPROVEMENTS.md** - Résumé des modifications

---

## ❓ FAQ

**Q: Puis-je personnaliser les couleurs?**
A: Oui! Modifiez directement les classes Tailwind dans les composants ou créez des variants.

**Q: Comment ajouter plus de colonnes au tableau?**
A: Ajoutez plus d'objets au tableau `columns` avec la structure ColumnDef.

**Q: Est-ce responsive?**
A: Oui! Tous les composants s'adaptent automatiquement à tous les écrans.

**Q: Puis-je exporter les données du tableau?**
A: Actuellement non, mais c'est facile à ajouter (voir prochaines étapes).

**Q: Comment intégrer avec une API?**
A: Utilisez `useQuery` de React Query et passez les données au composant.

---

## 🎓 Exemple Complet

```tsx
'use client'

import { PageContainer } from '@/components/layout/page-container'
import { DataTable } from '@/components/ui/advanced-table'
import { AdvancedStat, ProgressCard } from '@/components/ui/advanced-stats'
import { MetricsGrid } from '@/components/ui/activity-components'
import { AdvancedFilter } from '@/components/ui/filter-components'
import { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { TrendingUp, Users } from 'lucide-react'

interface Project {
  id: string
  name: string
  status: 'completed' | 'in-progress' | 'pending'
  progress: number
}

const columns: ColumnDef<Project>[] = [
  { accessorKey: 'name', header: 'Project Name' },
  { 
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const colors: Record<string, string> = {
        'completed': 'bg-green-100 text-green-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        'pending': 'bg-yellow-100 text-yellow-800',
      }
      return <span className={`px-2 py-1 rounded ${colors[status]}`}>{status}</span>
    },
  },
  { 
    accessorKey: 'progress', 
    header: 'Progress',
    cell: ({ row }) => `${row.getValue('progress')}%`,
  },
]

const data: Project[] = [
  { id: '1', name: 'Project A', status: 'completed', progress: 100 },
  { id: '2', name: 'Project B', status: 'in-progress', progress: 75 },
  { id: '3', name: 'Project C', status: 'pending', progress: 30 },
]

export default function ProjectsDashboard() {
  const [filters, setFilters] = useState({})

  const filteredData = data.filter(item => {
    const statusFilter = (filters as any)?.status
    if (statusFilter && !statusFilter.includes(item.status)) return false
    return true
  })

  return (
    <PageContainer>
      <h1 className="text-4xl font-bold mb-8">Projects Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AdvancedStat label="Total Projects" value={data.length} color="blue" icon={<TrendingUp className="h-6 w-6" />} />
        <AdvancedStat label="Completed" value={data.filter(p => p.status === 'completed').length} color="green" />
        <AdvancedStat label="In Progress" value={data.filter(p => p.status === 'in-progress').length} color="yellow" />
      </div>

      {/* Progress */}
      <ProgressCard
        title="Overall Status"
        items={[
          { label: 'Completed', value: 1, max: 3, color: 'green' },
          { label: 'In Progress', value: 1, max: 3, color: 'blue' },
          { label: 'Pending', value: 1, max: 3, color: 'yellow' },
        ]}
      />

      {/* Metrics */}
      <MetricsGrid
        items={[
          { id: '1', title: 'Avg Progress', value: '68%', color: 'blue' },
          { id: '2', title: 'On Time', value: '2/3', color: 'green' },
        ]}
      />

      {/* Filter & Table */}
      <div className="mt-8 space-y-6">
        <AdvancedFilter
          filters={[
            {
              name: 'Status',
              options: [
                { id: '1', label: 'Completed', value: 'completed' },
                { id: '2', label: 'In Progress', value: 'in-progress' },
                { id: '3', label: 'Pending', value: 'pending' },
              ],
            },
          ]}
          onFilterChange={setFilters}
        />
        <DataTable columns={columns} data={filteredData} pageSize={10} />
      </div>
    </PageContainer>
  )
}
```

✅ **Prêt à utiliser!** Copiez-collez ce code et adaptez à votre besoin

---

**Version**: 1.0
**Last Updated**: 31 Janvier 2026
**Status**: ✅ Production Ready
