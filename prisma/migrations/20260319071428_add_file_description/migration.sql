-- DropIndex
DROP INDEX "folder_name_trgm_idx";

-- DropIndex
DROP INDEX "folder_search_idx";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "description" TEXT;
