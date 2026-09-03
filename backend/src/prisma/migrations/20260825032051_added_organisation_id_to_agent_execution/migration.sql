/*
  Warnings:

  - Added the required column `organizationId` to the `AgentExecution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AgentExecution" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
