/*
  Warnings:

  - You are about to drop the column `posId` on the `Peserta` table. All the data in the column will be lost.
  - You are about to drop the column `tanggal` on the `Peserta` table. All the data in the column will be lost.
  - Added the required column `pos` to the `Peserta` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Peserta" DROP CONSTRAINT "Peserta_posId_fkey";

-- AlterTable
ALTER TABLE "Peserta" DROP COLUMN "posId",
DROP COLUMN "tanggal",
ADD COLUMN     "beratLahir" TEXT,
ADD COLUMN     "desa" TEXT,
ADD COLUMN     "dusun" TEXT,
ADD COLUMN     "kecamatan" TEXT,
ADD COLUMN     "noHp" TEXT,
ADD COLUMN     "ortu" TEXT,
ADD COLUMN     "panjangLahir" TEXT,
ADD COLUMN     "pekerjaan" TEXT,
ADD COLUMN     "pos" TEXT NOT NULL,
ADD COLUMN     "posyanduId" INTEGER,
ADD COLUMN     "statusNikah" TEXT,
ADD COLUMN     "tekanan" TEXT,
ADD COLUMN     "tglLahir" TEXT;

-- AddForeignKey
ALTER TABLE "Peserta" ADD CONSTRAINT "Peserta_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "Posyandu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
