-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filiale" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT,
    "context" TEXT
);

-- CreateTable
CREATE TABLE "InstructionVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "fileHash" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "demandeur" TEXT,
    "chargeTotale" REAL NOT NULL,
    "dateDebut" DATETIME,
    "dateMEP" DATETIME,
    "dateValidation" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'NON_IMPUTE',
    "imputedBy" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstructionVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InstructionVersion_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CollaboratorLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
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
    CONSTRAINT "CollaboratorLine_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "InstructionVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanningLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versionId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlanningLine_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "InstructionVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_filiale_idx" ON "Project"("filiale");

-- CreateIndex
CREATE UNIQUE INDEX "Project_filiale_reference_key" ON "Project"("filiale", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "InstructionVersion_fileHash_key" ON "InstructionVersion"("fileHash");

-- CreateIndex
CREATE INDEX "InstructionVersion_projectId_idx" ON "InstructionVersion"("projectId");

-- CreateIndex
CREATE INDEX "InstructionVersion_fileHash_idx" ON "InstructionVersion"("fileHash");

-- CreateIndex
CREATE UNIQUE INDEX "InstructionVersion_projectId_versionNumber_key" ON "InstructionVersion"("projectId", "versionNumber");

-- CreateIndex
CREATE INDEX "CollaboratorLine_versionId_idx" ON "CollaboratorLine"("versionId");

-- CreateIndex
CREATE INDEX "PlanningLine_versionId_idx" ON "PlanningLine"("versionId");
