import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

// =============================
// GET PELAYANAN
// =============================
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const posIdParam = searchParams.get("posId");
    const pesertaIdParam = searchParams.get("pesertaId");

    let where: any = {};

    // filter role kader
    if (currentUser.role === "KADER") {
      where.createdById = currentUser.id;
    }

    // filter bidan berdasarkan pos
    if (currentUser.role === "BIDAN" && posIdParam) {
      where.peserta = {
        posId: Number(posIdParam),
      };
    }

    // FILTER PESERTA DETAIL
    if (pesertaIdParam) {
      where.pesertaId = Number(pesertaIdParam);
    }

    const data = await prisma.pelayanan.findMany({
      where,
      include: {
        peserta: {
          include: {
            posyandu: true,
          },
        },
        pemeriksaan: true,
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error("ERROR GET pelayanan:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// =============================
// POST PELAYANAN
// =============================
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const pelayanan = await prisma.pelayanan.create({
      data: {
        tanggal: body.tanggal,
        kategori: body.kategori,
        hasilAi: body.hasilAi ?? null,
        ringkasan: body.ringkasan ?? null,
        validasiBidan: body.validasiBidan ?? null,
        pesertaId: body.pesertaId ? Number(body.pesertaId) : null,
        pemeriksaanId: body.pemeriksaanId ? Number(body.pemeriksaanId) : null,
        createdById: currentUser.id,
        // balita
        asiEksklusif: body.asiEksklusif,
        mpasi: body.mpasi,
        batuk: body.batuk,
        demam: body.demam,
        bbTidakNaik: body.bbTidakNaik,
        kontakTBC: body.kontakTBC,
        imunisasi: body.imunisasi,
        vitaminA: body.vitaminA,
        obatCacing: body.obatCacing,
        patuhMT: body.patuhMT,
        // ibu hamil
        ttd: body.ttd,
        konsumsiTtd: body.konsumsiTtd,
        mtBumil: body.mtBumil,
        porsiMt: body.porsiMt,
        rutinMt: body.rutinMt,
        penyuluhanTopik: body.penyuluhanTopik,
        ikutKelasIbu: body.ikutKelasIbu,
        // nifas
        waktuDatang: body.waktuDatang,
        batukNifas: body.batukNifas,
        demamNifas: body.demamNifas,
        bbTurunNifas: body.bbTurunNifas,
        kontakTBCNifas: body.kontakTBCNifas,
        jumlahKapsul: body.jumlahKapsul,
        konsumsiVitaminA: body.konsumsiVitaminA,
        menyusui: body.menyusui,
        kbPasca: body.kbPasca,
        topikPenyuluhanNifas: body.topikPenyuluhanNifas,
        // remaja
        batukRemaja: body.batukRemaja,
        demamRemaja: body.demamRemaja,
        bbTurunRemaja: body.bbTurunRemaja,
        kontakTBCRemaja: body.kontakTBCRemaja,
        penyuluhanRemaja: body.penyuluhanRemaja,
        topikPenyuluhanRemaja: body.topikPenyuluhanRemaja,
        mataKanan: body.mataKanan,
        mataKiri: body.mataKiri,
        telingaKanan: body.telingaKanan,
        telingaKiri: body.telingaKiri,
        kadarHb: body.kadarHb,
        // lansia
        batukLansia: body.batukLansia,
        demamLansia: body.demamLansia,
        bbTurunLansia: body.bbTurunLansia,
        kontakTBCLansia: body.kontakTBCLansia,
        tekananDarah: body.tekananDarah,
        gulaDarah: body.gulaDarah,
        kolesterol: body.kolesterol,
        penyuluhanLansia: body.penyuluhanLansia,
        topikPenyuluhanLansia: body.topikPenyuluhanLansia,
        orientasi: body.orientasi,
        ingatKata: body.ingatKata,
        tesBerdiri: body.tesBerdiri,
        bbTurun3kg: body.bbTurun3kg,
        nafsuMakan: body.nafsuMakan,
        lila: body.lila,
        masalahMata: body.masalahMata,
        tesMelihat: body.tesMelihat,
        tesBerbisik: body.tesBerbisik,
        sedih: body.sedih,
        minat: body.minat,
        imunisasiCovid: body.imunisasiCovid,
        topikPenyuluhanSkilas: body.topikPenyuluhanSkilas,
      },
    });

    return NextResponse.json(pelayanan);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Gagal menyimpan pelayanan" }, { status: 500 });
  }
}

// =============================
// PUT PELAYANAN (EDIT)
// =============================
// =============================
// PUT PELAYANAN (EDIT)
// =============================
export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    const pelayanan = await prisma.pelayanan.update({
      where: { id: Number(id) },
      data: {
        tanggal: updateData.tanggal,
        kategori: updateData.kategori,
        hasilAi: updateData.hasilAi ?? null,
        ringkasan: updateData.ringkasan ?? null,
        validasiBidan: updateData.validasiBidan ?? null,
        pesertaId: updateData.pesertaId ? Number(updateData.pesertaId) : null,
        pemeriksaanId: updateData.pemeriksaanId ? Number(updateData.pemeriksaanId) : null,
        // balita
        asiEksklusif: updateData.asiEksklusif,
        mpasi: updateData.mpasi,
        batuk: updateData.batuk,
        demam: updateData.demam,
        bbTidakNaik: updateData.bbTidakNaik,
        kontakTBC: updateData.kontakTBC,
        imunisasi: updateData.imunisasi,
        vitaminA: updateData.vitaminA,
        obatCacing: updateData.obatCacing,
        patuhMT: updateData.patuhMT,
        // ibu hamil
        ttd: updateData.ttd,
        konsumsiTtd: updateData.konsumsiTtd,
        mtBumil: updateData.mtBumil,
        porsiMt: updateData.porsiMt,
        rutinMt: updateData.rutinMt,
        penyuluhanTopik: updateData.penyuluhanTopik,
        ikutKelasIbu: updateData.ikutKelasIbu,
        // nifas
        waktuDatang: updateData.waktuDatang,
        batukNifas: updateData.batukNifas,
        demamNifas: updateData.demamNifas,
        bbTurunNifas: updateData.bbTurunNifas,
        kontakTBCNifas: updateData.kontakTBCNifas,
        jumlahKapsul: updateData.jumlahKapsul,
        konsumsiVitaminA: updateData.konsumsiVitaminA,
        menyusui: updateData.menyusui,
        kbPasca: updateData.kbPasca,
        topikPenyuluhanNifas: updateData.topikPenyuluhanNifas,
        // remaja
        batukRemaja: updateData.batukRemaja,
        demamRemaja: updateData.demamRemaja,
        bbTurunRemaja: updateData.bbTurunRemaja,
        kontakTBCRemaja: updateData.kontakTBCRemaja,
        penyuluhanRemaja: updateData.penyuluhanRemaja,
        topikPenyuluhanRemaja: updateData.topikPenyuluhanRemaja,
        mataKanan: updateData.mataKanan,
        mataKiri: updateData.mataKiri,
        telingaKanan: updateData.telingaKanan,
        telingaKiri: updateData.telingaKiri,
        kadarHb: updateData.kadarHb,
        // lansia
        batukLansia: updateData.batukLansia,
        demamLansia: updateData.demamLansia,
        bbTurunLansia: updateData.bbTurunLansia,
        kontakTBCLansia: updateData.kontakTBCLansia,
        tekananDarah: updateData.tekananDarah,
        gulaDarah: updateData.gulaDarah,
        kolesterol: updateData.kolesterol,
        penyuluhanLansia: updateData.penyuluhanLansia,
        topikPenyuluhanLansia: updateData.topikPenyuluhanLansia,
        orientasi: updateData.orientasi,
        ingatKata: updateData.ingatKata,
        tesBerdiri: updateData.tesBerdiri,
        bbTurun3kg: updateData.bbTurun3kg,
        nafsuMakan: updateData.nafsuMakan,
        lila: updateData.lila,
        masalahMata: updateData.masalahMata,
        tesMelihat: updateData.tesMelihat,
        tesBerbisik: updateData.tesBerbisik,
        sedih: updateData.sedih,
        minat: updateData.minat,
        imunisasiCovid: updateData.imunisasiCovid,
        topikPenyuluhanSkilas: updateData.topikPenyuluhanSkilas,
      },
    });

    return NextResponse.json(pelayanan);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Gagal update pelayanan" }, { status: 500 });
  }
}

// =============================
// DELETE PELAYANAN
// =============================
export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    await prisma.pelayanan.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Gagal menghapus pelayanan" }, { status: 500 });
  }
}