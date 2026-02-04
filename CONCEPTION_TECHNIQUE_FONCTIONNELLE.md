# 📋 Conception Technique et Fonctionnelle
## Attijariwafa Instruction Tracker

**Date**: 3 Février 2026  
**Version**: 1.0  
**Département**: IT Africa - Attijariwafa Bank

---

## Table des Matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Conception Fonctionnelle](#2-conception-fonctionnelle)
3. [Conception Technique](#3-conception-technique)
4. [Architecture Applicative](#4-architecture-applicative)
5. [Modèle de Données](#5-modèle-de-données)
6. [API & Endpoints](#6-api--endpoints)
7. [Logique Métier](#7-logique-métier)
8. [Sécurité](#8-sécurité)
9. [Interface Utilisateur](#9-interface-utilisateur)
10. [Déploiement & Infrastructure](#10-déploiement--infrastructure)
11. [Plan d'Évolution](#11-plan-dévolution)

---

## 1. Vue d'Ensemble

### 1.1 Contexte Projet

**Nom**: Attijariwafa Instruction Tracker  
**Client**: Attijariwafa Bank - Direction IT Africa  
**Type**: Application Web Interne  
**Portée**: Gestion et suivi des fiches d'instruction projets IT

### 1.2 Objectifs Stratégiques

- ✅ Centraliser le suivi des fiches d'instruction projets
- ✅ Automatiser l'extraction de données depuis Excel
- ✅ Gérer le versioning des fiches
- ✅ Suivre l'imputation des collaborateurs
- ✅ Calculer automatiquement les cumuls de jours-hommes (JH)
- ✅ Fournir des analytics et reporting avancés

### 1.3 Bénéfices Attendus

| Bénéfice | Description | Impact |
|----------|-------------|--------|
| **Gain de temps** | Parsing automatique vs saisie manuelle | -70% temps saisie |
| **Fiabilité** | Élimination erreurs de saisie | +95% précision |
| **Traçabilité** | Historique complet des versions | Audit complet |
| **Visibilité** | Dashboard temps réel | Décision rapide |
| **Collaboration** | Partage centralisé | +50% efficacité |

---

## 2. Conception Fonctionnelle

### 2.1 Acteurs & Rôles

#### 2.1.1 Administrateur
**Droits**:
- Gestion complète des utilisateurs
- Accès à tous les projets et versions
- Modification des statuts d'imputation
- Export de données analytics
- Configuration système

**Cas d'usage principaux**:
- Créer/modifier des comptes utilisateurs
- Valider les uploads de fiches
- Générer des rapports globaux
- Gérer les paramètres système

#### 2.1.2 Utilisateur Standard
**Droits**:
- Upload de nouvelles fiches d'instruction
- Consultation des projets
- Marquage d'imputation sur ses uploads
- Consultation des analytics

**Cas d'usage principaux**:
- Uploader une fiche Excel
- Consulter l'état des projets
- Marquer des collaborateurs comme imputés
- Visualiser les cumuls JH

### 2.2 Fonctionnalités Détaillées

#### 2.2.1 Authentification & Sécurité

**F1.1 - Connexion Utilisateur**
- **Description**: Authentification sécurisée par email/mot de passe
- **Entrées**: Email, mot de passe
- **Traitement**: 
  1. Validation format email
  2. Vérification mot de passe hashé (bcrypt)
  3. Génération token JWT (durée 7 jours)
  4. Stockage cookie httpOnly
- **Sorties**: Token JWT, redirection dashboard
- **Règles métier**:
  - Minimum 6 caractères pour mot de passe
  - 3 tentatives max puis blocage 15 minutes
  - Session expire après 7 jours

**F1.2 - Déconnexion**
- **Description**: Invalidation de session
- **Traitement**: Suppression cookie JWT
- **Sortie**: Redirection page login

**F1.3 - Vérification Session**
- **Description**: Contrôle validité token à chaque requête
- **Traitement**: Validation signature JWT + expiration
- **Règles**: Token invalide → logout automatique

---

#### 2.2.2 Gestion des Fichiers Excel

**F2.1 - Upload Fiche d'Instruction**

**Description**: Import d'une fiche Excel au format standardisé Attijariwafa

**Pré-requis**:
- Utilisateur authentifié
- Fichier format .xlsx
- Sheet nommé "Fiche Instruction"
- Structure conforme au template

**Flux détaillé**:
```
1. Utilisateur sélectionne fichier (drag-and-drop ou browse)
2. Validation côté client (extension, taille max 10MB)
3. Upload vers serveur (POST /api/upload)
4. Stockage temporaire dans /public/uploads/
5. Parsing automatique du fichier:
   a. Lecture sheet "Fiche Instruction"
   b. Extraction métadonnées (coordonnées fixes)
   c. Extraction collaborateurs (lignes 18-30)
   d. Extraction planning (lignes 32-38)
   e. Calcul hash SHA256
6. Validation des données extraites
7. Détection doublons/versions:
   - Hash existe → ERREUR doublon exact
   - (Filiale + Référence) existe → Nouvelle version
   - Sinon → Nouveau projet
8. Enregistrement en base de données
9. Notification utilisateur (succès/erreur)
10. Redirection vers page projet
```

**Règles de validation**:
- ✅ Extension: .xlsx uniquement
- ✅ Taille: < 10MB
- ✅ Sheet "Fiche Instruction" obligatoire
- ✅ Filiale (D3): non vide
- ✅ Référence (D4): non vide
- ✅ Charge totale (D10): numérique positive
- ✅ Noms collaborateurs: format validé (voir F2.2)

**Sorties**:
- Succès: Version créée avec ID unique
- Erreur: Message explicite (doublon, format invalide, etc.)

**F2.2 - Validation Noms Collaborateurs**

**Description**: Contrôle strict de la qualité des noms de collaborateurs

**Règles d'acceptation** (ordre de priorité):
1. **Format avec parenthèses**: 
   - Exemple valide: `"Collaborateur (I.KADA)"`, `"Collaborateur (John Doe)"`
   - Pattern: Texte + (Lettres/espaces/points)
   
2. **Format multi-mots**:
   - Exemple valide: `"Jean Dupont"`, `"John Smith"`, `"Marie-Claire Martin"`
   - Minimum 2 mots contenant uniquement des lettres
   - Accepte: lettres accentuées, traits d'union, apostrophes

**Règles de rejet**:
- ❌ `"Collaborateur 2"`, `"Collaborateur 3"` (nom + chiffre)
- ❌ `"xxx"`, `"test"`, `"NA"` (mots génériques)
- ❌ Mots uniques sans parenthèses
- ❌ Lignes vides avec charges nulles

**Traitement des rejets**:
- Message d'avertissement détaillé
- Liste des noms invalides avec raisons
- Upload peut continuer avec collaborateurs valides uniquement

---

#### 2.2.3 Gestion des Projets & Versions

**F3.1 - Liste des Projets**

**Description**: Vue globale de tous les projets avec filtrage avancé

**Filtres disponibles**:
- 🔍 Recherche textuelle (titre, référence, filiale)
- 📊 Statut imputation (NON_IMPUTE, PARTIEL, IMPUTE, TOUS)
- 🏢 Filiale (SCB, autre, TOUTES)
- 📅 Période (date de début)

**Affichage**:
- Grille de cartes responsive (3 colonnes desktop, 1 mobile)
- Informations par carte:
  - Filiale + Référence
  - Titre projet
  - Nombre de versions
  - Statut imputation (badge coloré)
  - Charge totale
  - Date dernière mise à jour
- Tri: récent d'abord

**Actions**:
- Clic sur carte → Détails projet
- Bouton "Nouveau" → Upload

**F3.2 - Détails Projet**

**Description**: Vue complète d'un projet avec toutes ses versions

**Sections**:
1. **En-tête projet**:
   - Filiale + Référence
   - Titre et contexte
   - Nombre total de versions
   - Charge cumulée toutes versions

2. **Timeline des versions**:
   - Liste chronologique (v1, v2, v3...)
   - Pour chaque version:
     - Numéro version
     - Date upload
     - Utilisateur uploader
     - Statut imputation (badge)
     - Charge totale
     - Bouton "Voir détails"

3. **Détails version sélectionnée**:
   - Métadonnées complètes
   - Tableau collaborateurs
   - Planning prévisionnel
   - Actions (télécharger Excel, marquer imputation)

**F3.3 - Versioning Automatique**

**Description**: Gestion intelligente des versions de fiches

**Logique de versioning**:
```
SI hash fichier existe déjà ALORS
  → REJETER (doublon exact)
SINON SI (filiale + référence) existe ALORS
  → CRÉER nouvelle version (versionNumber = max + 1)
SINON
  → CRÉER nouveau projet + version 1
FIN SI
```

**Avantages**:
- ✅ Empêche upload doublons exacts
- ✅ Historique complet des évolutions
- ✅ Comparaison possible entre versions
- ✅ Traçabilité des modifications

---

#### 2.2.4 Imputation des Collaborateurs

**F4.1 - Marquage Imputation**

**Description**: Suivi individuel de l'imputation des collaborateurs

**Interface**:
- Tableau des collaborateurs d'une version
- Colonne "Imputé" avec checkbox
- Horodatage visible (date + heure)
- Utilisateur ayant marqué

**Workflow**:
1. Utilisateur coche un/plusieurs collaborateurs
2. Backend met à jour:
   - `isImputed = true`
   - `imputedAt = now()`
3. Recalcul automatique du statut version
4. Actualisation UI en temps réel

**F4.2 - Calcul Statut Version**

**Description**: Détermination automatique du statut d'imputation

**Algorithme**:
```
nbImputés = COUNT(collaborateurs WHERE isImputed = true)
nbTotal = COUNT(collaborateurs)

SI nbImputés = 0 ALORS
  status = "NON_IMPUTE"
SINON SI nbImputés < nbTotal ALORS
  status = "PARTIEL"
SINON
  status = "IMPUTE"
FIN SI
```

**Affichage visuel**:
- 🔴 NON_IMPUTE: Badge rouge
- 🟡 PARTIEL: Badge orange + % imputé
- 🟢 IMPUTE: Badge vert

---

#### 2.2.5 Analytics & Cumuls JH

**F5.1 - Cumul par Projet**

**Description**: Calcul de la charge totale par projet toutes versions confondues

**Formule**:
```sql
SELECT 
  p.filiale,
  p.reference,
  p.title,
  SUM(iv.chargeTotale) as totalJH,
  COUNT(iv.id) as nbVersions
FROM Project p
JOIN InstructionVersion iv ON iv.projectId = p.id
GROUP BY p.id
ORDER BY totalJH DESC
```

**Affichage**:
- Tableau tri/pagination
- Colonnes: Filiale, Référence, Titre, Nb Versions, Total JH
- Graphique: Top 10 projets par charge

**F5.2 - Cumul par Collaborateur**

**Description**: Charge totale par personne sur tous projets/versions

**Formule**:
```sql
SELECT 
  cl.name,
  COUNT(DISTINCT iv.projectId) as nbProjets,
  SUM(cl.total) as totalJH,
  SUM(cl.instruction) as JH_instruction,
  SUM(cl.cadrage) as JH_cadrage,
  -- ... autres phases
FROM CollaboratorLine cl
JOIN InstructionVersion iv ON iv.id = cl.versionId
GROUP BY cl.name
ORDER BY totalJH DESC
```

**Affichage**:
- Tableau avec détail par phase
- Graphique: Top collaborateurs
- Export Excel possible

**F5.3 - Cumul par Phase**

**Description**: Répartition de la charge par phase projet

**Phases suivies** (11 phases):
1. Instruction
2. Cadrage
3. Conception
4. Administration
5. Technique
6. Développement
7. Test Unitaire
8. Test Intégration
9. Assistance Recette
10. Déploiement
11. Assistance Post-Déploiement

**Affichage**:
- Graphique camembert (répartition %)
- Graphique barres (JH absolus)
- Tableau détaillé

**F5.4 - Dashboard Général**

**Description**: Vue d'ensemble KPI principaux

**Métriques affichées**:
- 📊 Nombre total de projets
- 📄 Nombre total de versions
- 👥 Nombre total de collaborateurs uniques
- ⏱️ Total JH cumulés (toutes phases)
- 📈 Évolution charge par mois (graphique)
- 🏢 Répartition par filiale
- ✅ % projets imputés

**Widgets**:
- Statistiques clés (cartes colorées avec icônes)
- Projets récents (5 derniers)
- Alertes (versions non imputées > 30 jours)

---

### 2.3 Règles de Gestion

#### RG1 - Unicité des Fichiers
**Règle**: Un même fichier (même hash SHA256) ne peut être uploadé qu'une seule fois.  
**Exception**: Aucune  
**Contrôle**: À l'upload, avant enregistrement

#### RG2 - Structure Excel Obligatoire
**Règle**: Tout fichier doit contenir un sheet "Fiche Instruction" avec structure standardisée.  
**Coordonnées obligatoires**:
- D3: Filiale (non vide)
- D4: Référence (non vide)
- D10: Charge totale (numérique)

**Sanction**: Rejet du fichier avec message explicite

#### RG3 - Nommage Collaborateurs
**Règle**: Voir F2.2 (validation stricte)  
**Tolérance**: Collaborateurs invalides ignorés avec avertissement

#### RG4 - Calcul Automatique Statut
**Règle**: Le statut d'imputation est toujours calculé automatiquement (jamais manuel).  
**Déclencheur**: Modification d'un `isImputed` dans CollaboratorLine

#### RG5 - Versioning Chronologique
**Règle**: Les numéros de version sont strictement croissants et séquentiels (1, 2, 3...).  
**Calcul**: `versionNumber = MAX(versions du projet) + 1`

#### RG6 - Conservation des Fichiers
**Règle**: Les fichiers Excel originaux sont conservés indéfiniment.  
**Stockage**: `/public/uploads/{projectId}/{versionId}/{fileName}`

#### RG7 - Cumul JH
**Règle**: Les cumuls incluent TOUTES les versions de TOUS les projets.  
**Filtre**: Possibilité de filtrer par période, filiale, statut

---

### 2.4 Cas d'Usage Détaillés

#### UC1 - Upload Nouvelle Fiche

**Acteur**: Utilisateur authentifié  
**Pré-conditions**: 
- Utilisateur connecté
- Fichier Excel conforme

**Scénario nominal**:
1. Utilisateur navigue vers /upload
2. Sélectionne fichier .xlsx
3. Validation client (extension, taille)
4. Upload vers serveur
5. Parsing automatique
6. Détection: nouveau projet
7. Création Project + Version 1
8. Enregistrement collaborateurs et planning
9. Message succès
10. Redirection vers /projects/{projectId}

**Scénarios alternatifs**:
- **A1 - Nouvelle version**: Si (filiale+référence) existe
  - 7a. Récupération projet existant
  - 7b. Création Version N+1
  - 7c. Continuer à 8
  
- **A2 - Doublon exact**: Si hash existe
  - 6a. Erreur "Fichier déjà uploadé"
  - 6b. Affichage version existante
  - 6c. Stop

- **A3 - Format invalide**: Si parsing échoue
  - 5a. Erreur "Format Excel invalide"
  - 5b. Liste des problèmes détectés
  - 5c. Stop

**Post-conditions**:
- Version enregistrée en DB
- Fichier stocké sur disque
- Collaborateurs et planning créés

---

#### UC2 - Marquer Imputation Collaborateurs

**Acteur**: Utilisateur (propriétaire version ou admin)  
**Pré-conditions**: Version existe et visible

**Scénario nominal**:
1. Utilisateur ouvre détails version
2. Consulte tableau collaborateurs
3. Coche checkbox "Imputé" pour un collaborateur
4. Backend met à jour:
   - `isImputed = true`
   - `imputedAt = now()`
5. Recalcul statut version
6. Actualisation UI (badge statut change)
7. Message confirmation

**Scénarios alternatifs**:
- **A1 - Démarquer**: Utilisateur décoche
  - 4a. `isImputed = false, imputedAt = null`
  - 4b. Continuer à 5

- **A2 - Marquage multiple**: Sélection de plusieurs
  - 3a. Checkbox sur plusieurs lignes
  - 3b. Action groupée
  - 3c. Continuer à 4

**Post-conditions**:
- Collaborateurs marqués
- Statut version à jour
- Horodatage enregistré

---

#### UC3 - Consulter Analytics Cumuls JH

**Acteur**: Utilisateur authentifié  
**Pré-conditions**: Au moins une version en DB

**Scénario nominal**:
1. Utilisateur navigue vers /analytics
2. Sélection vue "Par Projet"
3. Application filtres optionnels (période, filiale)
4. Backend calcule cumuls via queries SQL
5. Affichage tableau paginé + graphiques
6. Export Excel possible

**Vues disponibles**:
- **Par Projet**: Cumul toutes versions
- **Par Collaborateur**: Cumul toutes participations
- **Par Phase**: Répartition des charges
- **Global**: Dashboard KPI

**Post-conditions**: Aucune (lecture seule)

---

## 3. Conception Technique

### 3.1 Stack Technologique

#### 3.1.1 Frontend

| Technologie | Version | Rôle | Justification |
|-------------|---------|------|---------------|
| **Next.js** | 16.0.10 | Framework React | App Router moderne, RSC, excellent SEO |
| **React** | 19.2.0 | Bibliothèque UI | Standard industrie, écosystème riche |
| **TypeScript** | 5.x | Langage | Type safety, meilleur DX, maintenance |
| **TailwindCSS** | 4.1.9 | Styling | Rapid prototyping, responsive natif |
| **Redux Toolkit** | 1.9.7 | État global | État complexe, actions asynchrones |
| **TanStack Query** | 5.35.1 | Data fetching | Cache intelligent, sync serveur |
| **TanStack Table** | 8.21.3 | Tableaux | Tri/pagination/filtres performants |
| **shadcn/ui** | - | Composants | Radix UI, accessible, customisable |
| **Framer Motion** | 11.0.8 | Animations | Animations fluides, performance |
| **React Hook Form** | 7.60.0 | Formulaires | Validation, performance |
| **Zod** | 3.25.76 | Validation | Schémas type-safe |
| **Lucide React** | 0.454.0 | Icônes | Moderne, léger, cohérent |

#### 3.1.2 Backend

| Technologie | Version | Rôle | Justification |
|-------------|---------|------|---------------|
| **Next.js API Routes** | 16.0.10 | REST API | Co-localisation code, deployment simple |
| **Prisma** | 7.3.0 | ORM | Type-safe, migrations, excellent DX |
| **SQLite** | - | Database | Simple, embedded, pas de serveur |
| **Better SQLite3** | 12.6.0 | Driver | Synchrone, performant |
| **jsonwebtoken** | 9.0.3 | JWT | Standard auth, stateless |
| **bcryptjs** | 2.4.3 | Hashing | Sécurité mots de passe |
| **XLSX** | 0.18.5 | Parsing Excel | Support complet format Office |
| **formidable** | 3.5.1 | Upload | Gestion multipart/form-data |
| **crypto** | Node.js | Hashing | SHA256 natif |

#### 3.1.3 Outils & DevOps

| Outil | Version | Utilisation |
|-------|---------|-------------|
| **pnpm** | - | Package manager |
| **ESLint** | - | Linting |
| **Prettier** | - | Formatage |
| **Git** | - | Versioning code |

---

### 3.2 Principes Architecturaux

#### 3.2.1 Architecture Globale

**Type**: Monolithe full-stack  
**Pattern**: App Router (React Server Components + Client Components)

**Justification choix monolithe**:
- ✅ Équipe réduite
- ✅ Scope bien défini
- ✅ Pas de microservices nécessaires
- ✅ Deployment simplifié
- ✅ Latence réduite (co-localisation)

**Découpage logique**:
```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │   Pages    │  │ Components │  │  Redux Store    │   │
│  │ (RSC+CSR)  │  │ (UI/Layout)│  │  (TanStack Q)   │   │
│  └────────────┘  └────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
                         ↕ HTTP/JSON
┌──────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │  Auth API  │  │Projects API│  │   Upload API    │   │
│  │  (JWT)     │  │  (CRUD)    │  │ (Excel Parse)   │   │
│  └────────────┘  └────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
                         ↕ Prisma Client
┌──────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │   Models   │  │Repositories│  │    Migrations   │   │
│  │  (Prisma)  │  │  (Queries) │  │                 │   │
│  └────────────┘  └────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
                         ↕ SQL
┌──────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                     │
│              SQLite Database (dev.db)                    │
└──────────────────────────────────────────────────────────┘
```

#### 3.2.2 Patterns Utilisés

**1. Repository Pattern (via Prisma)**
- Abstraction accès données
- Queries réutilisables
- Testabilité accrue

**2. DTO (Data Transfer Objects)**
- Séparation modèle DB / API
- Validation avec Zod
- Transformation données

**3. Middleware Pattern**
- Authentification centralisée
- Logging
- Error handling

**4. Factory Pattern**
- Création objets complexes (ParsedExcel)
- Parser configurations

**5. Strategy Pattern**
- Différentes stratégies de parsing
- Gestion multi-formats futurs

---

### 3.3 Choix Techniques Justifiés

#### Pourquoi Next.js App Router ?
- ✅ React Server Components (moins JS client)
- ✅ Streaming SSR (performance)
- ✅ Routes API co-localisées
- ✅ Excellent SEO
- ✅ Déploiement simple (Vercel, Docker)

#### Pourquoi SQLite ?
- ✅ Zero-configuration
- ✅ Fichier unique (backup facile)
- ✅ Performant pour workload moyen
- ✅ Pas de serveur DB à gérer
- ⚠️ Migration PostgreSQL recommandée en production

#### Pourquoi Redux + TanStack Query ?
- **Redux**: État UI complexe (filtres, sélections)
- **TanStack Query**: Cache données serveur, sync auto
- **Complémentaires**: Redux = UI, TanStack = Serveur

#### Pourquoi JWT ?
- ✅ Stateless (scalabilité horizontale)
- ✅ Standard industrie
- ✅ Payload customisable (rôle, userId)
- ✅ Cookie httpOnly (sécurité XSS)

---

## 4. Architecture Applicative

### 4.1 Structure des Dossiers

```
excel-parsing-logic/
│
├── app/                              # Next.js App Router
│   ├── (protected)/                  # Routes authentifiées (layout group)
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard principal
│   │   ├── projects/
│   │   │   ├── page.tsx              # Liste projets
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Détails projet
│   │   ├── upload/
│   │   │   └── page.tsx              # Upload fichier
│   │   ├── analytics/
│   │   │   └── page.tsx              # Analytics & cumuls
│   │   └── layout.tsx                # Layout avec sidebar
│   │
│   ├── api/                          # API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts        # POST /api/auth/login
│   │   │   ├── logout/route.ts       # POST /api/auth/logout
│   │   │   └── me/route.ts           # GET /api/auth/me
│   │   ├── projects/
│   │   │   ├── route.ts              # GET /api/projects
│   │   │   └── [id]/route.ts         # GET /api/projects/{id}
│   │   ├── upload/
│   │   │   └── route.ts              # POST /api/upload
│   │   ├── versions/
│   │   │   └── [id]/
│   │   │       └── imputation/route.ts # PATCH /api/versions/{id}/imputation
│   │   └── analytics/
│   │       ├── cumulation/route.ts   # GET /api/analytics/cumulation
│   │       └── dashboard/route.ts    # GET /api/analytics/dashboard
│   │
│   ├── login/
│   │   └── page.tsx                  # Page connexion
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home (redirect)
│   ├── globals.css                   # Styles globaux
│   └── providers.tsx                 # Redux/Query providers
│
├── components/
│   ├── ui/                           # Composants shadcn/ui
│   │   ├── advanced-table.tsx        # DataTable (TanStack)
│   │   ├── advanced-stats.tsx        # AdvancedStat, ProgressCard
│   │   ├── activity-components.tsx   # ActivityTimeline, MetricsGrid
│   │   ├── filter-components.tsx     # AdvancedFilter, StatCard
│   │   ├── button.tsx                # Shadcn Button
│   │   ├── card.tsx                  # Shadcn Card
│   │   ├── input.tsx                 # Shadcn Input
│   │   ├── dialog.tsx                # Shadcn Dialog
│   │   └── ...                       # Autres composants Radix
│   │
│   ├── layout/
│   │   ├── page-container.tsx        # Container full-width
│   │   ├── sidebar.tsx               # Navigation sidebar
│   │   └── header.tsx                # Header avec user menu
│   │
│   └── dialogs/
│       ├── upload-dialog.tsx         # Modal upload
│       └── confirm-dialog.tsx        # Confirmation actions
│
├── lib/
│   ├── auth.ts                       # Utilitaires JWT + bcrypt
│   ├── db.ts                         # Prisma client singleton
│   ├── excel-parser.ts               # Parsing Excel (XLSX)
│   ├── utils.ts                      # Helpers génériques
│   │
│   └── redux/
│       ├── store.ts                  # Configuration Redux store
│       ├── slices/
│       │   ├── authSlice.ts          # État authentification
│       │   ├── projectSlice.ts       # État projets
│       │   └── uiSlice.ts            # État UI (modals, filters)
│       └── hooks.ts                  # Typed hooks (useAppDispatch)
│
├── hooks/
│   ├── useAuth.ts                    # Hook authentification
│   ├── useProjects.ts                # Hook projets (TanStack Query)
│   └── useAnalytics.ts               # Hook analytics
│
├── prisma/
│   ├── schema.prisma                 # Schéma base de données
│   ├── seed.ts                       # Données initiales
│   ├── dev.db                        # Base SQLite (dev)
│   └── generated/
│       └── prisma/                   # Client Prisma généré
│
├── public/
│   ├── uploads/                      # Fichiers Excel uploadés
│   │   └── {projectId}/
│   │       └── {versionId}/
│   │           └── {fileName}.xlsx
│   └── images/                       # Images statiques
│
├── scripts/
│   └── generate-hash.ts              # Utilitaires CLI
│
├── styles/
│   └── globals.css                   # CSS supplémentaires
│
├── .env                              # Variables environnement
├── .gitignore
├── next.config.mjs                   # Config Next.js
├── package.json
├── tsconfig.json                     # Config TypeScript
└── README.md
```

---

### 4.2 Flux de Données

#### 4.2.1 Flux Authentification

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. POST /api/auth/login
       │    { email, password }
       ↓
┌─────────────────────────────────────┐
│    API Route: /api/auth/login       │
│                                     │
│  1. Validation données (Zod)       │
│  2. Recherche user en DB (Prisma)  │
│  3. Vérification password (bcrypt) │
│  4. Génération JWT (7 jours)       │
│  5. Création cookie httpOnly       │
└──────┬──────────────────────────────┘
       │ 2. Response 200
       │    Set-Cookie: token=xxx
       ↓
┌─────────────┐
│   Browser   │ 3. Stocke cookie
│             │ 4. Redirect /dashboard
└─────────────┘
```

#### 4.2.2 Flux Upload Fichier

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. POST /api/upload
       │    FormData { file: excel.xlsx }
       ↓
┌──────────────────────────────────────────┐
│    API Route: /api/upload                │
│                                          │
│  1. Vérification JWT cookie             │
│  2. Parse FormData (formidable)         │
│  3. Stockage temp /public/uploads       │
│  4. Parsing Excel (lib/excel-parser)    │
│     ├─ Read sheet "Fiche Instruction"   │
│     ├─ Extract D3, D4, etc.             │
│     ├─ Parse collaborators (rows 18-30) │
│     ├─ Parse planning (rows 32-38)      │
│     └─ Calculate SHA256 hash            │
│  5. Détection doublon/version           │
│     ├─ Query hash existant ?            │
│     └─ Query (filiale+ref) existant ?   │
│  6. Transaction Prisma:                 │
│     ├─ Create/Update Project            │
│     ├─ Create InstructionVersion        │
│     ├─ CreateMany CollaboratorLine      │
│     └─ CreateMany PlanningLine          │
└──────┬───────────────────────────────────┘
       │ 2. Response 201
       │    { versionId, projectId }
       ↓
┌─────────────┐
│   Browser   │ 3. Redirect /projects/{id}
└─────────────┘
```

#### 4.2.3 Flux Consultation Analytics

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. GET /api/analytics/cumulation
       │    ?groupBy=project&filiale=SCB
       ↓
┌──────────────────────────────────────────┐
│  API Route: /api/analytics/cumulation    │
│                                          │
│  1. Vérification JWT                     │
│  2. Parse query params                   │
│  3. Build dynamic Prisma query:          │
│     SELECT p.filiale, p.reference,       │
│            SUM(iv.chargeTotale) as total │
│     FROM Project p                       │
│     JOIN InstructionVersion iv           │
│     WHERE p.filiale = 'SCB'              │
│     GROUP BY p.id                        │
│     ORDER BY total DESC                  │
│  4. Execute query                        │
│  5. Format response DTO                  │
└──────┬───────────────────────────────────┘
       │ 2. Response 200
       │    { data: [...], total: 150 }
       ↓
┌─────────────┐
│   Browser   │ 3. TanStack Query cache
│             │ 4. Render DataTable
└─────────────┘
```

---

## 5. Modèle de Données

### 5.1 Schéma Relationnel

```
┌─────────────────────────────────────────────────────────────┐
│                            User                             │
├─────────────────────────────────────────────────────────────┤
│ id: String (PK, cuid)                                       │
│ email: String (UNIQUE)                                      │
│ name: String?                                               │
│ passwordHash: String                                        │
│ role: String ('admin' | 'user')                             │
│ createdAt: DateTime                                         │
│ updatedAt: DateTime                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ 1:N (uploadedBy)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    InstructionVersion                       │
├─────────────────────────────────────────────────────────────┤
│ id: String (PK, cuid)                                       │
│ projectId: String (FK → Project)                            │
│ versionNumber: Int                                          │
│ fileHash: String (UNIQUE, SHA256)                           │
│ fileName: String                                            │
│ filePath: String                                            │
│ demandeur: String?                                          │
│ chargeTotale: Float (JH)                                    │
│ dateDebut: DateTime?                                        │
│ dateMEP: DateTime?                                          │
│ dateValidation: DateTime?                                   │
│ status: String ('NON_IMPUTE' | 'PARTIEL' | 'IMPUTE')        │
│ imputedBy: String? (userId)                                 │
│ uploadedBy: String (FK → User)                              │
│ createdAt: DateTime                                         │
│ updatedAt: DateTime                                         │
└─────────────────────┬───────────┬───────────────────────────┘
                      │ N:1       │ 1:N
                      │           │
        ┌─────────────▼──┐   ┌────▼────────────────────────┐
        │    Project     │   │    CollaboratorLine         │
        ├────────────────┤   ├─────────────────────────────┤
        │ id: String (PK)│   │ id: String (PK)             │
        │ filiale: String│   │ versionId: String (FK)      │
        │ reference: Str │   │ name: String                │
        │ title: String? │   │ instruction: Float          │
        │ context: Str?  │   │ cadrage: Float              │
        └────────────────┘   │ conception: Float           │
                             │ administration: Float       │
                             │ technique: Float            │
                             │ developpement: Float        │
                             │ testUnitaire: Float         │
                             │ testIntegration: Float      │
                             │ assistanceRecette: Float    │
                             │ deploiement: Float          │
                             │ assistancePost: Float       │
                             │ total: Float (calculé)      │
                             │ isImputed: Boolean          │
                             │ imputedAt: DateTime?        │
                             └─────────────────────────────┘

                      ┌────────────────────────────────────┐
                      │         PlanningLine               │
                      ├────────────────────────────────────┤
                      │ id: String (PK)                    │
                      │ versionId: String (FK)             │
                      │ phase: String                      │
                      │ startDate: DateTime?               │
                      │ endDate: DateTime?                 │
                      │ note: String?                      │
                      └────────────────────────────────────┘
```

### 5.2 Contraintes & Index

#### User
- **PK**: id
- **UNIQUE**: email
- **INDEX**: email (login rapide)

#### Project
- **PK**: id
- **UNIQUE**: (filiale, reference) → Empêche doublons projets
- **INDEX**: filiale (filtres)

#### InstructionVersion
- **PK**: id
- **UNIQUE**: 
  - fileHash → Empêche upload doublon exact
  - (projectId, versionNumber) → Versioning cohérent
- **INDEX**: 
  - projectId (join rapide)
  - fileHash (détection doublon)
  - status (filtres analytics)
- **CASCADE DELETE**: Si Project supprimé → Versions supprimées

#### CollaboratorLine
- **PK**: id
- **INDEX**: versionId (join)
- **INDEX**: name (cumul par collaborateur)
- **CASCADE DELETE**: Si Version supprimée → Collaborateurs supprimés

#### PlanningLine
- **PK**: id
- **INDEX**: versionId (join)
- **CASCADE DELETE**: Si Version supprimée → Planning supprimé

### 5.3 Requêtes Optimisées

#### Q1 - Cumul par Projet
```prisma
// Approche 1: Via ORM
await prisma.project.findMany({
  select: {
    id: true,
    filiale: true,
    reference: true,
    title: true,
    versions: {
      select: {
        chargeTotale: true
      }
    }
  }
})
// Post-processing: sum(versions.chargeTotale)

// Approche 2: Raw SQL (plus performant)
await prisma.$queryRaw`
  SELECT 
    p.filiale,
    p.reference,
    p.title,
    COUNT(iv.id) as nbVersions,
    SUM(iv.chargeTotale) as totalJH
  FROM Project p
  LEFT JOIN InstructionVersion iv ON iv.projectId = p.id
  GROUP BY p.id
  ORDER BY totalJH DESC
`
```

#### Q2 - Cumul par Collaborateur
```sql
SELECT 
  cl.name,
  COUNT(DISTINCT iv.projectId) as nbProjets,
  SUM(cl.total) as totalJH,
  SUM(cl.instruction) as JH_instruction,
  SUM(cl.cadrage) as JH_cadrage,
  SUM(cl.conception) as JH_conception,
  SUM(cl.administration) as JH_administration,
  SUM(cl.technique) as JH_technique,
  SUM(cl.developpement) as JH_developpement,
  SUM(cl.testUnitaire) as JH_testUnitaire,
  SUM(cl.testIntegration) as JH_testIntegration,
  SUM(cl.assistanceRecette) as JH_assistanceRecette,
  SUM(cl.deploiement) as JH_deploiement,
  SUM(cl.assistancePost) as JH_assistancePost
FROM CollaboratorLine cl
JOIN InstructionVersion iv ON iv.id = cl.versionId
GROUP BY cl.name
ORDER BY totalJH DESC
```

#### Q3 - Détection Doublon
```prisma
// Très rapide grâce à l'index UNIQUE sur fileHash
const existing = await prisma.instructionVersion.findUnique({
  where: { fileHash: calculatedHash }
});

if (existing) {
  throw new Error('Fichier déjà uploadé');
}
```

---

## 6. API & Endpoints

### 6.1 Authentification

#### POST /api/auth/login
**Description**: Connexion utilisateur

**Request**:
```json
{
  "email": "admin@attijariwafa.com",
  "password": "admin123"
}
```

**Response 200**:
```json
{
  "success": true,
  "user": {
    "id": "clxyz123",
    "email": "admin@attijariwafa.com",
    "name": "Admin",
    "role": "admin"
  }
}
// + Set-Cookie: token=eyJhbGc...
```

**Errors**:
- 400: Email/password manquants
- 401: Identifiants invalides
- 500: Erreur serveur

---

#### POST /api/auth/logout
**Description**: Déconnexion utilisateur

**Response 200**:
```json
{
  "success": true
}
// + Clear Cookie
```

---

#### GET /api/auth/me
**Description**: Récupérer utilisateur actuel

**Headers**: Cookie: token=xxx

**Response 200**:
```json
{
  "user": {
    "id": "clxyz123",
    "email": "admin@attijariwafa.com",
    "name": "Admin",
    "role": "admin"
  }
}
```

**Errors**:
- 401: Non authentifié

---

### 6.2 Projets

#### GET /api/projects
**Description**: Liste des projets avec filtres

**Query Params**:
- `search` (string): Recherche textuelle
- `status` (string): NON_IMPUTE | PARTIEL | IMPUTE | TOUS
- `filiale` (string): SCB | ... | TOUTES

**Response 200**:
```json
{
  "projects": [
    {
      "id": "clxyz456",
      "filiale": "SCB",
      "reference": "PRJ-2026-001",
      "title": "Migration SI",
      "context": "Modernisation infrastructure",
      "versions": [
        {
          "id": "clver789",
          "versionNumber": 1,
          "status": "PARTIEL",
          "chargeTotale": 150,
          "createdAt": "2026-02-01T10:00:00Z"
        }
      ],
      "totalVersions": 1,
      "latestVersion": { ... }
    }
  ],
  "total": 42
}
```

---

#### GET /api/projects/[id]
**Description**: Détails complets d'un projet

**Response 200**:
```json
{
  "project": {
    "id": "clxyz456",
    "filiale": "SCB",
    "reference": "PRJ-2026-001",
    "title": "Migration SI",
    "context": "...",
    "versions": [
      {
        "id": "clver789",
        "versionNumber": 1,
        "fileName": "fiche_v1.xlsx",
        "fileHash": "abc123...",
        "demandeur": "Direction IT",
        "chargeTotale": 150,
        "dateDebut": "2026-03-01",
        "dateMEP": "2026-06-30",
        "status": "PARTIEL",
        "collaborators": [
          {
            "id": "clcol111",
            "name": "Jean Dupont",
            "instruction": 5,
            "cadrage": 10,
            "conception": 20,
            "...": "...",
            "total": 80,
            "isImputed": true,
            "imputedAt": "2026-02-02T14:30:00Z"
          }
        ],
        "planning": [
          {
            "phase": "Instruction",
            "startDate": "2026-03-01",
            "endDate": "2026-03-15"
          }
        ],
        "uploadedByUser": {
          "name": "Admin",
          "email": "admin@attijariwafa.com"
        },
        "createdAt": "2026-02-01T10:00:00Z"
      }
    ]
  }
}
```

---

### 6.3 Upload

#### POST /api/upload
**Description**: Upload et parsing fichier Excel

**Request**: `multipart/form-data`
```
Content-Type: multipart/form-data

file: [binary Excel file]
```

**Response 201**:
```json
{
  "success": true,
  "message": "Nouvelle version créée",
  "data": {
    "projectId": "clxyz456",
    "versionId": "clver790",
    "versionNumber": 2,
    "isNewProject": false
  }
}
```

**Errors**:
- 400: Fichier manquant ou format invalide
- 400: Structure Excel invalide
- 409: Fichier doublon (même hash)
- 500: Erreur parsing/enregistrement

**Validation Excel**:
```json
{
  "error": "Invalid Excel structure",
  "details": {
    "missingFields": ["filiale", "reference"],
    "invalidCollaborators": [
      "Collaborateur 2: Must have format like \"Collaborateur (I.KADA)\""
    ]
  }
}
```

---

### 6.4 Versions

#### PATCH /api/versions/[id]/imputation
**Description**: Mettre à jour l'imputation des collaborateurs

**Request**:
```json
{
  "collaboratorIds": ["clcol111", "clcol222"],
  "isImputed": true
}
```

**Response 200**:
```json
{
  "success": true,
  "version": {
    "id": "clver789",
    "status": "PARTIEL",
    "collaborators": [
      {
        "id": "clcol111",
        "name": "Jean Dupont",
        "isImputed": true,
        "imputedAt": "2026-02-03T15:45:00Z"
      }
    ]
  }
}
```

---

### 6.5 Analytics

#### GET /api/analytics/cumulation
**Description**: Cumuls JH avec groupement configurable

**Query Params**:
- `groupBy` (required): project | collaborator | phase
- `filiale` (optional): Filtre par filiale
- `startDate` (optional): Date début période
- `endDate` (optional): Date fin période

**Response 200 (groupBy=project)**:
```json
{
  "data": [
    {
      "projectId": "clxyz456",
      "filiale": "SCB",
      "reference": "PRJ-2026-001",
      "title": "Migration SI",
      "nbVersions": 2,
      "totalJH": 300
    }
  ],
  "summary": {
    "totalProjects": 15,
    "totalJH": 2500
  }
}
```

**Response 200 (groupBy=collaborator)**:
```json
{
  "data": [
    {
      "name": "Jean Dupont",
      "nbProjets": 5,
      "totalJH": 320,
      "byPhase": {
        "instruction": 25,
        "cadrage": 50,
        "conception": 80,
        "...": "..."
      }
    }
  ],
  "summary": {
    "totalCollaborators": 25,
    "totalJH": 2500
  }
}
```

---

## 7. Logique Métier

### 7.1 Parsing Excel Détaillé

#### Fichier: lib/excel-parser.ts

**Fonction principale**: `parseExcelFile(filePath | Buffer)`

**Étapes**:

1. **Lecture fichier**
```typescript
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Fiche Instruction'];

if (!sheet) {
  throw new Error('Sheet "Fiche Instruction" not found');
}
```

2. **Extraction métadonnées (coordonnées fixes)**
```typescript
const metadata = {
  filiale: getCellValue(sheet, 'D3'),          // Ex: "SCB"
  reference: getCellValue(sheet, 'D4'),        // Ex: "PRJ-2026-001"
  demandeur: findCellValueByLabel(sheet, 'A6'), // Dynamic search
  titre: getCellValue(sheet, 'B7'),            // Descriptif
  contexte: getCellValue(sheet, 'E7'),         // Contexte projet
  chargeTotale: parseFloat(getCellValue(sheet, 'D10')), // JH total
  dateDebut: parseDate(getCellValue(sheet, 'D11')),
  dateMEP: parseDate(getCellValue(sheet, 'D12')),
  dateValidation: parseDate(findCellValueByLabel(sheet, 'E9'))
};
```

3. **Parsing collaborateurs (lignes 18-30)**
```typescript
const collaborators: CollaboratorCharge[] = [];
let row = 18;

while (row <= 30) {
  const name = getCellValue(sheet, `A${row}`);
  
  if (!name || name === 'Charge / phase') break;
  
  // Validation stricte du nom
  const isValid = validateCollaboratorName(name);
  if (!isValid) {
    invalidCollaborators.push(name);
    row++;
    continue;
  }
  
  // Extraction charges par phase
  const collaborator = {
    name: String(name).trim(),
    instruction: parseFloat(getCellValue(sheet, `B${row}`) || 0),
    cadrage: parseFloat(getCellValue(sheet, `C${row}`) || 0),
    conception: parseFloat(getCellValue(sheet, `D${row}`) || 0),
    administration: parseFloat(getCellValue(sheet, `E${row}`) || 0),
    technique: parseFloat(getCellValue(sheet, `F${row}`) || 0),
    developpement: parseFloat(getCellValue(sheet, `G${row}`) || 0),
    testUnitaire: parseFloat(getCellValue(sheet, `H${row}`) || 0),
    testIntegration: parseFloat(getCellValue(sheet, `I${row}`) || 0),
    assistanceRecette: parseFloat(getCellValue(sheet, `J${row}`) || 0),
    deploiement: parseFloat(getCellValue(sheet, `K${row}`) || 0),
    assistancePost: parseFloat(getCellValue(sheet, `L${row}`) || 0),
    total: parseFloat(getCellValue(sheet, `M${row}`) || 0)
  };
  
  collaborators.push(collaborator);
  row++;
}
```

4. **Validation nom collaborateur**
```typescript
function validateCollaboratorName(name: string): boolean {
  const trimmed = name.trim();
  
  // Format 1: Avec parenthèses "Collaborateur (I.KADA)"
  if (/\([A-Za-zÀ-ÿ\s.]+\)/.test(trimmed)) {
    return true;
  }
  
  // Format 2: Multi-mots réels (minimum 2 mots alphabétiques)
  const words = trimmed.split(/\s+/)
    .filter(word => /^[A-Za-zÀ-ÿ\-'.]+$/.test(word));
  
  return words.length >= 2;
}

// Exemples:
// ✅ "Collaborateur (I.KADA)" → VALID
// ✅ "Jean Dupont" → VALID
// ✅ "Marie-Claire Martin" → VALID
// ❌ "Collaborateur 2" → INVALID
// ❌ "xxx" → INVALID
```

5. **Parsing planning (lignes 32-38)**
```typescript
const phases = [
  'Instruction', 'Cadrage', 'Conception', 
  'Réalisation', 'Recette', 'Déploiement', 
  'Post Déploiement'
];

const planning: PlanningPhase[] = phases.map((phase, i) => {
  const row = 32 + i;
  return {
    phase: getCellValue(sheet, `A${row}`) || phase,
    startDate: parseDate(getCellValue(sheet, `B${row}`)),
    endDate: parseDate(getCellValue(sheet, `C${row}`)),
    note: null
  };
});
```

6. **Calcul hash SHA256**
```typescript
const fileBuffer = fs.readFileSync(filePath);
const fileHash = crypto
  .createHash('sha256')
  .update(fileBuffer)
  .digest('hex');
```

7. **Retour objet ParsedExcel**
```typescript
return {
  metadata,
  collaborators,
  planning,
  fileHash,
  invalidCollaborators: invalidCollaborators.length > 0 
    ? invalidCollaborators 
    : undefined
};
```

---

### 7.2 Détection Doublons & Versioning

#### Fichier: app/api/upload/route.ts

**Algorithme**:
```typescript
async function handleUpload(parsedData: ParsedExcel, userId: string) {
  const { metadata, collaborators, planning, fileHash } = parsedData;
  
  // 1. Vérifier doublon exact (même hash)
  const existingVersion = await prisma.instructionVersion.findUnique({
    where: { fileHash },
    include: { project: true }
  });
  
  if (existingVersion) {
    throw new Error(
      `Fichier déjà uploadé: ${existingVersion.project.reference} v${existingVersion.versionNumber}`
    );
  }
  
  // 2. Chercher projet existant (même filiale + référence)
  let project = await prisma.project.findUnique({
    where: {
      filiale_reference: {
        filiale: metadata.filiale,
        reference: metadata.reference
      }
    },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1
      }
    }
  });
  
  let versionNumber = 1;
  let isNewProject = false;
  
  if (project) {
    // Projet existe → Nouvelle version
    const latestVersion = project.versions[0];
    versionNumber = latestVersion.versionNumber + 1;
  } else {
    // Nouveau projet
    project = await prisma.project.create({
      data: {
        filiale: metadata.filiale,
        reference: metadata.reference,
        title: metadata.titre,
        context: metadata.contexte
      }
    });
    isNewProject = true;
  }
  
  // 3. Créer nouvelle version (transaction atomique)
  const version = await prisma.$transaction(async (tx) => {
    const newVersion = await tx.instructionVersion.create({
      data: {
        projectId: project.id,
        versionNumber,
        fileHash,
        fileName: originalFileName,
        filePath: savedPath,
        demandeur: metadata.demandeur,
        chargeTotale: metadata.chargeTotale,
        dateDebut: metadata.dateDebut,
        dateMEP: metadata.dateMEP,
        dateValidation: metadata.dateValidation,
        status: 'NON_IMPUTE',
        uploadedBy: userId
      }
    });
    
    // Créer collaborateurs
    await tx.collaboratorLine.createMany({
      data: collaborators.map(c => ({
        versionId: newVersion.id,
        name: c.name,
        instruction: c.instruction,
        cadrage: c.cadrage,
        // ... autres phases
        total: c.total,
        isImputed: false
      }))
    });
    
    // Créer planning
    await tx.planningLine.createMany({
      data: planning.map(p => ({
        versionId: newVersion.id,
        phase: p.phase,
        startDate: p.startDate,
        endDate: p.endDate
      }))
    });
    
    return newVersion;
  });
  
  return {
    projectId: project.id,
    versionId: version.id,
    versionNumber,
    isNewProject
  };
}
```

---

### 7.3 Calcul Statut Imputation

#### Fichier: app/api/versions/[id]/imputation/route.ts

**Déclencheur**: Modification d'un ou plusieurs `isImputed` dans CollaboratorLine

**Algorithme**:
```typescript
async function updateImputationStatus(versionId: string) {
  // 1. Compter collaborateurs
  const stats = await prisma.collaboratorLine.aggregate({
    where: { versionId },
    _count: { id: true }
  });
  
  const totalCollaborators = stats._count.id;
  
  // 2. Compter collaborateurs imputés
  const imputedStats = await prisma.collaboratorLine.aggregate({
    where: { 
      versionId,
      isImputed: true
    },
    _count: { id: true }
  });
  
  const imputedCount = imputedStats._count.id;
  
  // 3. Déterminer statut
  let status: string;
  
  if (imputedCount === 0) {
    status = 'NON_IMPUTE';
  } else if (imputedCount < totalCollaborators) {
    status = 'PARTIEL';
  } else {
    status = 'IMPUTE';
  }
  
  // 4. Mettre à jour version
  await prisma.instructionVersion.update({
    where: { id: versionId },
    data: { status }
  });
  
  return status;
}
```

**Appel automatique**:
- Après chaque `PATCH /api/versions/[id]/imputation`
- Garantit cohérence statut en temps réel

---

### 7.4 Cumul JH - Requêtes Complexes

#### Par Projet (toutes versions)
```typescript
async function getCumulByProject(filters: AnalyticsFilters) {
  const data = await prisma.$queryRaw<ProjectCumul[]>`
    SELECT 
      p.id as projectId,
      p.filiale,
      p.reference,
      p.title,
      COUNT(DISTINCT iv.id) as nbVersions,
      SUM(iv.chargeTotale) as totalJH,
      MAX(iv.createdAt) as lastUpdate
    FROM Project p
    LEFT JOIN InstructionVersion iv ON iv.projectId = p.id
    WHERE 
      (${filters.filiale} IS NULL OR p.filiale = ${filters.filiale})
      AND (${filters.startDate} IS NULL OR iv.dateDebut >= ${filters.startDate})
      AND (${filters.endDate} IS NULL OR iv.dateDebut <= ${filters.endDate})
    GROUP BY p.id
    ORDER BY totalJH DESC
  `;
  
  return data;
}
```

#### Par Collaborateur (toutes participations)
```typescript
async function getCumulByCollaborator() {
  const data = await prisma.$queryRaw<CollaboratorCumul[]>`
    SELECT 
      cl.name,
      COUNT(DISTINCT iv.projectId) as nbProjets,
      COUNT(DISTINCT iv.id) as nbVersions,
      SUM(cl.total) as totalJH,
      SUM(cl.instruction) as JH_instruction,
      SUM(cl.cadrage) as JH_cadrage,
      SUM(cl.conception) as JH_conception,
      SUM(cl.administration) as JH_administration,
      SUM(cl.technique) as JH_technique,
      SUM(cl.developpement) as JH_developpement,
      SUM(cl.testUnitaire) as JH_testUnitaire,
      SUM(cl.testIntegration) as JH_testIntegration,
      SUM(cl.assistanceRecette) as JH_assistanceRecette,
      SUM(cl.deploiement) as JH_deploiement,
      SUM(cl.assistancePost) as JH_assistancePost
    FROM CollaboratorLine cl
    JOIN InstructionVersion iv ON iv.id = cl.versionId
    GROUP BY cl.name
    ORDER BY totalJH DESC
  `;
  
  return data;
}
```

#### Par Phase (toutes versions/projets)
```typescript
async function getCumulByPhase() {
  const data = await prisma.$queryRaw<PhaseCumul[]>`
    SELECT 
      'Instruction' as phase,
      SUM(cl.instruction) as totalJH,
      COUNT(DISTINCT cl.versionId) as nbVersions
    FROM CollaboratorLine cl
    
    UNION ALL
    
    SELECT 
      'Cadrage' as phase,
      SUM(cl.cadrage) as totalJH,
      COUNT(DISTINCT cl.versionId) as nbVersions
    FROM CollaboratorLine cl
    
    -- ... répéter pour toutes les phases
    
    ORDER BY totalJH DESC
  `;
  
  return data;
}
```

---

## 8. Sécurité

### 8.1 Authentification JWT

#### Génération Token
```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken';

export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}
```

#### Validation Token
```typescript
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as JWTPayload;
  } catch (error) {
    return null; // Token invalide ou expiré
  }
}
```

#### Middleware Protection
```typescript
// middleware.ts
export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect('/login');
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    // Token invalide → logout
    const response = NextResponse.redirect('/login');
    response.cookies.delete('token');
    return response;
  }
  
  // Token valide → continuer
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/upload/:path*', '/analytics/:path*']
};
```

---

### 8.2 Hachage Mots de Passe

```typescript
// lib/auth.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
```

**Utilisation au login**:
```typescript
// app/api/auth/login/route.ts
const user = await prisma.user.findUnique({
  where: { email }
});

if (!user) {
  return NextResponse.json(
    { error: 'Identifiants invalides' },
    { status: 401 }
  );
}

const isValid = await verifyPassword(password, user.passwordHash);

if (!isValid) {
  return NextResponse.json(
    { error: 'Identifiants invalides' },
    { status: 401 }
  );
}

// Génération JWT...
```

---

### 8.3 Sécurité Upload Fichiers

#### Validation Type MIME
```typescript
const allowedMimeTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel' // .xls (legacy)
];

if (!allowedMimeTypes.includes(file.mimetype)) {
  throw new Error('Type de fichier non autorisé');
}
```

#### Limitation Taille
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('Fichier trop volumineux (max 10MB)');
}
```

#### Stockage Sécurisé
```typescript
const safePath = path.join(
  process.cwd(),
  'public',
  'uploads',
  projectId,
  versionId,
  sanitizeFileName(originalName)
);

// Empêche path traversal
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Caractères safe uniquement
    .substring(0, 255); // Limite longueur
}
```

---

### 8.4 Protection CSRF & XSS

#### CSRF Protection
- JWT en cookie **httpOnly** (pas accessible via JavaScript)
- Pas de token CSRF nécessaire (lecture cookie côté serveur uniquement)

#### XSS Protection
- React échappe automatiquement le contenu
- Validation stricte des inputs (Zod)
- Content-Security-Policy headers (production)

```typescript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};
```

---

### 8.5 Validation Données (Zod)

```typescript
// lib/validations/upload.ts
import { z } from 'zod';

export const uploadSchema = z.object({
  file: z.object({
    name: z.string().min(1),
    size: z.number().max(10 * 1024 * 1024),
    type: z.enum([
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ])
  })
});

// Utilisation
try {
  uploadSchema.parse({ file });
} catch (error) {
  // Erreurs de validation détaillées
  return NextResponse.json(
    { error: error.errors },
    { status: 400 }
  );
}
```

---

### 8.6 Rate Limiting (Recommandé Production)

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requêtes / 10 secondes
});

export async function checkRateLimit(identifier: string) {
  const { success, remaining } = await ratelimit.limit(identifier);
  return { allowed: success, remaining };
}
```

---

## 9. Interface Utilisateur

### 9.1 Composants Réutilisables

#### PageContainer (Full-Width Layout)
```typescript
// components/layout/page-container.tsx
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn(
      "w-full min-h-screen bg-linear-to-br from-gray-50 to-gray-100",
      "px-4 sm:px-6 lg:px-8 py-8",
      className
    )}>
      <div className="max-w-screen-2xl mx-auto">
        {children}
      </div>
    </div>
  );
}
```

#### DataTable (Advanced)
```typescript
// components/ui/advanced-table.tsx
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchable?: boolean;
  paginated?: boolean;
}

