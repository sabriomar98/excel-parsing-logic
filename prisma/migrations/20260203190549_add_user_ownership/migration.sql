/*
  Warnings:

  - Added the required column `userId` to the `CollaboratorLine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `DailyImputation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- Get the first admin user's ID
-- We'll assign all existing data to this user

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Add userId column to Project with default value (first admin user)
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filiale" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT,
    "context" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy existing projects and assign to first admin user
INSERT INTO "new_Project" ("id", "filiale", "reference", "title", "context", "userId") 
SELECT "id", "filiale", "reference", "title", "context", 
  (SELECT id FROM User WHERE role = 'admin' LIMIT 1) as userId
FROM "Project";

DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE INDEX "Project_filiale_idx" ON "Project"("filiale");
CREATE INDEX "Project_userId_idx" ON "Project"("userId");
CREATE UNIQUE INDEX "Project_filiale_reference_userId_key" ON "Project"("filiale", "reference", "userId");

-- Add userId column to CollaboratorLine
CREATE TABLE "new_CollaboratorLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instruction" REAL NOT NULL DEFAULT 0,
    "cadrage" REAL NOT NULL DEFAULT 0,
    "conception" REAL NOT NULL DEFAULT 0,
    "administration" REAL NOT NULL DEFAULT 0,
    "technique" REAL NOT NULL DEFAULT 0,
    "developpement" REAL NOT NULL DEFAULT 0,
    "testUnitaire" REAL NOT NULL DEFAULT 0,
    "testIntegration" REAL NOT NULL DEFAULT 0,
    "assistanceRecette" REAL NOT NULL DEFAULT 0,
    "deploiement" REAL NOT NULL DEFAULT 0,
    "assistancePost" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "isImputed" BOOLEAN NOT NULL DEFAULT false,
    "imputedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CollaboratorLine_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "InstructionVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollaboratorLine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy existing collaborators and assign to first admin user
INSERT INTO "new_CollaboratorLine" ("id", "versionId", "name", "instruction", "cadrage", "conception", 
  "administration", "technique", "developpement", "testUnitaire", "testIntegration", 
  "assistanceRecette", "deploiement", "assistancePost", "total", "isImputed", "imputedAt", 
  "createdAt", "updatedAt", "userId") 
SELECT "id", "versionId", "name", "instruction", "cadrage", "conception", 
  "administration", "technique", "developpement", "testUnitaire", "testIntegration", 
  "assistanceRecette", "deploiement", "assistancePost", "total", "isImputed", "imputedAt", 
  "createdAt", "updatedAt",
  (SELECT id FROM User WHERE role = 'admin' LIMIT 1) as userId
FROM "CollaboratorLine";

DROP TABLE "CollaboratorLine";
ALTER TABLE "new_CollaboratorLine" RENAME TO "CollaboratorLine";
CREATE INDEX "CollaboratorLine_versionId_idx" ON "CollaboratorLine"("versionId");
CREATE INDEX "CollaboratorLine_userId_idx" ON "CollaboratorLine"("userId");

-- Add userId column to DailyImputation
CREATE TABLE "new_DailyImputation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collaboratorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "datePrevu" DATETIME,
    "isImputed" BOOLEAN NOT NULL DEFAULT false,
    "imputedAt" DATETIME,
    "imputedBy" TEXT,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyImputation_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "CollaboratorLine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DailyImputation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy existing daily imputations and assign to first admin user
INSERT INTO "new_DailyImputation" ("id", "collaboratorId", "phase", "dayNumber", "datePrevu", 
  "isImputed", "imputedAt", "imputedBy", "comment", "createdAt", "updatedAt", "userId") 
SELECT "id", "collaboratorId", "phase", "dayNumber", "datePrevu", 
  "isImputed", "imputedAt", "imputedBy", "comment", "createdAt", "updatedAt",
  (SELECT id FROM User WHERE role = 'admin' LIMIT 1) as userId
FROM "DailyImputation";

DROP TABLE "DailyImputation";
ALTER TABLE "new_DailyImputation" RENAME TO "DailyImputation";
CREATE INDEX "DailyImputation_collaboratorId_idx" ON "DailyImputation"("collaboratorId");
CREATE INDEX "DailyImputation_phase_idx" ON "DailyImputation"("phase");
CREATE INDEX "DailyImputation_userId_idx" ON "DailyImputation"("userId");
CREATE UNIQUE INDEX "DailyImputation_collaboratorId_phase_dayNumber_key" ON "DailyImputation"("collaboratorId", "phase", "dayNumber");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
