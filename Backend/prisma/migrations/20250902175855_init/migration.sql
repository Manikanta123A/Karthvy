-- CreateTable
CREATE TABLE "public"."ModeComplaint" (
    "id" SERIAL NOT NULL,
    "complaintId" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,

    CONSTRAINT "ModeComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModeComplaint_complaintId_key" ON "public"."ModeComplaint"("complaintId");
