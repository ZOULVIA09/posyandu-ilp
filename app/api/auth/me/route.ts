import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    id: user.id,
    nama: user.nama,
    role: user.role,           // → "KADER" atau "BIDAN" (huruf besar, dari DB)
    currentPosId: user.currentPosId,
  });
}