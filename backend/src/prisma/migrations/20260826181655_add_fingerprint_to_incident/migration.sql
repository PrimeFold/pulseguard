/*
  Warnings:

  - Added the required column `fingerprint` to the `AgentExecution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Level" ADD VALUE 'DEBUG';

-- AlterTable
ALTER TABLE "AgentExecution" ADD COLUMN     "fingerprint" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "fingerprint" TEXT;

-- AlterTable
ALTER TABLE "TelemetryLog" ADD COLUMN     "fingerprint" TEXT,
ADD COLUMN     "incidentId" TEXT;

-- CreateTable
CREATE TABLE "_AgentExecutionToTelemetryLog" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AgentExecutionToTelemetryLog_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AgentExecutionToTelemetryLog_B_index" ON "_AgentExecutionToTelemetryLog"("B");

-- AddForeignKey
ALTER TABLE "_AgentExecutionToTelemetryLog" ADD CONSTRAINT "_AgentExecutionToTelemetryLog_A_fkey" FOREIGN KEY ("A") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentExecutionToTelemetryLog" ADD CONSTRAINT "_AgentExecutionToTelemetryLog_B_fkey" FOREIGN KEY ("B") REFERENCES "TelemetryLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
