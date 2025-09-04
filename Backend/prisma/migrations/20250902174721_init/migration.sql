/*
  Warnings:

  - You are about to drop the column `location` on the `Asset` table. All the data in the column will be lost.
  - Added the required column `Details` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Images` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Asset" DROP COLUMN "location",
ADD COLUMN     "Details" TEXT NOT NULL,
ADD COLUMN     "Images" TEXT NOT NULL,
ADD COLUMN     "line" geometry(LineString, 4326),
ADD COLUMN     "point" geometry(Point, 4326);
