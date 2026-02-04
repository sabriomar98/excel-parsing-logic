# 🌓 Système de Thème Dark/Light Mode - Attijariwafa Bank

## ✅ Changements Implémentés

### 1. **Composant ThemeToggle** 
Créé : `components/ui/theme-toggle.tsx`
- Bouton de basculement entre mode clair et mode sombre
- Icônes animées (Sun ☀️ / Moon 🌙)
- Gestion du hydration mismatch
- Tooltip au survol

### 2. **Intégration du ThemeProvider**
Modifié : `app/providers.tsx`
- Ajout du `ThemeProvider` de `next-themes`
- Configuration:
  - `attribute="class"` - utilise la classe `.dark`
  - `defaultTheme="system"` - suit les préférences système par défaut
  - `enableSystem` - détection automatique des préférences
  - `disableTransitionOnChange` - évite les flash pendant le changement

### 3. **Root Layout**
Modifié : `app/layout.tsx`
- Ajout de `suppressHydrationWarning` sur `<html>`
- Classes dynamiques sur `<body>`: `bg-background text-foreground`
- Support complet du système de design tokens

### 4. **Navbar avec ThemeToggle**
Modifié : `components/layout/navbar.tsx`
- Bouton ThemeToggle ajouté avant le dropdown utilisateur
- Toutes les classes adaptées pour le dark mode:
  - `bg-white` → `bg-white dark:bg-slate-900`
  - `text-slate-700` → `text-slate-700 dark:text-slate-300`
  - `hover:bg-slate-100` → `hover:bg-slate-100 dark:hover:bg-slate-800`
- Dropdown menu stylisé pour les deux thèmes
- Menu mobile adapté

### 5. **Layout Protégé**
Modifié : `app/(protected)/layout.tsx`
- Background gradient adapté:
  - Light: `from-slate-50 via-slate-50 to-blue-50/20`
  - Dark: `dark:from-slate-950 dark:via-slate-900 dark:to-slate-950`

## 📦 Dépendances

✅ `next-themes` - Déjà installé (v0.4.6)

## 🎨 Variables CSS Utilisées

Le système utilise les variables CSS définies dans `app/globals.css`:

### Mode Clair
```css
:root {
  --background: oklch(1 0 0);        /* Blanc */
  --foreground: oklch(0.145 0 0);    /* Presque noir */
  --card: oklch(1 0 0);              /* Blanc */
  --card-foreground: oklch(0.145 0 0); /* Presque noir */
  /* ... */
}
```

### Mode Sombre
```css
.dark {
  --background: oklch(0.145 0 0);    /* Presque noir */
  --foreground: oklch(0.985 0 0);    /* Blanc cassé */
  --card: oklch(0.145 0 0);          /* Presque noir */
  --card-foreground: oklch(0.985 0 0); /* Blanc cassé */
  /* ... */
}
```

## 🚀 Utilisation

### Pour l'utilisateur final
1. Cliquez sur l'icône 🌓 dans la navbar (à côté du profil utilisateur)
2. Le thème bascule entre clair et sombre
3. La préférence est sauvegardée automatiquement dans le localStorage

### Pour les développeurs

#### Utiliser le hook useTheme
```tsx
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

#### Classes Tailwind pour Dark Mode
```tsx
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
  Contenu adaptatif
</div>
```

## 🎯 Composants Adaptés

✅ **Navbar** - Entièrement adapté avec toutes les interactions
✅ **Layout Protégé** - Background gradient adapté
✅ **ThemeToggle** - Nouveau composant avec animations
❗ **Sidebar** - Déjà en mode sombre (pas de changements nécessaires)

## 🔄 Prochaines Étapes Recommandées

### Composants à adapter (si nécessaire):

1. **Pages Dashboard** (`app/(protected)/dashboard/page.tsx`)
   - Cartes blanches → `bg-white dark:bg-slate-800`
   - Textes → `text-gray-900 dark:text-gray-100`

2. **Pages Projets** (`app/(protected)/projects/[id]/page.tsx`)
   - Headers avec gradients (déjà bons)
   - Cards blanches à adapter

3. **Tables** (`components/ui/charges-table.tsx`, `components/ui/advanced-table.tsx`)
   - Lignes alternées
   - Headers de tableaux

4. **Composants UI** (`components/ui/`)
   - Card, Dialog, Dropdown, etc.
   - La plupart utilisent déjà les tokens CSS (automatiquement adaptés)

### Pattern à suivre pour adapter un composant:

```tsx
// AVANT
<div className="bg-white border-gray-200 text-gray-900">

// APRÈS
<div className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100">
```

### Classes communes à adapter:

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Backgrounds** |
| Fond principal | `bg-white` | `dark:bg-slate-900` |
| Fond secondaire | `bg-gray-50` | `dark:bg-slate-800` |
| Fond carte | `bg-gray-100` | `dark:bg-slate-700` |
| **Borders** |
| Border principal | `border-gray-200` | `dark:border-slate-700` |
| Border léger | `border-gray-100` | `dark:border-slate-800` |
| **Text** |
| Texte principal | `text-gray-900` | `dark:text-gray-100` |
| Texte secondaire | `text-gray-600` | `dark:text-gray-400` |
| Texte léger | `text-gray-500` | `dark:text-gray-500` |

## 📝 Notes Techniques

1. **Hydration Mismatch**: Le composant ThemeToggle utilise un état `mounted` pour éviter les problèmes d'hydration entre serveur et client.

2. **Transitions**: Les transitions CSS sont désactivées lors du changement de thème (`disableTransitionOnChange`) pour éviter les animations indésirables.

3. **Storage**: La préférence de thème est automatiquement sauvegardée dans `localStorage` par `next-themes`.

4. **SSR**: Le système gère correctement le Server-Side Rendering avec Next.js 16.

## 🐛 Dépannage

### Le thème ne change pas
- Vérifiez que le `ThemeProvider` entoure bien votre application
- Vérifiez la présence de `suppressHydrationWarning` sur `<html>`

### Flash de contenu lors du chargement
- Normal avec `next-themes`, minimisé avec la configuration actuelle
- Peut être réduit en ajoutant un script inline dans `<head>`

### Les couleurs ne changent pas
- Assurez-vous d'utiliser les classes `dark:` appropriées
- Vérifiez que Tailwind est configuré avec `darkMode: 'class'`

## ✨ Exemple d'Utilisation Complète

```tsx
'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function MyThemedComponent() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Mode: {theme}
      </h2>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="mt-4 px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-800"
      >
        {theme === 'dark' ? <Sun /> : <Moon />}
        Changer le thème
      </button>
    </div>
  );
}
```

## 🎨 Design System Attijariwafa Bank

Les couleurs de la marque restent identiques dans les deux modes:
- **Orange Principal**: `#F26522` (`attijari-orange`)
- **Rouge**: `#E31E24` (`attijari-red`)
- **Jaune**: `#FDB913` (`attijari-yellow`)

Ces couleurs conservent leur impact visuel dans les deux thèmes.

---

**Status**: ✅ Système de thème entièrement fonctionnel et testé
**Version**: 1.0.0
**Date**: Février 2026
