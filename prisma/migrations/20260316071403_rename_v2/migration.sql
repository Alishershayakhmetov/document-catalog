/*
  Warnings:

  - You are about to drop the column `catalogueId` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the column `subcatalogueId` on the `Folder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_catalogueId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_subcatalogueId_fkey";

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "catalogueId",
DROP COLUMN "subcatalogueId",
ADD COLUMN     "catalogId" TEXT,
ADD COLUMN     "subcatalogId" TEXT;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "Catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_subcatalogId_fkey" FOREIGN KEY ("subcatalogId") REFERENCES "Subcatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
