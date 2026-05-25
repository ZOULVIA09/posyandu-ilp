/*
  Warnings:

  - You are about to drop the column `posyanduId` on the `Peserta` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Peserta" DROP CONSTRAINT "Peserta_posyanduId_fkey";

-- AlterTable
ALTER TABLE "Peserta" DROP COLUMN "posyanduId",
ADD COLUMN     "anakKe" TEXT,
ADD COLUMN     "berat" TEXT,
ADD COLUMN     "caraPersalinan" TEXT,
ADD COLUMN     "desaRemaja" TEXT,
ADD COLUMN     "dusunRemaja" TEXT,
ADD COLUMN     "garam" TEXT,
ADD COLUMN     "gula" TEXT,
ADD COLUMN     "jenisKelamin" TEXT,
ADD COLUMN     "kecamatanRemaja" TEXT,
ADD COLUMN     "kehamilan" TEXT,
ADD COLUMN     "lemak" TEXT,
ADD COLUMN     "merokok" TEXT,
ADD COLUMN     "noHpRemaja" TEXT,
ADD COLUMN     "ortuRemaja" TEXT,
ADD COLUMN     "posId" INTEGER,
ADD COLUMN     "riwayatDiri" TEXT[],
ADD COLUMN     "riwayatDiriRemaja" TEXT[],
ADD COLUMN     "riwayatKeluarga" TEXT[],
ADD COLUMN     "riwayatKeluargaRemaja" TEXT[],
ADD COLUMN     "tglPersalinan" TEXT,
ADD COLUMN     "tinggiBadan" TEXT,
ALTER COLUMN "hadir" DROP NOT NULL,
ALTER COLUMN "hadir" DROP DEFAULT,
ALTER COLUMN "pos" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Peserta" ADD CONSTRAINT "Peserta_posId_fkey" FOREIGN KEY ("posId") REFERENCES "Posyandu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