export function DataTable<TData>({ 
  data, 
  columns, 
  searchable = true,
  paginated = true 
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  
  return (
    <div className="space-y-4">
      {searchable && <SearchBar />}
      <Table>
        {/* Render table */}
      </Table>
      {paginated && <PaginationControls table={table} />}
    </div>
  );
}
```

#### AdvancedStat (KPI Card)
```typescript
// components/ui/advanced-stats.tsx
interface AdvancedStatProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function AdvancedStat({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}: AdvancedStatProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          {trend && (
            <div className="flex items-center mt-2">
              {trend.isPositive ? <TrendingUp /> : <TrendingDown />}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-4 rounded-lg",
          colorClasses[color]
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}
```

---

### 9.2 Pages Principales

#### Dashboard
```typescript
// app/(protected)/dashboard/page.tsx
export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetch('/api/analytics/dashboard').then(r => r.json())
  });
  
  return (
    <PageContainer>
      <h1 className="text-4xl font-bold mb-8">Tableau de Bord</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AdvancedStat
          title="Projets Totaux"
          value={stats?.totalProjects || 0}
          icon={FolderOpen}
          color="blue"
        />
        <AdvancedStat
          title="Versions"
          value={stats?.totalVersions || 0}
          icon={FileText}
          color="green"
        />
        <AdvancedStat
          title="Total JH"
          value={stats?.totalJH || 0}
          icon={Clock}
          color="purple"
        />
        <AdvancedStat
          title="Collaborateurs"
          value={stats?.totalCollaborators || 0}
          icon={Users}
          color="orange"
        />
      </div>
      
      {/* Projets récents */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Projets Récents</h2>
        <RecentProjectsList />
      </Card>
    </PageContainer>
  );
}
```

#### Projects List
```typescript
// app/(protected)/projects/page.tsx
export default function ProjectsPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'TOUS',
    filiale: 'TOUTES'
  });
  
  const { data: projects } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetch(`/api/projects?${new URLSearchParams(filters)}`).then(r => r.json())
  });
  
  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Projets</h1>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2" />
            Nouveau
          </Link>
        </Button>
      </div>
      
      {/* Filtres */}
      <AdvancedFilter
        filters={filters}
        onChange={setFilters}
        options={{
          status: ['TOUS', 'NON_IMPUTE', 'PARTIEL', 'IMPUTE'],
          filiale: ['TOUTES', 'SCB', 'Autre']
        }}
      />
      
      {/* Grille de cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {projects?.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </PageContainer>
  );
}
```

#### Analytics
```typescript
// app/(protected)/analytics/page.tsx
export default function AnalyticsPage() {
  const [groupBy, setGroupBy] = useState<'project' | 'collaborator' | 'phase'>('project');
  
  const { data } = useQuery({
    queryKey: ['analytics', groupBy],
    queryFn: () => fetch(`/api/analytics/cumulation?groupBy=${groupBy}`).then(r => r.json())
  });
  
  return (
    <PageContainer>
      <h1 className="text-4xl font-bold mb-8">Analytics & Cumuls JH</h1>
      
      {/* Sélecteur vue */}
      <Tabs value={groupBy} onValueChange={setGroupBy} className="mb-8">
        <TabsList>
          <TabsTrigger value="project">Par Projet</TabsTrigger>
          <TabsTrigger value="collaborator">Par Collaborateur</TabsTrigger>
          <TabsTrigger value="phase">Par Phase</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Tableau + Graphique */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Détails</h2>
          <DataTable
            data={data?.data || []}
            columns={getColumnsFor(groupBy)}
            searchable
            paginated
          />
        </Card>
        
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Visualisation</h2>
          <BarChart data={data?.data || []} />
        </Card>
      </div>
    </PageContainer>
  );
}
```

---

### 9.3 Responsive Design

**Breakpoints TailwindCSS**:
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablette)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)
- `2xl`: 1536px (très large)

**Stratégie Mobile-First**:
```typescript
// Exemple: Grille adaptive
<div className={cn(
  "grid",
  "grid-cols-1",           // Mobile: 1 colonne
  "md:grid-cols-2",        // Tablette: 2 colonnes
  "lg:grid-cols-3",        // Desktop: 3 colonnes
  "xl:grid-cols-4",        // Large: 4 colonnes
  "gap-4 md:gap-6"         // Espacement adaptatif
)}>
  {items.map(item => <Card {...item} />)}
