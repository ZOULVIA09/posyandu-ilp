-- CreateTable
CREATE TABLE "Peserta" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT,
    "alamat" TEXT,
    "kategori" TEXT NOT NULL,
    "hadir" BOOLEAN NOT NULL DEFAULT false,
    "tanggal" TEXT,
    "bulan" TEXT,
    "posId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Peserta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pemeriksaan" (
    "id" SERIAL NOT NULL,
    "pesertaId" INTEGER NOT NULL,
    "posId" INTEGER NOT NULL,
    "tanggal" TEXT,
    "kategori" TEXT NOT NULL,
    "bb" TEXT,
    "tb" TEXT,
    "lingkarKepala" TEXT,
    "lila" TEXT,
    "statusBbU" TEXT,
    "statusTbU" TEXT,
    "statusBbTb" TEXT,
    "statusLingkar" TEXT,
    "lansiaBb" TEXT,
    "lansiaTb" TEXT,
    "lingkarPerut" TEXT,
    "lilaLansia" TEXT,
    "tekananDarah" TEXT,
    "imt" TEXT,
    "statusImt" TEXT,
    "statusTekananDarah" TEXT,
    "usiaKehamilan" TEXT,
    "bbBumil" TEXT,
    "lilaBumil" TEXT,
    "tdBumil" TEXT,
    "imtBumil" TEXT,
    "statusImtBumil" TEXT,
    "statusLilaBumil" TEXT,
    "statusTdBumil" TEXT,
    "waktuKunjungan" TEXT,
    "bbNifas" TEXT,
    "tdNifas" TEXT,
    "remajaBb" TEXT,
    "remajaTb" TEXT,
    "lingkarPerutRemaja" TEXT,
    "tdRemaja" TEXT,
    "imtRemaja" TEXT,
    "statusImtRemaja" TEXT,
    "statusTdRemaja" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pemeriksaan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Peserta" ADD CONSTRAINT "Peserta_posId_fkey" FOREIGN KEY ("posId") REFERENCES "Posyandu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pemeriksaan" ADD CONSTRAINT "Pemeriksaan_pesertaId_fkey" FOREIGN KEY ("pesertaId") REFERENCES "Peserta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pemeriksaan" ADD CONSTRAINT "Pemeriksaan_posId_fkey" FOREIGN KEY ("posId") REFERENCES "Posyandu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
