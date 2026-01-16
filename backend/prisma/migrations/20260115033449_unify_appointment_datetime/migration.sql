/*
  Warnings:

  - You are about to drop the column `appointment_date` on the `agendamentos` table. All the data in the column will be lost.
  - You are about to drop the column `appointment_time` on the `agendamentos` table. All the data in the column will be lost.
  - Added the required column `appointment_datetime` to the `agendamentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agendamentos" DROP COLUMN "appointment_date",
DROP COLUMN "appointment_time",
ADD COLUMN     "appointment_datetime" TIMESTAMP(3) NOT NULL;
