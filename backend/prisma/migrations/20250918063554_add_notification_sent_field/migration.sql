/*
  Warnings:

  - You are about to drop the column `notification_set` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Appointment" DROP COLUMN "notification_set",
ADD COLUMN     "notification_sent" BOOLEAN NOT NULL DEFAULT false;
