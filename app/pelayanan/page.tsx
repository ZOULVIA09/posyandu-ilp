"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";

// ── Tipe data hasil pemeriksaan (dari localStorage "pemeriksaan") ──
type DataPemeriksaan = {
  id: number;
  pesertaId: number;
  kategori: string;
  tanggal?: string;
  posyandu?: { nama: string };
  peserta?: {
    id: number;
    nama: string;
    nik?: string;
    alamat?: string;
    pos?: string;
  };

  // balita
  bb?: string; tb?: string; lila?: string; lingkarKepala?: string;
  statusBbU?: string; statusTbU?: string; statusBbTb?: string; statusLingkar?: string;
  // lansia
  lansiaBb?: string; lansiaTb?: string; lingkarPerut?: string; lilaLansia?: string;
  tekananDarah?: string; imt?: string; statusImt?: string; statusTekananDarah?: string;
  // ibu hamil
  usiaKehamilan?: string; bbBumil?: string; lilaBumil?: string; tdBumil?: string;
  imtBumil?: string; statusImtBumil?: string; statusLilaBumil?: string; statusTdBumil?: string;
  // nifas
  waktuKunjungan?: string; bbNifas?: string; tdNifas?: string;
  // remaja
  remajaBb?: string; remajaTb?: string; lingkarPerutRemaja?: string;
  tdRemaja?: string; imtRemaja?: string; statusImtRemaja?: string; statusTdRemaja?: string;
};

type Pelayanan = {
  id: number;
  nama: string;
  nik?: string;
  alamat?: string;
  kategori: string;
  tanggal: string;
  pesertaId?: number;
  peserta?: { id: number; nama: string }; // ← tambah ini
  hasilAI?: string;
  validasiBidan?: string; // ← tambahan
  ringkasanPemeriksaan?: string;
  // balita
  asiEksklusif?: boolean; mpasi?: boolean; batuk?: boolean; demam?: boolean;
  bbTidakNaik?: boolean; kontakTBC?: boolean; imunisasi?: boolean;
  vitaminA?: boolean; obatCacing?: boolean; patuhMT?: boolean;
  // ibu hamil
  ttd?: boolean; konsumsiTtd?: boolean; mtBumil?: boolean; porsiMt?: string;
  rutinMt?: boolean; penyuluhanTopik?: string; ikutKelasIbu?: boolean;
  // nifas
  batukNifas?: boolean; demamNifas?: boolean; bbTurunNifas?: boolean;
  kontakTBCNifas?: boolean; jumlahKapsul?: string; konsumsiVitaminA?: boolean;
  menyusui?: boolean; kbPasca?: boolean; topikPenyuluhanNifas?: string; waktuDatang?: string;
  // remaja
  batukRemaja?: boolean; demamRemaja?: boolean; bbTurunRemaja?: boolean;
  kontakTBCRemaja?: boolean; penyuluhanRemaja?: boolean; topikPenyuluhanRemaja?: string;
  mataKanan?: string; mataKiri?: string; telingaKanan?: string; telingaKiri?: string; kadarHb?: string;
  // lansia
  batukLansia?: boolean; demamLansia?: boolean; bbTurunLansia?: boolean;
  kontakTBCLansia?: boolean; gulaDarah?: string; kolesterol?: string;
  penyuluhanLansia?: boolean; topikPenyuluhanLansia?: string;
  orientasi?: boolean; ingatKata?: boolean; tesBerdiri?: boolean; bbTurun3kg?: boolean;
  nafsuMakan?: boolean; lila?: boolean; masalahMata?: boolean; tesMelihat?: boolean;
  tesBerbisik?: boolean; sedih?: boolean; minat?: boolean; imunisasiCovid?: boolean;
  topikPenyuluhanSkilas?: string;
};

const FORM_DEFAULT = {
  nama: "", nik: "", alamat: "", pos: "", kategori: "", tanggal: "", ringkasanPemeriksaan: "", pesertaId: null,
  asiEksklusif: false, mpasi: false, batuk: false, demam: false,
  bbTidakNaik: false, kontakTBC: false, imunisasi: false, vitaminA: false,
  obatCacing: false, patuhMT: false,
  ttd: false, konsumsiTtd: false, mtBumil: false, porsiMt: "", rutinMt: false,
  penyuluhanTopik: "", ikutKelasIbu: false,
  batukNifas: false, demamNifas: false, bbTurunNifas: false, kontakTBCNifas: false,
  jumlahKapsul: "", konsumsiVitaminA: false, menyusui: false, kbPasca: false,
  topikPenyuluhanNifas: "", waktuDatang: "",
  batukRemaja: false, demamRemaja: false, bbTurunRemaja: false, kontakTBCRemaja: false,
  penyuluhanRemaja: false, topikPenyuluhanRemaja: "",
  mataKanan: "", mataKiri: "", telingaKanan: "", telingaKiri: "", kadarHb: "",
  batukLansia: false, demamLansia: false, bbTurunLansia: false, kontakTBCLansia: false,
  tekananDarah: "", gulaDarah: "", kolesterol: "",
  penyuluhanLansia: false, topikPenyuluhanLansia: "",
  orientasi: false, ingatKata: false, tesBerdiri: false, bbTurun3kg: false,
  nafsuMakan: false, lila: false, masalahMata: false, tesMelihat: false,
  tesBerbisik: false, sedih: false, minat: false, imunisasiCovid: false,
  topikPenyuluhanSkilas: "",
};

