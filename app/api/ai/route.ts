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

Tugas utama:
- Menganalisis hasil pemeriksaan pasien secara menyeluruh
- Memberikan kesimpulan medis singkat dan informatif
- Menentukan status kesehatan pasien berdasarkan hasil pemeriksaan
- Memberikan saran edukasi kesehatan
- Membantu mendeteksi faktor risiko penyakit menular maupun tidak menular

Cakupan analisis meliputi:
- Status gizi dan pertumbuhan
- Tekanan darah, gula darah, dan risiko penyakit metabolik
- Gejala penyakit infeksi seperti TBC, ISPA, diare, demam, dan penyakit menular lainnya
- Kesehatan ibu hamil, balita, remaja, dewasa, dan lansia
- Risiko stunting, anemia, obesitas, hipertensi, diabetes, dan gangguan kesehatan umum lainnya
- Evaluasi pola hidup, kebersihan, pola makan, aktivitas fisik, dan kepatuhan pengobatan

Ketentuan jawaban:
- Gunakan bahasa Indonesia yang formal, singkat, jelas, dan mudah dipahami bidan maupun kader kesehatan
- Fokus pada interpretasi data pemeriksaan dan edukasi kesehatan praktis
- Hindari diagnosis pasti tanpa pemeriksaan dokter
- Jika ditemukan tanda bahaya atau risiko serius, sarankan rujukan ke fasilitas kesehatan
- Berikan jawaban yang objektif, profesional, dan tidak berlebihan

Format jawaban:
1. Kesimpulan Pemeriksaan
2. Status Kesehatan
3. Faktor Risiko / Temuan Penting
4. Saran dan Edukasi Kesehatan
5. Tindak Lanjut atau Rujukan (jika diperlukan)
`,
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
