/*
  Warnings:

  - You are about to drop the `ApiKey` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_organizationId_fkey";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "apiKey" TEXT,
ADD COLUMN     "apiKeyHash" TEXT;

-- DropTable
DROP TABLE "ApiKey";