// ── Buat ringkasan teks dari data pemeriksaan ──
function buatRingkasan(p: DataPemeriksaan): string {
  const k = p.kategori;
  if (k === "balita")
    return `BB ${p.bb ?? "-"} kg | TB ${p.tb ?? "-"} cm | LILA ${p.lila ?? "-"} cm | Status: ${p.statusBbTb ?? "-"}`;
  if (k === "lansia")
    return `BB ${p.lansiaBb ?? "-"} kg | TD ${p.tekananDarah ?? "-"} | IMT ${p.imt ?? "-"} (${p.statusImt ?? "-"})`;
  if (k === "ibu_hamil")
    return `UK ${p.usiaKehamilan?.replace(/_/g, " ") ?? "-"} | BB ${p.bbBumil ?? "-"} kg | LILA ${p.lilaBumil ?? "-"} (${p.statusLilaBumil ?? "-"}) | TD ${p.tdBumil ?? "-"} (${p.statusTdBumil ?? "-"})`;
  if (k === "ibu_nifas_menyusui")
    return `Kunjungan ${p.waktuKunjungan?.replace(/_/g, " ") ?? "-"} | BB ${p.bbNifas ?? "-"} kg | TD ${p.tdNifas ?? "-"}`;
  if (k === "remaja")
    return `BB ${p.remajaBb ?? "-"} kg | TB ${p.remajaTb ?? "-"} cm | IMT ${p.imtRemaja ?? "-"} (${p.statusImtRemaja ?? "-"}) | TD ${p.tdRemaja ?? "-"}`;
  return "-";
}

// ── Pra-isi field pelayanan yang relevan dari pemeriksaan ──
// ── Pra-isi field pelayanan yang relevan dari pemeriksaan ──
function praIsiDariPemeriksaan(p: DataPemeriksaan): Partial<typeof FORM_DEFAULT> {
  const k = p.kategori;
  const kategoriPelayanan = k === "ibu_nifas_menyusui" ? "ibu_nifas" : k;

  const base: Partial<typeof FORM_DEFAULT> = {
    nama: p.peserta?.nama ?? "",   // ← dari relasi peserta
    nik: p.peserta?.nik ?? "",
    alamat: p.peserta?.alamat ?? "",
    pos: p.peserta?.pos ?? "",
    kategori: kategoriPelayanan,
    ringkasanPemeriksaan: buatRingkasan(p),
  };

  if (k === "lansia") {
    return { ...base, tekananDarah: p.tekananDarah ?? "" };
  }
  return base;
}

export default function PelayananPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  const [form, setForm] = useState<any>(FORM_DEFAULT);
  const [data, setData] = useState<Pelayanan[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  const [dataPemeriksaan, setDataPemeriksaan] = useState<DataPemeriksaan[]>([]);
  const [filterRef, setFilterRef] = useState("semua");
  const [listPosyandu, setListPosyandu] = useState<any[]>([]);
  const [filterPosyandu, setFilterPosyandu] = useState("semua");

  const [hasilAI, setHasilAI] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [pertanyaanAI, setPertanyaanAI] = useState("");

  // ── State validasi bidan ──
  const [validasiBidan, setValidasiBidan] = useState("");
  const [sudahDivalidasi, setSudahDivalidasi] = useState(false);

useEffect(() => {
  const init = async () => {
    const meRes = await fetch("/api/auth/me");
    if (!meRes.ok) { router.push("/login"); return; }
    const user = await meRes.json();

    if (user.role !== "BIDAN") { router.push("/dashboard-kader"); return; }
    setRole(user.role.toLowerCase());

    // Ambil daftar posyandu
    const posRes = await fetch("/api/posyandu");
    const posData = await posRes.json();
    setListPosyandu(Array.isArray(posData) ? posData : []);

    // ✅ Ambil semua pemeriksaan dulu (tanpa filter posId)
    const pemRes = await fetch("/api/pemeriksaan");
    const pemData = await pemRes.json();
    setDataPemeriksaan(Array.isArray(pemData) ? pemData : []);

    // ✅ Ambil semua pelayanan dulu (tanpa filter posId)
    const pelRes = await fetch("/api/pelayanan");
    const pelData = await pelRes.json();
    setData(Array.isArray(pelData) ? pelData : []);
  };

  init();
}, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

// Ganti handleFilterPosyandu:
// Ganti handleFilterPosyandu menjadi:
const handleFilterPosyandu = async (posId: string) => {
  setFilterPosyandu(posId);
  try {
    const urlPem = posId === "semua"
      ? "/api/pemeriksaan"
      : `/api/pemeriksaan?posId=${posId}`;

    const urlPel = posId === "semua"
      ? "/api/pelayanan"
      : `/api/pelayanan?posId=${posId}`;

    // ✅ Fetch KEDUANYA secara paralel
    const [pemRes, pelRes] = await Promise.all([
      fetch(urlPem),
      fetch(urlPel),
    ]);

    const pemData = await pemRes.json();
    const pelData = await pelRes.json();

    setDataPemeriksaan(Array.isArray(pemData) ? pemData : []);
    setData(Array.isArray(pelData) ? pelData : []); // ← INI yang hilang
  } catch (error) {
    console.error(error);
  }
};

    const handlePilihPeserta = (p: DataPemeriksaan) => {
      setForm({ 
        ...FORM_DEFAULT, 
        ...praIsiDariPemeriksaan(p), 
        pesertaId: (p as any).pesertaId,        // ← ID peserta yang benar
        pemeriksaanId: p.id,                    // ← simpan juga ID pemeriksaan
      });
      setEditId(null);
      setHasilAI("");
      setValidasiBidan("");
      setSudahDivalidasi(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    // Reset validasi saat generate ulang
    setValidasiBidan("");
    setSudahDivalidasi(false);

    try {
      const detail = `
Ringkasan Pemeriksaan:
${form.ringkasanPemeriksaan || "-"}

Tekanan Darah: ${form.tekananDarah || "-"}
Gula Darah: ${form.gulaDarah || "-"}
Kolesterol: ${form.kolesterol || "-"}
HB: ${form.kadarHb || "-"}

Keluhan / Skrining:
- Batuk: ${form.batuk || form.batukLansia || form.batukRemaja || form.batukNifas ? "Ya" : "Tidak"}
- Demam: ${form.demam || form.demamLansia || form.demamRemaja || form.demamNifas ? "Ya" : "Tidak"}

Pertanyaan Bidan:
${pertanyaanAI}
`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: form.nama, kategori: form.kategori, detail }),
      });

      const resData = await res.json();
      setHasilAI(resData.jawaban);
    } catch (error) {
      console.log(error);
      setHasilAI("Gagal mengambil respon AI");
    }

    setLoadingAI(false);
  };

