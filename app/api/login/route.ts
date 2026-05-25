import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    include: { currentPos: true },
  });

  if (!user) {
    return NextResponse.json({ message: "Email tidak ditemukan" }, { status: 404 });
  }

  const isMatch = await bcrypt.compare(body.password, user.password);

  if (!isMatch) {
    return NextResponse.json({ message: "Password salah" }, { status: 401 });
  }

  const response = NextResponse.json({
    id: user.id,
    nama: user.nama,
    role: user.role,
    currentPosId: user.currentPosId,
    posyandu: user.currentPos?.nama ?? "",
  });

  // ← TAMBAHAN: simpan userId di cookie
  response.cookies.set("userId", String(user.id), {
    httpOnly: true,   // tidak bisa dibaca JavaScript frontend (lebih aman)
    path: "/",
    maxAge: 60 * 60 * 24, // 1 hari
  });

  return response;
}