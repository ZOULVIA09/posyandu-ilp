-- AlterTable
ALTER TABLE "Pelayanan" ADD COLUMN     "createdById" INTEGER;

-- AlterTable
ALTER TABLE "Pemeriksaan" ADD COLUMN     "createdById" INTEGER;

-- AlterTable
ALTER TABLE "Peserta" ADD COLUMN     "createdById" INTEGER;

-- CreateIndex
CREATE INDEX "Pelayanan_createdById_idx" ON "Pelayanan"("createdById");

-- CreateIndex
CREATE INDEX "Pelayanan_pesertaId_idx" ON "Pelayanan"("pesertaId");

-- CreateIndex
CREATE INDEX "Pelayanan_pemeriksaanId_idx" ON "Pelayanan"("pemeriksaanId");

-- CreateIndex
CREATE INDEX "Pemeriksaan_createdById_idx" ON "Pemeriksaan"("createdById");

-- CreateIndex
CREATE INDEX "Pemeriksaan_posId_createdById_idx" ON "Pemeriksaan"("posId", "createdById");

-- CreateIndex
CREATE INDEX "Pemeriksaan_pesertaId_idx" ON "Pemeriksaan"("pesertaId");

-- CreateIndex
CREATE INDEX "Peserta_createdById_idx" ON "Peserta"("createdById");

-- CreateIndex
CREATE INDEX "Peserta_posId_createdById_idx" ON "Peserta"("posId", "createdById");

-- AddForeignKey
ALTER TABLE "Peserta" ADD CONSTRAINT "Peserta_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pemeriksaan" ADD CONSTRAINT "Pemeriksaan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pelayanan" ADD CONSTRAINT "Pelayanan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
