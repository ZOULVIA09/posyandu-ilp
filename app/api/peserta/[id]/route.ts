import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const peserta = await prisma.peserta.findUnique({
      where: { id: Number(params.id) },
    });

    if (!peserta) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(peserta);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}