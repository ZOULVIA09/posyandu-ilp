import { NextResponse } from "next/server";

export async function POST(req: Request) {
  
  const { nama, kategori, detail } = await req.json();

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // ✅ DI SINI
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
Anda adalah AI asisten kesehatan Posyandu ILP.

Tugas:
- Menganalisis hasil pemeriksaan pasien
- Memberikan kesimpulan singkat
- Menentukan status kesehatan
- Memberikan saran edukasi kesehatan

Gunakan bahasa Indonesia yang formal, singkat, dan mudah dipahami bidan. 
`,

//secara keseluruhan tentang kesehatan seperti tbc dll
          },
          {
            role: "user",
            content: `
Nama: ${nama}
Kategori: ${kategori}

Data:
${detail}

Buat kesimpulan singkat, status (normal/risiko), dan saran.
            `,
            // tambahkan detail untuk content secara lebih spesifik berdasarkan kategori penyakit
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
    return NextResponse.json({
      jawaban: "Terjadi kesalahan",
    });
  }
}