const handleSimpan = async () => {
  if (!form.nama || !form.kategori || !form.tanggal) {
    alert("Nama, kategori, dan tanggal wajib diisi!");
    return;
  }

  try {
    const payload = {
  ...form,
  pesertaId: form.pesertaId,
  hasilAi: hasilAI,
  ringkasan: form.ringkasanPemeriksaan,
  validasiBidan: validasiBidan,

mataKanan: form.mataKanan,
mataKiri: form.mataKiri,
telingaKanan: form.telingaKanan,
telingaKiri: form.telingaKiri,
};

    const res = await fetch("/api/pelayanan", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editId ? { id: editId, ...payload } : payload),
    });

    if (!res.ok) throw new Error("Gagal simpan");

    alert("Data berhasil disimpan");

    // ✅ Refresh berdasarkan filter posyandu yang aktif, bukan currentPosId
    const url = filterPosyandu === "semua"
      ? "/api/pelayanan"
      : `/api/pelayanan?posId=${filterPosyandu}`;

    const pelRes = await fetch(url);
    const pelData = await pelRes.json();
    setData(Array.isArray(pelData) ? pelData : []);

    setForm(FORM_DEFAULT);
    setEditId(null);
    setHasilAI("");
    setValidasiBidan("");
    setSudahDivalidasi(false);
  } catch (error) {
    console.error(error);
    alert("Gagal menyimpan data");
  }
};
  const handleEdit = (item: any) => {
  setForm({
    ...FORM_DEFAULT,
    ...item,

    nama: item.nama ?? item.peserta?.nama ?? "",
    nik: item.nik ?? item.peserta?.nik ?? "",
    alamat: item.alamat ?? item.peserta?.alamat ?? "",
    kategori: item.kategori ?? "",
    tanggal: item.tanggal ?? "",
    ringkasanPemeriksaan: item.ringkasan ?? "",

    tekananDarah: item.tekananDarah ?? "",
    gulaDarah: item.gulaDarah ?? "",
    kolesterol: item.kolesterol ?? "",

    mataKanan: item.mataKanan ?? "",
    mataKiri: item.mataKiri ?? "",
    telingaKanan: item.telingaKanan ?? "",
    telingaKiri: item.telingaKiri ?? "",

    topikPenyuluhan: item.topikPenyuluhan ?? "",
    topikPenyuluhanNifas: item.topikPenyuluhanNifas ?? "",
    topikPenyuluhanRemaja: item.topikPenyuluhanRemaja ?? "",
    topikPenyuluhanLansia: item.topikPenyuluhanLansia ?? "",
    topikPenyuluhanSkilas: item.topikPenyuluhanSkilas ?? "",
  });

  setEditId(item.id);
  setHasilAI(item.hasilAI || "");
  setValidasiBidan(item.validasiBidan || "");
  setSudahDivalidasi(!!item.validasiBidan);

  window.scrollTo({ top: 0, behavior: "smooth" });
  };

const handleDetail = (item: Pelayanan) => {
  const targetId = item.pesertaId ?? (item as any).peserta?.id;
  console.log("targetId:", targetId, "item:", item);
  if (!targetId) {
    alert("ID peserta tidak ditemukan");
    return;
  }
  router.push(`/detail?id=${targetId}`);
};

