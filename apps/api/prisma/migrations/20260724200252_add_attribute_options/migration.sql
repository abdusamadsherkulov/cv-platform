-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "options" TEXT[] DEFAULT ARRAY[]::TEXT[];
