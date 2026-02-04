# 🎯 Guide d'Utilisation - Imputations Quotidiennes

## Comment Accéder aux Imputations ?

### 🏠 Méthode 1 : Depuis le Dashboard
1. Connectez-vous à l'application
2. Vous arrivez automatiquement sur le **Dashboard**
3. Descendez à la section "Quick Actions"
4. Cliquez sur la carte **"Imputations"** (icône calendrier orange)

```
Dashboard
    ↓
[Quick Actions]
    ↓
[Imputations] ← Cliquez ici
```

### 📱 Méthode 2 : Depuis la Navbar (Menu Principal)
1. Depuis n'importe quelle page
2. Regardez la barre de navigation en haut
3. Cliquez sur **"Imputations"** dans le menu

```
┌─────────────────────────────────────────────────┐
│ [A] Attijariwafa | Projects | [Imputations] |  │ ← Cliquez ici
│                   Upload | Analytics | Settings │
└─────────────────────────────────────────────────┘
```

### 📊 Méthode 3 : Depuis un Projet
1. Allez sur **"Projects"**
2. Cliquez sur un projet
3. Allez à l'onglet **"Collaborateurs"**
4. Dans le tableau, cliquez sur le bouton **"Voir"** (avec icône calendrier) pour un collaborateur

```
Projects
    ↓
Sélectionner un projet
    ↓
Onglet "Collaborateurs"
    ↓
Tableau des collaborateurs
    ↓
Colonne "Imputation" → Bouton [📅 Voir] ← Cliquez ici
```

## 📋 Page Principale d'Imputation

Une fois sur `/imputation`, vous verrez :

### En-tête
- Titre : "Imputations Quotidiennes"
- Description : "Suivi jour par jour de l'avancement des collaborateurs"

### Statistiques (4 cartes)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Total      │   Imputés    │   Partiels   │ Non Imputés  │
│ Collabora... │              │              │              │
│     25       │      10      │      8       │      7       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Barre de Recherche
- Tapez un nom de collaborateur
- Ou tapez un nom de projet
- Les résultats se filtrent automatiquement

### Liste des Collaborateurs
Groupés par projet avec pour chacun :
- **Avatar** : Initiale du nom
- **Nom** : Nom complet
- **Total JH** : Charge totale
- **Version** : Nom de la version
- **Badge de statut** :
  - 🟢 Vert = Imputé (100%)
  - 🟡 Jaune = Partiel (en cours)
  - 🔴 Rouge = Non Imputé (0%)
- **Bouton "Voir Imputation"** : Accès aux détails

### Actions
Cliquez sur **n'importe quelle carte** de collaborateur ou sur le bouton **"Voir Imputation"** pour accéder à la page détaillée.

## 📅 Page Détail d'Imputation (`/imputation/[id]`)

Sur cette page, vous verrez :

### 1. Widget Statistiques
```
┌─────────────────────────────────────────────────┐
│  Total Jours: 25 | Imputés: 10 | Restants: 15  │
│  Progression: 40%                               │
└─────────────────────────────────────────────────┘
```

### 2. Détails par Phase
```
┌─ Instruction (3 jours) ───────────────────────┐
│ Progression: 67% (2/3)                        │
└───────────────────────────────────────────────┘
```

### 3. Tableau d'Imputation
```
┌───────────────────────────────────────────────┐
│ Phase: Instruction (3 jours)                  │
├───┬─────────┬──────────────┬─────────────────┤
│ ☑ │ Jour 1  │ Lun 05 Fév   │ ✓ Imputé       │
│ ☑ │ Jour 2  │ Mar 06 Fév   │ ✓ Imputé       │
│ ☐ │ Jour 3  │ Mer 07 Fév   │ ⏳ En attente  │
└───┴─────────┴──────────────┴─────────────────┘
```

### 4. Interactions
- **Cocher/Décocher** : Marquer un jour comme imputé
- **Commentaire** : Ajouter une note pour chaque jour
- **Refresh** : Actualiser les données

## 🎨 Codes Couleur

| Couleur | Signification | Badge |
|---------|---------------|-------|
| 🟢 Vert | Imputé (100%) | IMPUTÉ |
| 🟡 Jaune | Partiel (1-99%) | PARTIEL |
| 🔴 Rouge | Non Imputé (0%) | NON IMPUTÉ |

## 🔄 Workflow Typique

### Pour un Manager
```
1. Dashboard → Imputations
2. Vue d'ensemble de tous les collaborateurs
3. Identifier les retards (rouge/jaune)
4. Cliquer sur un collaborateur
5. Voir détails jour par jour
6. Contacter si nécessaire
```

### Pour un Collaborateur
```
1. Navbar → Imputations
2. Chercher son nom
3. Cliquer sur sa carte
4. Cocher les jours travaillés
5. Ajouter commentaires si besoin
6. Progression mise à jour automatiquement
```

### Pour un Chef de Projet
```
1. Projects → Sélectionner projet
2. Onglet Collaborateurs
3. Vue d'ensemble du tableau
4. Cliquer "Voir" pour détails
5. Vérifier avancement par phase
6. Exporter si nécessaire
```

## ⚡ Raccourcis Rapides

| Action | Chemin Court |
|--------|--------------|
| Vue globale | `/imputation` |
| Détail collaborateur | `/imputation/[id]` |
| Depuis projet | `/projects/[id]` → Onglet Collaborateurs |
| Dashboard | `/dashboard` → Quick Action |

## 📱 Version Mobile

Sur mobile/tablette :
- Le menu devient un hamburger (☰)
- Les cartes s'empilent verticalement
- Les tableaux deviennent scrollables horizontalement
- Les statistiques passent de 4 colonnes à 2 ou 1

## 💡 Astuces

1. **Recherche Rapide** : Utilisez Ctrl+F sur la page liste pour chercher
2. **Rafraîchissement** : Le bouton refresh recharge les données en temps réel
3. **Statuts Auto** : Les statuts se calculent automatiquement à chaque clic
4. **Weekends** : Les dates prévues sautent automatiquement les weekends
5. **Commentaires** : Utilisez-les pour expliquer les retards ou avances

## 🐛 Dépannage

### La page ne charge pas ?
- Vérifiez que le serveur est lancé (`npm run dev`)
- Vérifiez votre connexion internet
- Rafraîchissez la page (F5)

### Les données ne s'affichent pas ?
- Assurez-vous d'avoir uploadé au moins un fichier Excel
- Vérifiez que des collaborateurs existent dans le projet
- Consultez la console pour les erreurs

### Les checkboxes ne fonctionnent pas ?
- Vérifiez que vous êtes connecté
- Assurez-vous d'avoir les droits d'imputation
- Rechargez la page

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation technique : `DAILY_IMPUTATION_GUIDE.md`
2. Consultez l'intégration : `INTEGRATION_IMPUTATION.md`
3. Contactez l'administrateur système

---

**Date de Création :** 3 Février 2026
**Version :** 1.0.0
**Status :** ✅ Opérationnel
