import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

// GET PESERTA
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const posIdParam = searchParams.get("posId");

    let where: any = {};

    if (currentUser.role === "KADER") {
      where = {
        createdById: currentUser.id,
        posId: currentUser.currentPosId,
      };
    } else if (currentUser.role === "BIDAN") {
      // ✅ Bidan tanpa posId → tampilkan semua
      where = posIdParam
        ? { posId: Number(posIdParam) }
        : {};
    }

    const peserta = await prisma.peserta.findMany({
      where,
      include: { posyandu: true },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(peserta);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Gagal mengambil data peserta" },
      { status: 500 }
    );
  }
}

// POST PESERTA
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const peserta = await prisma.peserta.create({
      data: {
        posId: currentUser.currentPosId, // ← dari server
        createdById: currentUser.id,      // ← dari server
        nama: body.nama,
        kategori: body.kategori,
        pos: body.pos,
        bulan: body.bulan,
        hadir: body.hadir,
        nik: body.nik,
        alamat: body.alamat,
        tglLahir: body.tglLahir,
        noHp: body.noHp,
        dusun: body.dusun,
        desa: body.desa,
        kecamatan: body.kecamatan,
        ortu: body.ortu,
        panjangLahir: body.panjangLahir,
        beratLahir: body.beratLahir,
        kehamilan: body.kehamilan,
        berat: body.berat,
        tinggiBadan: body.tinggiBadan,
        tglPersalinan: body.tglPersalinan,
        anakKe: body.anakKe,
        caraPersalinan: body.caraPersalinan,
        pekerjaan: body.pekerjaan,
        statusNikah: body.statusNikah,
        riwayatKeluarga: body.riwayatKeluarga ?? [],
        riwayatDiri: body.riwayatDiri ?? [],
        merokok: body.merokok,
        gula: body.gula,
        garam: body.garam,
        lemak: body.lemak,
        tekanan: body.tekanan,
        jenisKelamin: body.jenisKelamin,
        ortuRemaja: body.ortuRemaja,
        noHpRemaja: body.noHpRemaja,
        dusunRemaja: body.dusunRemaja,
        desaRemaja: body.desaRemaja,
        kecamatanRemaja: body.kecamatanRemaja,
        riwayatKeluargaRemaja: body.riwayatKeluargaRemaja ?? [],
        riwayatDiriRemaja: body.riwayatDiriRemaja ?? [],
      },
    });

    return NextResponse.json(peserta);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Gagal tambah peserta" },
      { status: 500 }
    );
  }
}

// DELETE PESERTA
export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { error: "ID peserta tidak ditemukan" },
        { status: 400 }
      );
    }

    // ✅ Kader hanya boleh hapus miliknya
    if (currentUser.role === "KADER") {
      const peserta = await prisma.peserta.findFirst({
        where: {
          id: Number(idParam),
          createdById: currentUser.id,
        },
      });

      if (!peserta) {
        return NextResponse.json(
          { error: "Data tidak ditemukan atau akses ditolak" },
          { status: 403 }
        );
      }
    }

    await prisma.peserta.delete({
      where: { id: Number(idParam) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Gagal menghapus peserta" },
      { status: 500 }
    );
  }
}