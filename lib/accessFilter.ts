import { Role } from "@prisma/client";

export function getPesertaFilter(user: { id: number; role: Role; currentPosId: number | null }) {
  if (user.role === Role.KADER) {
    return { createdById: user.id };
  }
  // BIDAN: lihat semua data di posyandu aktif
  return { posId: user.currentPosId };
}