-- CreateTable

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- If you’re also using embeddings
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "public"."Asset" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,
    "frequency" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);
