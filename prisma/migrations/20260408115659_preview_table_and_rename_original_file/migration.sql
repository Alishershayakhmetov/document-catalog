/*
  Warnings:

  - You are about to drop the column `originalFilename` on the `File` table. All the data in the column will be lost.
  - Added the required column `uploadFilename` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PreviewStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
-- Rename the column to preserve data
ALTER TABLE "File" RENAME COLUMN "originalFilename" TO "uploadFilename";

-- CreateTable
CREATE TABLE "FilePreview" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "cachePath" TEXT,
    "status" "PreviewStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilePreview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FilePreview_fileId_key" ON "FilePreview"("fileId");

-- CreateIndex
CREATE INDEX "FilePreview_status_idx" ON "FilePreview"("status");

-- AddForeignKey
ALTER TABLE "FilePreview" ADD CONSTRAINT "FilePreview_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
