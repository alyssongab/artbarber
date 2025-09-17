-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('PENDENTE', 'CONCLUIDO', 'CANCELADO');

-- DropForeignKey
ALTER TABLE "public"."Appointment" DROP CONSTRAINT "Appointment_id_client_fkey";

-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "appointment_status" "public"."AppointmentStatus" NOT NULL DEFAULT 'PENDENTE',
ALTER COLUMN "id_client" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