const handleHapus = async (id: number) => {
  if (!confirm("Yakin mau hapus?")) return;
  try {
    const res = await fetch(`/api/pelayanan?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal hapus");
    setData((prev) => prev.filter((item) => item.id !== id));
  } catch (error) {
    console.error(error);
    alert("Gagal menghapus data");
  }
};

  if (!role) return <p>Loading...</p>;

  const refTerfilter =
    filterRef === "semua"
      ? dataPemeriksaan
      : dataPemeriksaan.filter((d) => d.kategori === filterRef);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role={role} />

      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          💊 Pelayanan Kesehatan (Bidan)
        </h1>

        {/* ══════════════════════════════════════════════════
            PANEL REFERENSI — Data Pemeriksaan
        ══════════════════════════════════════════════════ */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-indigo-600 mb-3">
            🔗 Pilih Peserta dari Data Pemeriksaan
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Klik <strong>Pilih</strong> untuk mengisi form pelayanan secara otomatis.
          </p>

{/* Filter Posyandu */}
<div className="mb-5 flex flex-wrap items-center gap-3 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
  <label className="text-sm font-semibold text-indigo-700">
  Pilih Posyandu
</label>

<select
  value={filterPosyandu}
  onChange={(e) => handleFilterPosyandu(e.target.value)}
  className="
    bg-white
    border border-indigo-200
    text-slate-700
    rounded-xl
    px-4 py-2.5
    text-sm
    shadow-sm
    focus:outline-none
    focus:ring-2
    focus:ring-indigo-400
    focus:border-indigo-400
    hover:border-indigo-300
    transition-all
    min-w-[220px]
  "
>
  <option value="semua">Semua Posyandu</option>

  <option value="1">Posyandu 1</option>
  <option value="2">Posyandu 2</option>
  <option value="3">Posyandu 3</option>
  <option value="4">Posyandu 4</option>
  <option value="5">Posyandu 5</option>
  <option value="6">Posyandu 6</option>
  <option value="7">Posyandu 7</option>
  <option value="8">Posyandu 8</option>
  <option value="9">Posyandu 9</option>
</select>
</div>

          {/* Filter tab */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { value: "semua",              label: "🗂 Semua" },
              { value: "balita",             label: "👶 Balita" },
              { value: "ibu_hamil",          label: "🤰 Ibu Hamil" },
              { value: "ibu_nifas_menyusui", label: "🍼 Nifas" },
              { value: "lansia",             label: "👴 Lansia" },
              { value: "remaja",             label: "🧑 Remaja" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterRef(tab.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filterRef === tab.value
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead>
                <tr className="bg-indigo-50 text-slate-700">
                  <th className="py-2 px-2">No</th>
                  <th className="px-2">Nama</th>
                  <th className="px-2">NIK</th>
                  <th className="px-2">Alamat</th>
                  <th className="px-2">Posyandu</th>
                  <th className="px-2">Kategori</th>
                  <th className="px-2">Hasil Pemeriksaan</th>
                  <th className="px-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                
{refTerfilter.map((item, i) => (
  <tr key={item.id} className="border-b hover:bg-indigo-50 transition">
    <td className="py-2 px-2">{i + 1}</td>
    <td className="px-2 font-semibold text-slate-700">
      {item.peserta?.nama ?? "-"}  {/* ← dari relasi */}
    </td>
    <td className="px-2 text-slate-500">{item.peserta?.nik ?? "-"}</td>
    <td className="px-2 text-slate-500">{item.peserta?.alamat ?? "-"}</td>
    <td className="px-2 text-slate-600">{item.posyandu?.nama ?? "-"}</td>
    <td className="px-2">
      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs capitalize">
        {item.kategori?.replace(/_/g, " ")}
      </span>
    </td>
    <td className="px-2 text-xs text-left text-slate-600">
      {buatRingkasan(item)}
    </td>
    <td className="px-2">
      <button
        onClick={() => handlePilihPeserta(item)}
        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-xs"
      >
        Pilih
      </button>
    </td>
  </tr>
))}
                {refTerfilter.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-gray-400 text-center">
                      Belum ada data pemeriksaan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            FORM INPUT PELAYANAN
        ══════════════════════════════════════════════════ */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-purple-600 mb-4">
            ➕ {editId ? "Edit" : "Input"} Pelayanan
          </h2>

          {/* IDENTITAS — terisi otomatis, readOnly */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              type="text" name="nama" placeholder="Nama Peserta"
              value={form.nama ?? ""} readOnly
              className="border p-2 rounded-lg bg-gray-50"
            />
            <input
              type="text" name="nik" placeholder="NIK"
              value={form.nik ?? ""} readOnly
              className="border p-2 rounded-lg bg-gray-50"
            />
            <input
              type="text" name="alamat" placeholder="Alamat"
              value={form.alamat ?? ""} readOnly
              className="border p-2 rounded-lg bg-gray-50"
            />

            <select
              name="kategori" value={form.kategori}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            >
              <option value="">Kategori</option>
              <option value="balita">Balita</option>
              <option value="ibu_hamil">Ibu Hamil</option>
              <option value="ibu_nifas">Ibu Nifas/Menyusui</option>
              <option value="lansia">Lansia</option>
              <option value="remaja">Remaja</option>
            </select>

            <input
              type="date" name="tanggal" value={form.tanggal}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            />
          </div>

          {/* BOX RINGKASAN PEMERIKSAAN */}
          {form.ringkasanPemeriksaan && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
              <span className="font-semibold">📋 Hasil Pemeriksaan: </span>
              {form.ringkasanPemeriksaan}
            </div>
          )}

          {/* ===== BALITA ===== */}
          {form.kategori === "balita" && (
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-100 p-2 font-semibold">Pelayanan Kesehatan</div>
              {[
                { label: "ASI Eksklusif", key: "asiEksklusif" },
                { label: "MP ASI", key: "mpasi" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="bg-gray-100 p-2 font-semibold">Skrining TBC</div>
              {[
                { label: "Batuk terus menerus", key: "batuk" },
                { label: "Demam > 2 minggu", key: "demam" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="bg-gray-100 p-2 font-semibold">Skrining Tambahan</div>
              {[
                { label: "BB tidak naik / turun 2 bulan", key: "bbTidakNaik" },
                { label: "Kontak erat pasien TBC", key: "kontakTBC" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="bg-gray-100 p-2 font-semibold">Intervensi Gizi &amp; Imunisasi</div>
              {[
                { label: "Imunisasi", key: "imunisasi" },
                { label: "Vitamin A", key: "vitaminA" },
                { label: "Obat Cacing", key: "obatCacing" },
                { label: "Patuh Konsumsi MT Pangan Lokal", key: "patuhMT" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}
            </div>
          )}

          {/* ===== IBU HAMIL ===== */}
          {form.kategori === "ibu_hamil" && (
            <div className="border rounded-xl overflow-hidden mt-4">
              <div className="bg-gray-100 p-2 font-semibold">Pelayanan Kesehatan</div>
              {[
                { label: "Jumlah TTD/MMS diberikan", key: "ttd" },
                { label: "Konsumsi TTD rutin", key: "konsumsiTtd" },
                { label: "Diberikan MT Bumil KEK", key: "mtBumil" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="flex flex-col border-t p-2">
                <span>Komposisi &amp; Jumlah Porsi</span>
                <input type="text" placeholder="Contoh: Nasi + telur, 2 porsi"
                  value={form.porsiMt}
                  onChange={(e) => setForm({ ...form, porsiMt: e.target.value })}
                  className="border p-1 rounded mt-1" />
              </div>
              <RadioRow label="Rutin konsumsi MT" fieldKey="rutinMt" form={form} setForm={setForm} />

              <div className="bg-gray-100 p-2 font-semibold">Penyuluhan</div>
              <div className="flex flex-col border-t p-2">
                <span>Topik penyuluhan</span>
                <input type="text" value={form.penyuluhanTopik}
                  onChange={(e) => setForm({ ...form, penyuluhanTopik: e.target.value })}
                  className="border p-1 rounded mt-1" />
              </div>
              <RadioRow label="Mengikuti kelas ibu hamil" fieldKey="ikutKelasIbu" form={form} setForm={setForm} />
            </div>
          )}

          {/* ===== IBU NIFAS ===== */}
          {form.kategori === "ibu_nifas" && (
            <div className="border rounded-xl overflow-hidden mt-4">
              <div className="border-b p-2">
                <span className="font-semibold">Waktu Datang</span>
                <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                  {["< 7 hari","7-28 hari","28-42 hari","Bulan 2","Bulan 3","Bulan 4","Bulan 5","Bulan 6","Bulan 7","Bulan 8","Bulan 9","Bulan 10","Bulan 11-24"].map((waktu) => (
                    <label key={waktu} className="flex items-center gap-1">
                      <input type="radio" name="waktuDatang"
                        checked={form.waktuDatang === waktu}
                        onChange={() => setForm({ ...form, waktuDatang: waktu })} />
                      {waktu}
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-100 p-2 font-semibold">Skrining</div>
              {[
                { label: "Batuk terus menerus", key: "batukNifas" },
                { label: "Demam ≥ 2 minggu", key: "demamNifas" },
                { label: "BB tidak naik / turun 2 bulan", key: "bbTurunNifas" },
                { label: "Kontak erat pasien TBC", key: "kontakTBCNifas" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="bg-gray-100 p-2 font-semibold">Pelayanan Kesehatan</div>
              <RadioRow label="Diberikan Vitamin A" fieldKey="vitaminA" form={form} setForm={setForm} />
              <div className="flex flex-col border-t p-2">
                <span>Jumlah kapsul Vitamin A</span>
                <input type="text" value={form.jumlahKapsul}
                  onChange={(e) => setForm({ ...form, jumlahKapsul: e.target.value })}
                  className="border p-1 rounded mt-1" />
              </div>
              {[
                { label: "Rutin konsumsi Vitamin A", key: "konsumsiVitaminA" },
                { label: "Menyusui", key: "menyusui" },
                { label: "KB pasca persalinan", key: "kbPasca" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="bg-gray-100 p-2 font-semibold">Penyuluhan</div>
              <div className="flex flex-col border-t p-2">
                <span>Topik penyuluhan</span>
                <input type="text" value={form.topikPenyuluhanNifas}
                  onChange={(e) => setForm({ ...form, topikPenyuluhanNifas: e.target.value })}
                  className="border p-1 rounded mt-1" />
              </div>
            </div>
          )}

          {/* ===== REMAJA ===== */}
          {form.kategori === "remaja" && (
            <div className="border rounded-xl overflow-hidden mt-4">
              <div className="bg-gray-100 p-2 font-semibold">Skrining Remaja</div>
              {[
                { label: "Batuk terus menerus", key: "batukRemaja" },
                { label: "Demam ≥ 2 minggu", key: "demamRemaja" },
                { label: "BB tetap / turun", key: "bbTurunRemaja" },
                { label: "Kontak erat pasien TBC", key: "kontakTBCRemaja" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="bg-gray-100 p-2 font-semibold">Penyuluhan</div>
              <RadioRow label="Mengikuti penyuluhan" fieldKey="penyuluhanRemaja" form={form} setForm={setForm} />
              <div className="flex flex-col border-t p-2">
                <span>Topik penyuluhan</span>
                <input type="text" value={form.topikPenyuluhanRemaja}
                  onChange={(e) => setForm({ ...form, topikPenyuluhanRemaja: e.target.value })}
                  className="border p-1 rounded mt-1" />
              </div>

              <div className="bg-blue-50 p-4 rounded mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">

  <h2 className="font-bold col-span-2 text-blue-700">Pemeriksaan 6 Bulan</h2>

  {/* Penglihatan */}
 <select
  value={form.mataKanan}
  onChange={(e) => setForm({ ...form, mataKanan: e.target.value })}
  className="border p-2 rounded"
>
  <option value="">Penglihatan - Mata Kanan</option>
  <option value="baik">Baik</option>
  <option value="buruk">Buruk</option>
</select>

<select
  value={form.mataKiri}
  onChange={(e) => setForm({ ...form, mataKiri: e.target.value })}
  className="border p-2 rounded"
>
  <option value="">Penglihatan - Mata Kiri</option>
  <option value="baik">Baik</option>
  <option value="buruk">Buruk</option>
</select>

<select
  value={form.telingaKanan}
  onChange={(e) => setForm({ ...form, telingaKanan: e.target.value })}
  className="border p-2 rounded"
>
  <option value="">Pendengaran - Telinga Kanan</option>
  <option value="baik">Baik</option>
  <option value="buruk">Buruk</option>
</select>

<select
  value={form.telingaKiri}
  onChange={(e) => setForm({ ...form, telingaKiri: e.target.value })}
  className="border p-2 rounded"
>
  <option value="">Pendengaran - Telinga Kiri</option>
  <option value="baik">Baik</option>
  <option value="buruk">Buruk</option>
</select>
              </div>
              <div className="bg-gray-100 p-2 font-semibold">Pemeriksaan Tahunan</div>
              <div className="flex flex-col border-t p-2">
                <span className="font-medium">Kadar HB (Hemoglobin)</span>
                <input type="number" step="0.1" placeholder="Contoh: 12.5 g/dL"
                  value={form.kadarHb}
                  onChange={(e) => setForm({ ...form, kadarHb: e.target.value })}
                  className="border p-2 rounded mt-1" />
              </div>
            </div>
          )}

          {/* ===== LANSIA ===== */}
          {form.kategori === "lansia" && (
            <div className="border rounded-xl overflow-hidden mt-4">
              <div className="bg-gray-100 p-2 font-semibold">Skrining Lansia</div>
              {[
                { label: "Batuk terus menerus", key: "batukLansia" },
                { label: "Demam ≥ 2 minggu", key: "demamLansia" },
                { label: "BB turun", key: "bbTurunLansia" },
                { label: "Kontak erat pasien TBC", key: "kontakTBCLansia" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="bg-gray-100 p-2 font-semibold">Pemeriksaan Kesehatan</div>
              <div className="grid grid-cols-3 gap-2 border-t p-2">
                <input type="text" placeholder="Tekanan Darah (120/80)"
                  value={form.tekananDarah}
                  onChange={(e) => setForm({ ...form, tekananDarah: e.target.value })}
                  className="border p-2 rounded" />
                <input type="text" placeholder="Gula Darah (mg/dL)"
                  value={form.gulaDarah}
                  onChange={(e) => setForm({ ...form, gulaDarah: e.target.value })}
                  className="border p-2 rounded" />
                <input type="text" placeholder="Kolesterol (mg/dL)"
                  value={form.kolesterol}
                  onChange={(e) => setForm({ ...form, kolesterol: e.target.value })}
                  className="border p-2 rounded" />
              </div>

              <div className="bg-gray-100 p-2 font-semibold">Penyuluhan</div>
              <RadioRow label="Mengikuti penyuluhan" fieldKey="penyuluhanLansia" form={form} setForm={setForm} />
              <div className="flex flex-col border-t p-2">
                <span>Topik penyuluhan</span>
                <input type="text" value={form.topikPenyuluhanLansia}
                  onChange={(e) => setForm({ ...form, topikPenyuluhanLansia: e.target.value })}
                  className="border p-1 rounded mt-1" />
              </div>

              {/* SKILAS */}
              <div className="bg-purple-100 p-2 font-semibold">Pemeriksaan Tahunan SKILAS</div>

              <div className="bg-gray-100 p-2 font-semibold">Penurunan Kognitif</div>
              {[
                { label: "Orientasi waktu & tempat", key: "orientasi" },
                { label: "Mengulang 3 kata", key: "ingatKata" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="bg-gray-100 p-2 font-semibold">Mobilitas</div>
              <RadioRow label="Tes berdiri dari kursi" fieldKey="tesBerdiri" form={form} setForm={setForm} />

              <div className="bg-gray-100 p-2 font-semibold">Malnutrisi</div>
              {[
                { label: "BB turun >3kg / baju longgar", key: "bbTurun3kg" },
                { label: "Hilang nafsu makan", key: "nafsuMakan" },
                { label: "LILA < 23.5 cm", key: "lila" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="bg-gray-100 p-2 font-semibold">Penglihatan</div>
              {[
                { label: "Masalah mata", key: "masalahMata" },
                { label: "Tes melihat", key: "tesMelihat" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="bg-gray-100 p-2 font-semibold">Pendengaran</div>
              <RadioRow label="Tes berbisik" fieldKey="tesBerbisik" form={form} setForm={setForm} />

              <div className="bg-gray-100 p-2 font-semibold">Gejala Depresi</div>
              {[
                { label: "Merasa sedih / putus asa", key: "sedih" },
                { label: "Kurang minat aktivitas", key: "minat" },
              ].map((item) => <RadioRow key={item.key} label={item.label} fieldKey={item.key} form={form} setForm={setForm} />)}

              <div className="bg-gray-100 p-2 font-semibold">Imunisasi</div>
              <RadioRow label="Imunisasi COVID-19" fieldKey="imunisasiCovid" form={form} setForm={setForm} />

              <div className="bg-gray-100 p-2 font-semibold">Penyuluhan SKILAS</div>
              <div className="border-t p-2">
                <input type="text" placeholder="Topik Penyuluhan"
                  value={form.topikPenyuluhanSkilas}
                  onChange={(e) => setForm({ ...form, topikPenyuluhanSkilas: e.target.value })}
                  className="border p-2 w-full rounded" />
              </div>
            </div>
          )}

          {/* ══ INPUT PERTANYAAN AI ══ */}
          <div className="mt-4 mb-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-700 mb-2">🤖 Pertanyaan untuk AI</h3>
            <textarea
              placeholder="Contoh: Berikan kesimpulan kesehatan pasien dan saran yang perlu disampaikan kepada pasien..."
              value={pertanyaanAI}
              onChange={(e) => setPertanyaanAI(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <p className="text-xs text-slate-500 mt-2">
              Bidan dapat menanyakan hasil skrining, kesimpulan kesehatan,
              faktor risiko, maupun saran edukasi untuk pasien.
            </p>
          </div>

          {/* ══ HASIL AI + VALIDASI BIDAN ══ */}
          {hasilAI && (
            <div className="mb-4 space-y-3">

              {/* Hasil AI */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h3 className="font-semibold text-emerald-700 mb-2">🤖 Hasil Kesimpulan AI</h3>
                <p className="text-sm text-emerald-800 leading-relaxed whitespace-pre-line">
                  {hasilAI}
                </p>
              </div>

              {/* Validasi Bidan */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-semibold text-yellow-700 mb-1">✍️ Validasi &amp; Catatan Bidan</h3>
                <p className="text-xs text-yellow-600 mb-2">
                  Tinjau kesimpulan AI di atas, lalu tambahkan koreksi atau catatan klinis jika diperlukan.
                </p>

                <textarea
                  placeholder="Contoh: Setuju dengan kesimpulan AI. Tambahan: pasien disarankan kontrol ulang dalam 2 minggu dan diet rendah garam..."
                  value={validasiBidan}
                  onChange={(e) => {
                    setValidasiBidan(e.target.value);
                    setSudahDivalidasi(false);
                  }}
                  rows={4}
                  disabled={sudahDivalidasi}
                  className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white transition-all ${
                    sudahDivalidasi ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => {
                      if (!validasiBidan.trim()) {
                        alert("Catatan validasi tidak boleh kosong!");
                        return;
                      }
                      setSudahDivalidasi(true);
                    }}
                    disabled={sudahDivalidasi}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      sudahDivalidasi
                        ? "bg-green-500 text-white cursor-default"
                        : "bg-yellow-500 hover:bg-yellow-600 text-white"
                    }`}
                  >
                    {sudahDivalidasi ? "✅ Sudah Divalidasi" : "✔️ Validasi Kesimpulan"}
                  </button>

                  {sudahDivalidasi && (
                    <button
                      onClick={() => {
                        setValidasiBidan("");
                        setSudahDivalidasi(false);
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 underline"
                    >
                      Ubah catatan
                    </button>
                  )}
                </div>

                {/* Preview catatan setelah divalidasi */}
                {sudahDivalidasi && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                    <span className="font-semibold">📝 Catatan Bidan: </span>
                    {validasiBidan}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ══ TOMBOL AKSI ══ */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={handleGenerateAI}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg"
            >
              {loadingAI ? "Generating..." : "🤖 Tanya AI"}
            </button>

            <button
              onClick={handleSimpan}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
            >
              {editId ? "Update" : "Simpan"}
            </button>

            {(editId || form.nama) && (
              <button
                onClick={() => {
                  setForm(FORM_DEFAULT);
                  setEditId(null);
                  setHasilAI("");
                  setValidasiBidan("");
                  setSudahDivalidasi(false);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
              >
                Batal
              </button>
            )}
          </div>

        </div>{/* ← penutup div FORM */}

        {/* ══════════════════════════════════════════════════
            TABEL DATA PELAYANAN
        ══════════════════════════════════════════════════ */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-purple-600 mb-4">📋 Data Pelayanan</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-100 text-center">
                  <th className="py-2 px-2">No</th>
                  <th className="px-2">Nama</th>
                  <th className="px-2">Kategori</th>
                  <th className="px-2">Tanggal</th>
                  <th className="px-2">Hasil Pemeriksaan</th>
                  <th className="px-2">Detail Pelayanan</th>
                  <th className="px-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id} className="text-center border-t align-top">
                    <td className="py-2 px-2">{index + 1}</td>
                    <td className="px-2 font-semibold">
                    {(item as any).peserta?.nama ?? item.nama ?? "-"}</td>
                    <td className="px-2">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs capitalize">
                        {item.kategori?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-2">{item.tanggal}</td>
                    <td className="px-2 text-xs text-left text-slate-500 max-w-[180px]">
                      {(item as any).ringkasan || "-"}
                    </td>
                    <td className="text-left text-xs p-2">
                      <div className="space-y-0.5">
                        {item.kategori === "balita" && (
                          <>
                            <p>ASI Eksklusif: {item.asiEksklusif ? "Ya" : "Tidak"}</p>
                            <p>MP ASI: {item.mpasi ? "Ya" : "Tidak"}</p>
                            <p>Batuk: {item.batuk ? "Ya" : "Tidak"}</p>
                            <p>Demam: {item.demam ? "Ya" : "Tidak"}</p>
                            <p>BB tidak naik: {item.bbTidakNaik ? "Ya" : "Tidak"}</p>
                            <p>Kontak TBC: {item.kontakTBC ? "Ya" : "Tidak"}</p>
                            <p>Imunisasi: {item.imunisasi ? "Ya" : "Tidak"}</p>
                            <p>Vitamin A: {item.vitaminA ? "Ya" : "Tidak"}</p>
                            <p>Obat Cacing: {item.obatCacing ? "Ya" : "Tidak"}</p>
                            <p>Patuh MT: {item.patuhMT ? "Ya" : "Tidak"}</p>
                          </>
                        )}
                        {item.kategori === "ibu_hamil" && (
                          <>
                            <p>TTD: {item.ttd ? "Ya" : "Tidak"}</p>
                            <p>Konsumsi TTD: {item.konsumsiTtd ? "Ya" : "Tidak"}</p>
                            <p>MT Bumil: {item.mtBumil ? "Ya" : "Tidak"}</p>
                            <p>Porsi MT: {item.porsiMt || "-"}</p>
                            <p>Rutin MT: {item.rutinMt ? "Ya" : "Tidak"}</p>
                            <p>Topik: {item.penyuluhanTopik || "-"}</p>
                            <p>Kelas Ibu: {item.ikutKelasIbu ? "Ya" : "Tidak"}</p>
                          </>
                        )}
                        {item.kategori === "ibu_nifas" && (
                          <>
                            <p>Waktu: {item.waktuDatang || "-"}</p>
                            <p>Batuk: {item.batukNifas ? "Ya" : "Tidak"}</p>
                            <p>Vitamin A: {item.vitaminA ? "Ya" : "Tidak"}</p>
                            <p>Kapsul: {item.jumlahKapsul || "-"}</p>
                            <p>Menyusui: {item.menyusui ? "Ya" : "Tidak"}</p>
                            <p>KB: {item.kbPasca ? "Ya" : "Tidak"}</p>
                            <p>Penyuluhan: {item.topikPenyuluhanNifas || "-"}</p>
                          </>
                        )}
                        {item.kategori === "remaja" && (
                          <>
                            <p>Batuk: {item.batukRemaja ? "Ya" : "Tidak"}</p>
                            <p>Penyuluhan: {item.penyuluhanRemaja ? "Ya" : "Tidak"}</p>
                            <p>Topik: {item.topikPenyuluhanRemaja || "-"}</p>
                            <p>Mata: {item.mataKanan} / {item.mataKiri}</p>
                            <p>Telinga: {item.telingaKanan} / {item.telingaKiri}</p>
                            <p>HB: {item.kadarHb || "-"}</p>
                          </>
                        )}
                        {item.kategori === "lansia" && (
                          <>
                            <p>TD: {(item as any).tekananDarah || "-"}</p>
                            <p>Gula: {item.gulaDarah || "-"}</p>
                            <p>Kolesterol: {item.kolesterol || "-"}</p>
                            <p>Penyuluhan: {item.penyuluhanLansia ? "Ya" : "Tidak"}</p>
                            <p>Topik: {item.topikPenyuluhanLansia || "-"}</p>
                            <p>Imunisasi Covid: {item.imunisasiCovid ? "Ya" : "Tidak"}</p>
                          </>
                        )}
                        {/* Tampilkan catatan validasi bidan jika ada */}
                        {item.validasiBidan && (
                        <div className="mt-2 text-yellow-700 text-xs">
                          📝 {item.validasiBidan}
                        </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleDetail(item)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-400 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleHapus(item.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-8">
                      Belum ada data pelayanan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

// ── Komponen RadioRow ──
function RadioRow({
  label, fieldKey, form, setForm,
}: {
  label: string;
  fieldKey: string;
  form: any;
  setForm: (v: any) => void;
}) {
  return (
    <div className="flex justify-between items-center border-t p-2">
      <span>{label}</span>
      <div className="flex gap-4">
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="radio" checked={form[fieldKey] === true}
            onChange={() => setForm({ ...form, [fieldKey]: true })} /> Ya
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="radio" checked={form[fieldKey] === false}
            onChange={() => setForm({ ...form, [fieldKey]: false })} /> Tidak
        </label>
      </div>
    </div>
  );
}