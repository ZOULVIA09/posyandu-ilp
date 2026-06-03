import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

// GET PEMERIKSAAN
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

      if (currentUser.role === "KADER") {
    where = {
      posId: currentUser.currentPosId,        // ← filter pos
      ...(pesertaIdParam && { pesertaId: Number(pesertaIdParam) }),
    };

    } else if (currentUser.role === "BIDAN") {
      // ✅ Bidan filter by posId, atau semua jika tidak ada posId
      where = posIdParam
        ? { posId: Number(posIdParam) }
        : {};
    }

    const data = await prisma.pemeriksaan.findMany({
      where,
      include: {
        peserta: true,
        posyandu: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST PEMERIKSAAN
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const pemeriksaan = await prisma.pemeriksaan.create({
      data: {
        pesertaId: body.pesertaId,
        posId: currentUser.currentPosId!, // ✅ dari server
        tanggal: body.tanggal,
        kategori: body.kategori,
        createdById: currentUser.id,      // ✅ dari server
        bb: body.bb,
        tb: body.tb,
        lingkarKepala: body.lingkarKepala,
        lila: body.lila,
        statusBbU: body.statusBbU,
        statusTbU: body.statusTbU,
        statusBbTb: body.statusBbTb,
        statusLingkar: body.statusLingkar,
        lansiaBb: body.lansiaBb,
        lansiaTb: body.lansiaTb,
        lingkarPerut: body.lingkarPerut,
        lilaLansia: body.lilaLansia,
        tekananDarah: body.tekananDarah,
        imt: body.imt,
        statusImt: body.statusImt,
        statusTekananDarah: body.statusTekananDarah,
        usiaKehamilan: body.usiaKehamilan,
        bbBumil: body.bbBumil,
        lilaBumil: body.lilaBumil,
        tdBumil: body.tdBumil,
        imtBumil: body.imtBumil,
        statusImtBumil: body.statusImtBumil,
        statusLilaBumil: body.statusLilaBumil,
        statusTdBumil: body.statusTdBumil,
        waktuKunjungan: body.waktuKunjungan,
        bbNifas: body.bbNifas,
        tdNifas: body.tdNifas,
        remajaBb: body.remajaBb,
        remajaTb: body.remajaTb,
        lingkarPerutRemaja: body.lingkarPerutRemaja,
        tdRemaja: body.tdRemaja,
        imtRemaja: body.imtRemaja,
        statusImtRemaja: body.statusImtRemaja,
        statusTdRemaja: body.statusTdRemaja,
      },
    });

    return NextResponse.json(pemeriksaan);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Gagal menyimpan pemeriksaan" },
      { status: 500 }
    );
  }
}

// DELETE PEMERIKSAAN
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

    // ✅ Kader hanya boleh hapus miliknya
    if (currentUser.role === "KADER") {
      const data = await prisma.pemeriksaan.findFirst({
        where: { id, createdById: currentUser.id },
      });

      if (!data) {
        return NextResponse.json(
          { error: "Data tidak ditemukan atau akses ditolak" },
          { status: 403 }
        );
      }
    }

    await prisma.pemeriksaan.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
