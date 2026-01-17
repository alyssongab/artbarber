-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "servicos" ADD COLUMN     "service_status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE';
