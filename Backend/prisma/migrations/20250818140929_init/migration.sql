-- CreateTable


CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;


CREATE TABLE "public"."unknown" (
    "id" TEXT NOT NULL,
    "adhar" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "otp" TEXT NOT NULL,

    CONSTRAINT "unknown_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unknown_adhar_key" ON "public"."unknown"("adhar");

-- CreateIndex
CREATE UNIQUE INDEX "unknown_phoneNumber_key" ON "public"."unknown"("phoneNumber");
