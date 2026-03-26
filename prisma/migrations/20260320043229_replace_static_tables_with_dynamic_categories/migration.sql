/*
  Warnings:

  - You are about to drop the column `catalogId` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the column `documentationId` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the column `mallId` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the column `subcatalogId` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the `Catalog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Documentation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mall` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subcatalog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Catalog" DROP CONSTRAINT "Catalog_mallId_fkey";

-- DropForeignKey
ALTER TABLE "Documentation" DROP CONSTRAINT "Documentation_subcatalogId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_catalogId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_documentationId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_mallId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_subcatalogId_fkey";

-- DropForeignKey
ALTER TABLE "Subcatalog" DROP CONSTRAINT "Subcatalog_catalogId_fkey";

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "catalogId",
DROP COLUMN "documentationId",
DROP COLUMN "mallId",
DROP COLUMN "subcatalogId",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Catalog";

-- DropTable
DROP TABLE "Documentation";

-- DropTable
DROP TABLE "Mall";

-- DropTable
DROP TABLE "Subcatalog";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_path_idx" ON "Category"("path");

-- CreateIndex
CREATE INDEX "File_systemName_idx" ON "File"("systemName");

-- CreateIndex
CREATE INDEX "File_description_idx" ON "File"("description");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
