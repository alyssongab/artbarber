/*
  Warnings:

  - Added the required column `duration` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "duration" INTEGER NOT NULL;
