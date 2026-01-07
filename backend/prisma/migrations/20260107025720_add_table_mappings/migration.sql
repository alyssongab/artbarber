/*
  Warnings:

  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_id_barber_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_id_client_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_id_service_fkey";

-- DropTable
DROP TABLE "Appointment";

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "usuarios" (
    "user_id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "birthday" DATE,
    "cpf" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "photo_url" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "service_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "appointment_id" SERIAL NOT NULL,
    "appointment_date" DATE NOT NULL,
    "appointment_time" TIME NOT NULL,
    "appointment_status" "AppointmentStatus" NOT NULL DEFAULT 'PENDENTE',
    "id_barber" INTEGER NOT NULL,
    "id_client" INTEGER,
    "id_service" INTEGER NOT NULL,
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_id_barber_fkey" FOREIGN KEY ("id_barber") REFERENCES "usuarios"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "usuarios"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_id_service_fkey" FOREIGN KEY ("id_service") REFERENCES "servicos"("service_id") ON DELETE RESTRICT ON UPDATE CASCADE;
