# 📅 Imputation Quotidienne - Documentation

## Vue d'Ensemble

Le système d'**imputation quotidienne** permet un suivi granulaire jour par jour de l'avancement des collaborateurs sur chaque phase du projet.

## Fonctionnement

### 1. Génération Automatique

Lors de l'upload d'un fichier Excel :
1. Le parser extrait les charges par phase (instruction: 3 JH, cadrage: 5 JH, etc.)
2. Pour chaque phase avec une charge > 0, le système crée automatiquement **autant de lignes que de jours**
3. Exemple : Si instruction = 3 JH → 3 lignes créées (Jour 1, Jour 2, Jour 3)

### 2. Table DailyImputation

```prisma
model DailyImputation {
  id              String   @id @default(cuid())
  collaboratorId  String
  phase           String   // instruction, cadrage, conception, etc.
  dayNumber       Int      // 1, 2, 3, ...
  datePrevu       DateTime? // Date calculée depuis le planning
  isImputed       Boolean  @default(false)
  imputedAt       DateTime?
  imputedBy       String?
  comment         String?
}
```

### 3. Calcul des Dates

Le système calcule automatiquement les dates prévues :
- Commence à `startDate` de la phase
- Saute les weekends (samedi/dimanche)
- Incrémente jour par jour

**Exemple** :
- Phase Instruction : 3 jours
- Date début : Lundi 5 Février
- Dates générées :
  - Jour 1 : Lundi 5 Février
  - Jour 2 : Mardi 6 Février
  - Jour 3 : Mercredi 7 Février

### 4. Interface Utilisateur

#### Tableau d'Imputation
- **Vue par phase** : Toutes les phases regroupées
- **Checkbox par jour** : Imputation instantanée
- **Progression visuelle** : Barre de progression par phase et globale
- **Commentaires** : Optionnel pour chaque jour
- **Badges de statut** : 
  - 🟢 Imputé
  - 🟡 En attente

#### Statistiques
- Total jours prévus
- Jours imputés
- Jours restants
- Pourcentage de progression
- Détail par phase
- Détail par collaborateur

## API Endpoints

### GET /api/daily-imputation
Récupérer les imputations

**Query Parameters:**
- `collaboratorId`: ID du collaborateur
- `versionId`: ID de la version

**Response:**
```json
{
  "dailyImputations": [
    {
      "id": "xxx",
      "phase": "instruction",
      "dayNumber": 1,
      "datePrevu": "2026-02-05",
      "isImputed": true,
      "imputedAt": "2026-02-05T10:30:00Z"
    }
  ],
  "stats": {
    "total": 25,
    "imputed": 10,
    "remaining": 15,
    "percentage": 40
  }
}
```

### PATCH /api/daily-imputation/[id]
Marquer/démarquer une imputation

**Body:**
```json
{
  "isImputed": true,
  "userId": "user-id",
  "comment": "Travail terminé"
}
```

**Response:**
```json
{
  "success": true,
  "dailyImputation": {...},
  "collaboratorStatus": "PARTIEL",
  "versionStatus": "PARTIEL",
  "stats": {
    "totalDays": 25,
    "imputedDays": 11,
    "remainingDays": 14
  }
}
```

## Calcul des Statuts

### Statut Collaborateur
Calculé automatiquement à chaque imputation :
- **NON_IMPUTE** : 0% imputé
- **PARTIEL** : 1-99% imputé
- **IMPUTE** : 100% imputé

### Statut Version
Calculé automatiquement après mise à jour collaborateur :
- **NON_IMPUTE** : Aucun collaborateur imputé à 100%
- **PARTIEL** : Au moins un collaborateur imputé à 100%
- **IMPUTE** : Tous collaborateurs imputés à 100%

## Flux de Données

```
1. Upload Excel
   ↓
2. Parser extrait charges par phase
   ↓
3. generateDailyImputations()
   - Convertit JH en jours (Math.ceil)
   - Génère lignes pour chaque jour
   - Calcule dates prévues
   ↓
4. Création en DB (batch)
   ↓
5. UI affiche tableau interactif
   ↓
6. Collaborateur coche jour
   ↓
7. API met à jour statuts (jour → collab → version)
```

## Exemple d'Utilisation

### 1. Upload Fichier
```typescript
// Fichier contient:
// Collaborateur: Jean Dupont
// Instruction: 3 JH
// Cadrage: 5 JH
// Conception: 10 JH
```

### 2. Génération Automatique
```typescript
// 18 lignes créées automatiquement:
// - 3 lignes pour Instruction (jours 1-3)
// - 5 lignes pour Cadrage (jours 1-5)
// - 10 lignes pour Conception (jours 1-10)
```

### 3. Interface
```
┌─────────────────────────────────────────────┐
│ Imputation Quotidienne - Jean Dupont       │
│ Progression: 40% (7/18 jours)              │
└─────────────────────────────────────────────┘

┌─ Instruction (3 jours) ───────────────────┐
│ ☑ Jour 1 - Lun 05 Fév - Imputé           │
│ ☑ Jour 2 - Mar 06 Fév - Imputé           │
│ ☐ Jour 3 - Mer 07 Fév - En attente       │
└───────────────────────────────────────────┘

┌─ Cadrage (5 jours) ───────────────────────┐
│ ☑ Jour 1 - Jeu 08 Fév - Imputé           │
│ ☑ Jour 2 - Ven 09 Fév - Imputé           │
│ ☑ Jour 3 - Lun 12 Fév - Imputé           │
│ ☑ Jour 4 - Mar 13 Fév - Imputé           │
│ ☐ Jour 5 - Mer 14 Fév - En attente       │
└───────────────────────────────────────────┘
```

## Composants

### DailyImputationTable
Tableau interactif principal
- Props: `collaboratorId`, `collaboratorName`, `dailyImputations`
- Features: Checkbox, commentaires, progression

### ImputationStatsWidget
Widget statistiques
- Props: `stats`
- Features: KPIs, graphiques, progression par phase

## Performance

- **Batch Insert** : Toutes les lignes créées en une transaction
- **Index** : Sur `collaboratorId`, `phase`, `(collaboratorId, phase, dayNumber)`
- **Cascade Delete** : Suppression auto si collaborateur supprimé

## Avantages

✅ **Granularité** : Suivi jour par jour
✅ **Automatique** : Génération à l'upload
✅ **Flexible** : Commentaires par jour
✅ **Visuel** : Progression claire
✅ **Performant** : Batch operations
✅ **Cohérent** : Statuts calculés auto

## Roadmap

- [ ] Export Excel des imputations
- [ ] Notifications email (jours en retard)
- [ ] Validation manager
- [ ] Historique modifications
- [ ] Import manuel d'imputations
