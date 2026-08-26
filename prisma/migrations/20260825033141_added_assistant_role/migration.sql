-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ASSISTANT';

-- AlterTable
ALTER TABLE "IncidentMessage" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ASSISTANT';