</div>
```

**Navigation Mobile**:
- Sidebar collapsible
- Menu hamburger < 768px
- Bottom navigation pour actions rapides

---

## 10. Déploiement & Infrastructure

### 10.1 Environnement Développement

**Prérequis**:
- Node.js 18+
- pnpm (recommandé) ou npm

**Installation**:
```bash
# Clone repo
git clone <repo-url>
cd excel-parsing-logic

# Install dependencies
pnpm install

# Setup database
pnpm prisma generate
pnpm prisma migrate dev

# Seed initial data (admin/user)
pnpm prisma db seed

# Run dev server
pnpm dev
```

**Variables environnement** (.env.local):
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret (générer avec: openssl rand -base64 32)
JWT_SECRET="your-super-secret-key-change-in-production"

# Node Environment
NODE_ENV="development"
```

---

### 10.2 Environnement Production

#### Option 1: Vercel (Recommandé)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Configuration Vercel**:
- Ajout variables d'environnement via dashboard
- Migration SQLite → PostgreSQL (Vercel Postgres)
- Activation Edge Functions si besoin

#### Option 2: Docker
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```bash
# Build & Run
docker build -t attijariwafa-tracker .
docker run -p 3000:3000 -e JWT_SECRET="xxx" attijariwafa-tracker
```

