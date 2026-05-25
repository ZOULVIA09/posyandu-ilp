/*
  Warnings:

  - You are about to drop the column `posyanduId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_posyanduId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "posyanduId",
ADD COLUMN     "currentPosId" INTEGER;

-- CreateTable
CREATE TABLE "_UserPosyandu" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserPosyandu_AB_unique" ON "_UserPosyandu"("A", "B");

-- CreateIndex
CREATE INDEX "_UserPosyandu_B_index" ON "_UserPosyandu"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentPosId_fkey" FOREIGN KEY ("currentPosId") REFERENCES "Posyandu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPosyandu" ADD CONSTRAINT "_UserPosyandu_A_fkey" FOREIGN KEY ("A") REFERENCES "Posyandu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPosyandu" ADD CONSTRAINT "_UserPosyandu_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
