import { NextResponse } from "next/server";

const KATEGORI_VALID = [
  "balita", "ibu_hamil", "ibu_nifas", "ibu_nifas_menyusui", "lansia", "remaja",
];

export async function POST(req: Request) {
  const { nama, kategori, detail } = await req.json();

  // Validasi input
  if (!nama || !kategori || !detail || !KATEGORI_VALID.includes(kategori)) {
    return NextResponse.json({
      jawaban: "Maaf, saya hanya membantu analisis pemeriksaan posyandu. Silakan masukkan data pemeriksaan yang valid.",
    });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `Anda adalah asisten kesehatan Posyandu ILP Desa Sumberurip.

BATASAN: Hanya jawab topik seputar pemeriksaan posyandu (balita, ibu hamil, ibu nifas, lansia, remaja). Jika di luar topik, balas: "Maaf, saya hanya membantu analisis pemeriksaan posyandu."

CARA MENJAWAB:
- Langsung ke inti, tanpa basa-basi pembuka
- Bahasa sederhana seperti bidan berbicara ke kader
- Maksimal 4 kalimat per poin
- Tidak pakai nomor atau bullet point
- Istilah medis wajib dijelaskan singkat

FORMAT (paragraf mengalir, bukan daftar):
1. Kondisi saat ini — apa yang ditemukan
2. Yang perlu diperhatikan — jika ada masalah, sebut langsung
3. Saran praktis — 1-2 hal konkret yang bisa dilakukan hari ini
4. Rujuk — hanya jika benar-benar perlu, sebutkan alasannya

Maksimal 100 kata. Mulai langsung dengan nama pasien.`,
          },
          {
            role: "user",
            content: `Pasien: ${nama}\nKategori: ${kategori}\nData pemeriksaan:\n${detail}`,
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("STATUS:", response.status);
    console.log("DATA GROQ:", data);

    return NextResponse.json({
      jawaban:
        data.choices?.[0]?.message?.content ||
        data.error?.message ||
        "Tidak ada respon",
    });
  } catch (error) {
    console.error("GROQ ERROR:", error);
    return NextResponse.json({ jawaban: "Terjadi kesalahan saat menghubungi AI." });
  }
}