---

### 10.3 Migration SQLite → PostgreSQL

**Motivation**:
- SQLite OK pour dev/petit déploiement
- PostgreSQL recommandé pour production (concurrence, scalabilité)

**Étapes**:
1. **Mettre à jour prisma/schema.prisma**:
```prisma
datasource db {
  provider = "postgresql" // Changé de "sqlite"
  url      = env("DATABASE_URL")
}
```

2. **Nouvelle DATABASE_URL**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/attijariwafa_prod"
```

3. **Migration**:
```bash
pnpm prisma migrate dev --name init-postgres
pnpm prisma generate
```

4. **Export/Import données**:
```bash
# Export SQLite
sqlite3 prisma/dev.db .dump > backup.sql

# Convert to PostgreSQL (manual adaptation needed)
# Import to PostgreSQL
psql -d attijariwafa_prod -f backup_converted.sql
```

---

### 10.4 Backup & Restauration

#### Backup SQLite
```bash
# Backup complet
cp prisma/dev.db prisma/dev_backup_$(date +%Y%m%d).db

# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz public/uploads/
```

#### Backup PostgreSQL
```bash
# Dump database
pg_dump -U user -d attijariwafa_prod > backup_$(date +%Y%m%d).sql

# Backup uploads
aws s3 sync public/uploads/ s3://attijariwafa-uploads-backup/
```

---

### 10.5 Monitoring & Logs

#### Logging Structuré
```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Utilisation
logger.info('File uploaded', { 
  userId, 
  projectId, 
  fileSize 
});
```

#### Health Check Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    );
  }
}
```

