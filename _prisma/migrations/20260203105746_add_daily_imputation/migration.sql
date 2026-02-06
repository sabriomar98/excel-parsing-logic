-- CreateTable
CREATE TABLE "DailyImputation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collaboratorId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "datePrevu" DATETIME,
    "isImputed" BOOLEAN NOT NULL DEFAULT false,
    "imputedAt" DATETIME,
    "imputedBy" TEXT,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyImputation_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "CollaboratorLine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DailyImputation_collaboratorId_idx" ON "DailyImputation"("collaboratorId");

-- CreateIndex
CREATE INDEX "DailyImputation_phase_idx" ON "DailyImputation"("phase");

-- CreateIndex
CREATE UNIQUE INDEX "DailyImputation_collaboratorId_phase_dayNumber_key" ON "DailyImputation"("collaboratorId", "phase", "dayNumber");
