-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "filiale" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT,
    "context" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructionVersion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "fileHash" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "demandeur" TEXT,
    "chargeTotale" DOUBLE PRECISION NOT NULL,
    "dateDebut" TIMESTAMP(3),
    "dateMEP" TIMESTAMP(3),
    "dateValidation" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'NON_IMPUTE',
    "imputedBy" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaboratorLine" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instruction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cadrage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conception" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "administration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "technique" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "developpement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "testUnitaire" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "testIntegration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assistanceRecette" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deploiement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assistancePost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isImputed" BOOLEAN NOT NULL DEFAULT false,
    "imputedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaboratorLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyImputation" (
    "id" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "datePrevu" TIMESTAMP(3),
    "isImputed" BOOLEAN NOT NULL DEFAULT false,
    "imputedAt" TIMESTAMP(3),
    "imputedBy" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyImputation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanningLine" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_filiale_idx" ON "Project"("filiale");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_filiale_reference_userId_key" ON "Project"("filiale", "reference", "userId");

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
CREATE INDEX "CollaboratorLine_userId_idx" ON "CollaboratorLine"("userId");

-- CreateIndex
CREATE INDEX "DailyImputation_collaboratorId_idx" ON "DailyImputation"("collaboratorId");

-- CreateIndex
CREATE INDEX "DailyImputation_phase_idx" ON "DailyImputation"("phase");

-- CreateIndex
CREATE INDEX "DailyImputation_userId_idx" ON "DailyImputation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyImputation_collaboratorId_phase_dayNumber_key" ON "DailyImputation"("collaboratorId", "phase", "dayNumber");

-- CreateIndex
CREATE INDEX "PlanningLine_versionId_idx" ON "PlanningLine"("versionId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructionVersion" ADD CONSTRAINT "InstructionVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructionVersion" ADD CONSTRAINT "InstructionVersion_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorLine" ADD CONSTRAINT "CollaboratorLine_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "InstructionVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorLine" ADD CONSTRAINT "CollaboratorLine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyImputation" ADD CONSTRAINT "DailyImputation_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "CollaboratorLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyImputation" ADD CONSTRAINT "DailyImputation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningLine" ADD CONSTRAINT "PlanningLine_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "InstructionVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
