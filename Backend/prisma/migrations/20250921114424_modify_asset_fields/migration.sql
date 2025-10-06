/*
  Warnings:

  - You are about to drop the column `frequency` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the `unknown` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `ModeComplaint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Asset" DROP COLUMN "frequency",
ADD COLUMN     "Company" TEXT NOT NULL DEFAULT 'Other',
ADD COLUMN     "pfrequency" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."ModeComplaint" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."unknown";
