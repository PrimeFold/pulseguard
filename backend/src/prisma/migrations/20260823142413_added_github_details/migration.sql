/*
  Warnings:

  - You are about to drop the `verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "githubDefaultRepo" TEXT,
ADD COLUMN     "githubInstallationId" INTEGER,
ADD COLUMN     "githubOwner" TEXT;

-- DropTable
DROP TABLE "verification";
