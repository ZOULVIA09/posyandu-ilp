import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding...\n");

  // 1. Buat 9 Posyandu
  const dataPosyandu = [
    { nama: "Posyandu 1", alamat: "RT 01/RW 01" },
    { nama: "Posyandu 2", alamat: "RT 02/RW 01" },
    { nama: "Posyandu 3", alamat: "RT 01/RW 02" },
    { nama: "Posyandu 4", alamat: "RT 03/RW 02" },
    { nama: "Posyandu 5", alamat: "RT 01/RW 03" },
    { nama: "Posyandu 6", alamat: "RT 02/RW 03" },
    { nama: "Posyandu 7", alamat: "RT 01/RW 04" },
    { nama: "Posyandu 8", alamat: "RT 02/RW 04" },
    { nama: "Posyandu 9", alamat: "RT 03/RW 04" },
  ];

  const posList = [];

  for (const data of dataPosyandu) {
    const pos = await prisma.posyandu.create({ data });
    posList.push(pos);
    console.log(`✅ ${pos.nama}`);
  }

  console.log("\n👤 Membuat user...\n");

  // 2. BIDAN (1 orang, akses semua pos)
  const pwBidan = await bcrypt.hash("bidan123", 10);

  await prisma.user.create({
    data: {
      nama: "Bidan Utama",
      email: "bidan@gmail.com",
      password: pwBidan,
      role: Role.BIDAN,
      posyandus: {
        connect: posList.map((p) => ({ id: p.id })),
      },
    },
  });

  console.log("✅ Bidan dibuat (akses semua pos)");

  // 3. KADER (1 per pos)
  for (let i = 0; i < posList.length; i++) {
    const pos = posList[i];

    const pwKader = await bcrypt.hash(`kader${i + 1}`, 10);

    await prisma.user.create({
      data: {
        nama: `Kader Pos ${i + 1}`,
        email: `kader${i + 1}@gmail.com`,
        password: pwKader,
        role: Role.KADER,
        posyandus: {
          connect: [{ id: pos.id }],
        },
      },
    });

    console.log(`Kader Pos ${i + 1} ✅`);
  }

  console.log("\n🎉 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });