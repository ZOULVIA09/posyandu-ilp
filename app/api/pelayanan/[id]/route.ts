import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET DETAIL PELAYANAN BERDASARKAN ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pelayananId = Number(id);

    if (isNaN(pelayananId)) {
      return NextResponse.json(
        { error: "ID pelayanan tidak valid" },
        { status: 400 }
      );
    }

    const data = await prisma.pelayanan.findUnique({
    where: { id: pelayananId },
    include: {
      peserta: {
        include: {
          posyandu: true, // posyandu ada di Peserta, bukan di Pelayanan
        },
      },
      pemeriksaan: true,
    },
  });

    if (!data) {
      return NextResponse.json(
        { error: "Data pelayanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error mengambil detail pelayanan:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat mengambil detail pelayanan" },
      { status: 500 }
    );
  }
}