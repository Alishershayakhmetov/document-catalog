/*
  Warnings:

  - You are about to drop the column `trcId` on the `Catalog` table. All the data in the column will be lost.
  - You are about to drop the column `subcatalogueId` on the `Documentation` table. All the data in the column will be lost.
  - You are about to drop the column `trcId` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the `Subcatalogue` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `mallId` to the `Catalog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcatalogId` to the `Documentation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Catalog" DROP CONSTRAINT "Catalog_trcId_fkey";

-- DropForeignKey
ALTER TABLE "Documentation" DROP CONSTRAINT "Documentation_subcatalogueId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_subcatalogueId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_trcId_fkey";

-- DropForeignKey
ALTER TABLE "Subcatalogue" DROP CONSTRAINT "Subcatalogue_catalogueId_fkey";

-- AlterTable
ALTER TABLE "Catalog" DROP COLUMN "trcId",
ADD COLUMN     "mallId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Documentation" DROP COLUMN "subcatalogueId",
ADD COLUMN     "subcatalogId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "trcId",
ADD COLUMN     "mallId" TEXT;

-- DropTable
DROP TABLE "Subcatalogue";

-- CreateTable
CREATE TABLE "Subcatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "catalogId" TEXT NOT NULL,

    CONSTRAINT "Subcatalog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Catalog" ADD CONSTRAINT "Catalog_mallId_fkey" FOREIGN KEY ("mallId") REFERENCES "Mall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcatalog" ADD CONSTRAINT "Subcatalog_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "Catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_subcatalogId_fkey" FOREIGN KEY ("subcatalogId") REFERENCES "Subcatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_mallId_fkey" FOREIGN KEY ("mallId") REFERENCES "Mall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_subcatalogueId_fkey" FOREIGN KEY ("subcatalogueId") REFERENCES "Subcatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
