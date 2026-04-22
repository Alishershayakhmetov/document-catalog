/*
  Warnings:

  - You are about to drop the `FilePreview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FilePreview" DROP CONSTRAINT "FilePreview_fileId_fkey";

-- DropTable
DROP TABLE "FilePreview";

-- DropTable
DROP TABLE "Users";

-- DropEnum
DROP TYPE "PreviewStatus";

-- DropEnum
DROP TYPE "Role";