---

## 11. Plan d'Évolution

### 11.1 Court Terme (1-3 mois)

#### Fonctionnalités
- [ ] **Export Excel/CSV** des analytics
- [ ] **Notifications email** (versions non imputées > 30 jours)
- [ ] **Commentaires** sur versions (collaboration)
- [ ] **Historique modifications** (audit log complet)

#### Technique
- [ ] **Migration PostgreSQL** (production)
- [ ] **Stockage cloud** (AWS S3 / Azure Blob pour uploads)
- [ ] **Tests automatisés** (Jest + React Testing Library)
- [ ] **CI/CD** (GitHub Actions)

---

### 11.2 Moyen Terme (3-6 mois)

#### Fonctionnalités
- [ ] **Workflow approbation** (manager valide uploads)
- [ ] **Génération PDF** automatique (rapports)
- [ ] **Comparaison versions** (diff visuel)
- [ ] **Templates Excel** (validation renforcée)
- [ ] **Gestion droits avancée** (rôles granulaires)

#### Technique
- [ ] **API GraphQL** (alternative REST)
- [ ] **WebSocket** (notifications temps réel)
- [ ] **Elasticsearch** (recherche full-text avancée)
- [ ] **Redis** (cache distribué)

---

### 11.3 Long Terme (6-12 mois)

