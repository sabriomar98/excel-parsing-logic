# 🎯 Charges Table - Guide d'Utilisation

## Qu'est-ce que le ChargesTable?

Un tableau **spécialisé** pour afficher et gérer les charges des collaborateurs par phases.

**Fonctionnalités:**
- ✅ Tri par colonnes (cliquer sur l'en-tête)
- ✅ Recherche globale de collaborateurs
- ✅ Sélection multi-lignes avec checkbox
- ✅ Colonnes par phase (Instr, Cadr, Conc, Admin, etc.)
- ✅ Calcul automatique des totaux
- ✅ Édition en ligne optionnelle
- ✅ Pagination automatique
- ✅ Footer avec totaux globaux

---

## Installation dans votre page

### 1. Importer le composant

```tsx
import { ChargesTable } from '@/components/ui/charges-table'
```

### 2. Préparer les données

```tsx
const collaborators = [
  {
    id: '1',
    name: 'Ahmed Mohamed',
    instr: 3,
    cadr: 0,
    conc: 0,
    admin: 0,
    tech: 1,
    dev: 2,
    testU: 0,
    testI: 5,
    assistR: 1,
    deploy: 0,
    assistP: 0,
  },
  // ... plus de collaborateurs
]
```

### 3. Utiliser le composant

```tsx
const [selectedCollaborators, setSelectedCollaborators] = React.useState(new Set<string>())

<ChargesTable
  data={collaborators}
  collaborators={collaborators}
  selectedCollaborators={selectedCollaborators}
  onSelectedChange={setSelectedCollaborators}
  title="Chiffrage Prévisionnel"
  description="Répartition des charges par phase"
  showSelectAll={true}
  editable={false}
/>
```

---

## Props Détaillés

```tsx
interface ChargesTableProps<TData> {
  // Données
  data: TData[]                                    // Les collaborateurs avec charges
  collaborators?: any[]                            // List pour les checkboxes
  
  // Sélection
  selectedCollaborators?: Set<string>              // Set des IDs sélectionnées
  onSelectedChange?: (selected: Set<string>) => void  // Callback au changement
  
  // Modification
  onImputationChange?: (collaboratorId: string, phaseKey: string, value: number) => void
  editable?: boolean                               // Autoriser l'édition en ligne
  
  // Affichage
  title?: string                                   // Titre du tableau
  description?: string                             // Sous-titre
  showSelectAll?: boolean                          // Afficher le checkbox "Select All"
}
```

---

## Exemple Complet d'Intégration

```tsx
'use client'

import React, { useState } from 'react'
import { ChargesTable } from '@/components/ui/charges-table'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function ProjectChargesPage({ versionData }: { versionData: any }) {
  const [selectedCollaborators, setSelectedCollaborators] = useState(new Set<string>())

  // Mutation pour marquer comme imputé
  const imputationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/imputation/mark', {
        method: 'POST',
        body: JSON.stringify({
          collaboratorIds: Array.from(selectedCollaborators),
          versionId: versionData.id,
        }),
      })
      if (!response.ok) throw new Error('Failed to mark as imputed')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Marked as imputed!')
      setSelectedCollaborators(new Set())
    },
  })

  // Mutation pour éditer une charge
  const editMutation = useMutation({
    mutationFn: async (data: { collaboratorId: string; phase: string; value: number }) => {
      const response = await fetch('/api/charges/update', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update')
      return response.json()
    },
  })

  const handleImputationChange = (collaboratorId: string, phaseKey: string, value: number) => {
    editMutation.mutate({ collaboratorId, phase: phaseKey, value })
  }

  return (
    <div>
      {/* Bouton d'action */}
      {selectedCollaborators.size > 0 && (
        <div className="mb-6">
          <Button
            onClick={() => imputationMutation.mutate()}
            disabled={imputationMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            Mark {selectedCollaborators.size} as Imputed
          </Button>
        </div>
      )}

      {/* Tableau */}
      <ChargesTable
        data={versionData.collaborators || []}
        collaborators={versionData.collaborators || []}
        selectedCollaborators={selectedCollaborators}
        onSelectedChange={setSelectedCollaborators}
        onImputationChange={handleImputationChange}
        title="Chiffrage Prévisionnel"
        description="Répartition des charges par phase"
        editable={false}  // Changer à true pour permettre l'édition
        showSelectAll={true}
      />
    </div>
  )
}
```

---

## 🎨 Améliorations vs Ancien Tableau

| Feature | Ancien | Nouveau |
|---------|--------|---------|
| **Tri** | ❌ Non | ✅ Oui (par colonne) |
| **Recherche** | ❌ Non | ✅ Oui (globale) |
| **Sélection** | ⚠️ Basique | ✅ Avancée (Select All) |
| **Pagination** | ❌ Non | ✅ Oui (10 par défaut) |
| **Édition** | ❌ Non | ✅ Oui (optionnelle) |
| **Totaux** | ❌ Non | ✅ Oui (par colonne) |
| **Responsive** | ⚠️ Partiel | ✅ Complet |
| **Design** | Basique | 🎨 Moderne |

---

## 📊 Cas d'Utilisation

### Cas 1: Affichage Simple (Read-Only)
```tsx
<ChargesTable
  data={collaborators}
  collaborators={collaborators}
  editable={false}
/>
```

### Cas 2: Sélection et Action
```tsx
<ChargesTable
  data={collaborators}
  collaborators={collaborators}
  selectedCollaborators={selectedCollaborators}
  onSelectedChange={setSelectedCollaborators}
  showSelectAll={true}
/>

{selectedCollaborators.size > 0 && (
  <Button onClick={handleMarkImputed}>
    Mark {selectedCollaborators.size} as Imputed
  </Button>
)}
```

### Cas 3: Édition En Ligne
```tsx
<ChargesTable
  data={collaborators}
  collaborators={collaborators}
  editable={true}
  onImputationChange={(id, phase, value) => {
    // Envoyer la mise à jour à l'API
    updateCharge(id, phase, value)
  }}
/>
```

### Cas 4: Combinaison (Sélection + Édition)
```tsx
<ChargesTable
  data={collaborators}
  collaborators={collaborators}
  selectedCollaborators={selectedCollaborators}
  onSelectedChange={setSelectedCollaborators}
  editable={true}
  onImputationChange={handleEditCharge}
  showSelectAll={true}
/>
```

---

## 🔍 Colonnes Automatiques

Le tableau génère automatiquement les colonnes suivantes:

```
┌─────────┬───────────────────────────────────────────────────────────┬───────┐
│ Select  │ Name │ Instr │ Cadr │ Conc │ Admin │ Tech │ Dev │ ...    │ Total │
├─────────┼───────────────────────────────────────────────────────────┼───────┤
│ [ ]     │ John │   3   │  0   │  0   │   0   │  1   │  2  │ ...    │  12   │
│ [✓]     │ Jane │   0   │  2   │  3   │   1   │  0   │  0  │ ...    │   8   │
├─────────┼───────────────────────────────────────────────────────────┼───────┤
│ TOTAL   │      │   3   │  2   │  3   │   1   │  1   │  2  │ ...    │  20   │
└─────────┴───────────────────────────────────────────────────────────┴───────┘
```

---

## 💡 Tips & Astuces

### Tri
Cliquer sur n'importe quel en-tête pour trier:
- 1ère clic: Ascendant (↑)
- 2ème clic: Descendant (↓)
- 3ème clic: Sans tri

### Recherche
Tapez le nom d'un collaborateur pour filtrer:
```
[Search] "Ahmed" → Affiche que Ahmed
```

### Sélection Multiple
- Cocher les checkboxes individuellement
- Ou cliquer "Select All" pour tout sélectionner

### Édition
Si `editable={true}`, les cellules deviennent éditables:
```tsx
<input type="number" value={3} onChange={...} />
```

---

## 📱 Responsive

Le tableau reste lisible sur:
- 📱 Mobile: Scroll horizontal nécessaire
- 📱 Tablet: Colonnes réduites
- 🖥️ Desktop: Affichage complet

---

## 🐛 Troubleshooting

**Q: Les totaux ne s'actualisent pas?**
A: Assurez-vous que les données ont les bonnes clés (instr, cadr, etc.)

**Q: La sélection ne fonctionne pas?**
A: Vérifiez que chaque collaborateur a un `id` unique

**Q: Je veux ajouter une colonne?**
A: Modifiez le tableau `phases` dans le composant

---

**Version**: 1.0
**Status**: ✅ Production Ready
**Last Updated**: 31 Janvier 2026
