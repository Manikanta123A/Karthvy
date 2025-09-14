/*
  Warnings:

  - Added the required column `kpin` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Asset" ADD COLUMN     "kpin" TEXT NOT NULL;
