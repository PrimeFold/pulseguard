/*
  Warnings:

  - Changed the type of `level` on the `TelemetryLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Level" AS ENUM ('FATAL', 'ERROR', 'WARN');

-- AlterTable
ALTER TABLE "TelemetryLog" DROP COLUMN "level",
ADD COLUMN     "level" "Level" NOT NULL;
