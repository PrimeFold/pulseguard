/*
  Warnings:

  - You are about to drop the column `apiKey` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "apiKey",
ADD COLUMN     "apiKeyDisplay" TEXT;