#### Fonctionnalités
- [ ] **Machine Learning** (prédiction charges)
- [ ] **Intégration ERP/SIRH** Attijariwafa
- [ ] **Mobile app** (React Native)
- [ ] **Tableau de bord exécutif** (BI avancé)
- [ ] **Multi-tenancy** (plusieurs banques)

#### Technique
- [ ] **Microservices** (si nécessaire)
- [ ] **Kubernetes** (orchestration)
- [ ] **Event Sourcing** (CQRS)
- [ ] **Data Lake** (analytics avancés)

---

## 12. Annexes

### 12.1 Glossaire

| Terme | Définition |
|-------|------------|
| **JH** | Jour-Homme, unité de charge de travail |
| **Fiche Instruction** | Document Excel standardisé pour projets IT |
| **Imputation** | Validation qu'un collaborateur a bien travaillé sur une tâche |
| **Versioning** | Gestion de plusieurs révisions d'une même fiche |
| **Filiale** | Sous-division de la banque (ex: SCB) |
| **Cumul** | Somme des charges sur plusieurs projets/versions |
| **Phase** | Étape du cycle de vie projet (Cadrage, Conception, etc.) |

---

### 12.2 Références Techniques

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **TanStack Table**: https://tanstack.com/table
- **shadcn/ui**: https://ui.shadcn.com
- **TailwindCSS**: https://tailwindcss.com

---

### 12.3 Contacts Projet

| Rôle | Contact |
|------|---------|
| **Product Owner** | IT Africa Management |
| **Lead Developer** | [À définir] |
| **DevOps** | [À définir] |
| **Support** | support-it@attijariwafa.com |

---

## Conclusion

Ce document de **Conception Technique et Fonctionnelle** fournit une vue d'ensemble complète du projet **Attijariwafa Instruction Tracker**.

**Points clés**:
- ✅ Architecture monolithique moderne (Next.js App Router)
- ✅ Stack full-stack performant (React 19, Prisma, SQLite/PostgreSQL)
- ✅ Parsing Excel robuste avec validation stricte
- ✅ Sécurité renforcée (JWT, bcrypt, validations)
- ✅ Interface utilisateur moderne et responsive
- ✅ Cumuls JH avancés (par projet, collaborateur, phase)
- ✅ Prêt pour production avec plan d'évolution clair

**Statut actuel**: ✅ **Production Ready**

**Dernière mise à jour**: 3 Février 2026  
**Version**: 1.0
