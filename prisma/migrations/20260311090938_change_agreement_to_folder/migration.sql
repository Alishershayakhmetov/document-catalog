/*
  Warnings:

  - You are about to drop the column `agreementId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the `Agreement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `folderId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_agreementId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "agreementId",
ADD COLUMN     "folderId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Agreement";

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
