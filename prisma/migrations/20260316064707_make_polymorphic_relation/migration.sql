/*
  Warnings:

  - You are about to drop the `Catalogue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TRC` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subcatalogueId` to the `Documentation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalogueId` to the `Subcatalogue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_catalogueId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_trcId_fkey";

-- AlterTable
ALTER TABLE "Documentation" ADD COLUMN     "subcatalogueId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subcatalogue" ADD COLUMN     "catalogueId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Catalogue";

-- DropTable
DROP TABLE "TRC";

-- CreateTable
CREATE TABLE "Mall" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Catalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trcId" TEXT NOT NULL,

    CONSTRAINT "Catalog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Catalog" ADD CONSTRAINT "Catalog_trcId_fkey" FOREIGN KEY ("trcId") REFERENCES "Mall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcatalogue" ADD CONSTRAINT "Subcatalogue_catalogueId_fkey" FOREIGN KEY ("catalogueId") REFERENCES "Catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_subcatalogueId_fkey" FOREIGN KEY ("subcatalogueId") REFERENCES "Subcatalogue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_trcId_fkey" FOREIGN KEY ("trcId") REFERENCES "Mall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_catalogueId_fkey" FOREIGN KEY ("catalogueId") REFERENCES "Catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
