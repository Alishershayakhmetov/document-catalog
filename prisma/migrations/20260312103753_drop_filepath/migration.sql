/*
  Warnings:

  - You are about to drop the column `filePath` on the `File` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "File_filePath_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "filePath";
