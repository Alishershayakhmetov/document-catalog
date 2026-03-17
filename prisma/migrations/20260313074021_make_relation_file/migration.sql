/*
  Warnings:

  - Added the required column `catalogueId` to the `Folder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentationId` to the `Folder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcatalogueId` to the `Folder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trcId` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "catalogueId" TEXT NOT NULL,
ADD COLUMN     "documentationId" TEXT NOT NULL,
ADD COLUMN     "subcatalogueId" TEXT NOT NULL,
ADD COLUMN     "trcId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_trcId_fkey" FOREIGN KEY ("trcId") REFERENCES "TRC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "Documentation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_catalogueId_fkey" FOREIGN KEY ("catalogueId") REFERENCES "Catalogue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_subcatalogueId_fkey" FOREIGN KEY ("subcatalogueId") REFERENCES "Subcatalogue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
