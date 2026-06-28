"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Kehadiran = {
  id: number;
  nama: string;
  nik?: string;
  alamat?: string;
  kategori?: string;
  tanggal: string;
  ringkasanPemeriksaan?: string;
  status: string;
  kondisi?: string;
  pos?: string;
};

type DataPelayanan = {
  id: number;
  nama?: string;
  nik?: string;
  alamat?: string;
  kategori?: string;
  tanggal: string;
  ringkasanPemeriksaan?: string;
  pos?: string;
  namaPos?: string;
  peserta?: {
    nama: string;
    nik?: string;
    alamat?: string;
    posyandu?: { nama: string };
  };
};

const DAFTAR_POSYANDU = [
  { id: "1", label: "Posyandu 1" },
  { id: "2", label: "Posyandu 2" },
  { id: "3", label: "Posyandu 3" },
  { id: "4", label: "Posyandu 4" },
  { id: "5", label: "Posyandu 5" },
  { id: "6", label: "Posyandu 6" },
  { id: "7", label: "Posyandu 7" },
  { id: "8", label: "Posyandu 8" },
  { id: "9", label: "Posyandu 9" },
];

const KATEGORI_COLOR: Record<string, string> = {
  balita: "bg-sky-100 text-sky-700",
  ibu_hamil: "bg-pink-100 text-pink-700",
  ibu_nifas_menyusui: "bg-rose-100 text-rose-700",
  ibu_nifas: "bg-rose-100 text-rose-700",
  lansia: "bg-amber-100 text-amber-700",
  remaja: "bg-violet-100 text-violet-700",
};

export default function LaporanPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [posLogin, setPosLogin] = useState("");
  const [currentPosId, setCurrentPosId] = useState<number | null>(null);
  const [daftarPeserta, setDaftarPeserta] = useState<any[]>([]);
  const [nama, setNama] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [status, setStatus] = useState("");
  const [nik, setNik] = useState("");
  const [alamat, setAlamat] = useState("");
  const [kategori, setKategori] = useState("");
  const [kondisi, setKondisi] = useState("");
  const [sugestNama, setSugestNama] = useState<any[]>([]);
  const [showSugest, setShowSugest] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [searchNama, setSearchNama] = useState("");
  const [filterPos, setFilterPos] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [data, setData] = useState<Kehadiran[]>([]);
  const [showForm, setShowForm] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowSugest(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) { router.push("/login"); return; }
      const user = await meRes.json();
      const roleUI = user.role.toLowerCase();
      setRole(roleUI);
      setCurrentPosId(user.currentPosId);

      if (roleUI === "kader") {
        setFilterPos(user.currentPosId?.toString() ?? "");
        setPosLogin(`Posyandu ${user.currentPosId}`);
      }

      const pesertaRes = await fetch("/api/peserta");
      const pesertaData = await pesertaRes.json();
      setDaftarPeserta(Array.isArray(pesertaData) ? pesertaData : []);

const pemRes = await fetch("/api/pemeriksaan");
const pemData = await pemRes.json();
if (Array.isArray(pemData)) {
  const hasilLaporan = pemData.map((item: any) => {
    // Susun ringkasan pemeriksaan dari field-field numerik yang tersedia
    const bagianRingkasan: string[] = [];

    if (item.bb || item.tb) bagianRingkasan.push(`BB: ${item.bb ?? "-"} kg, TB: ${item.tb ?? "-"} cm`);
    if (item.tekananDarah) bagianRingkasan.push(`TD: ${item.tekananDarah}`);
    if (item.usiaKehamilan) bagianRingkasan.push(`Usia Kehamilan: ${item.usiaKehamilan} minggu`);
    if (item.statusBbU) bagianRingkasan.push(`Status BB/U: ${item.statusBbU}`);
    if (item.statusTbU) bagianRingkasan.push(`Status TB/U: ${item.statusTbU}`);
    if (item.statusImt) bagianRingkasan.push(`IMT: ${item.statusImt}`);
    if (item.imt) bagianRingkasan.push(`IMT: ${item.imt}`);
    if (item.lila) bagianRingkasan.push(`LILA: ${item.lila} cm`);

    const ringkasanPemeriksaan = bagianRingkasan.length > 0
      ? bagianRingkasan.join(" | ")
      : "-";

    // Deteksi kondisi risiko dari status-status pemeriksaan
    const semuaStatus = [
      item.statusBbU, item.statusTbU, item.statusBbTb, item.statusLingkar,
      item.statusImt, item.statusTekananDarah, item.statusImtBumil,
      item.statusLilaBumil, item.statusTdBumil, item.statusImtRemaja,
      item.statusTdRemaja,
    ].filter(Boolean).join(" ").toLowerCase();

    const kondisi = semuaStatus.includes("resiko") || semuaStatus.includes("risiko")
      || semuaStatus.includes("kurang") || semuaStatus.includes("buruk")
      || semuaStatus.includes("lebih") || semuaStatus.includes("tinggi")
      ? "resiko"
      : "normal";

    return {
      id: item.id,
      nama: item.peserta?.nama ?? "-",
      nik: item.peserta?.nik ?? "-",
      alamat: item.peserta?.alamat ?? "-",
      kategori: item.kategori,
      tanggal: item.tanggal,
      ringkasanPemeriksaan,
      pos: item.posyandu?.nama ?? "-",
      status: "Hadir",
      kondisi,
    };
  });
  setData(hasilLaporan);
}
    };
    init();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const cocokNama = item.nama.toLowerCase().includes(searchNama.toLowerCase());
      const cocokPos = !filterPos || item.pos === `Posyandu ${filterPos}`;
      const cocokBulan = !filterBulan || item.tanggal?.startsWith(filterBulan);
      return cocokNama && cocokPos && cocokBulan;
    });
  }, [data, searchNama, filterPos, filterBulan]);
  const handleNamaChange = (val: string) => {
    setNama(val);
    setIsAutoFilled(false);
    if (val.trim().length === 0) {
      setSugestNama([]); setShowSugest(false);
      setNik(""); setAlamat(""); setKategori("");
      return;
    }
    const hasil = daftarPeserta.filter((p) =>
      (p.nama ?? "").toLowerCase().includes(val.toLowerCase())
    );
    setSugestNama(hasil.slice(0, 8));
    setShowSugest(hasil.length > 0);
  };

  const handlePilihSaran = (peserta: any) => {
    setNama(peserta.nama ?? "");
    setNik(peserta.nik ?? "");
    setAlamat(peserta.alamat ?? "");
    setKategori(peserta.kategori ?? "");
    setIsAutoFilled(true);
    setShowSugest(false);
    setSugestNama([]);
  };

  const handleTambah = () => {
    if (!nama || !tanggal || !status) return;
    const newData: Kehadiran = {
      id: Date.now(), nama, nik, alamat, kategori, tanggal, status, kondisi,
      pos: posLogin,
    };
    setData([...data, newData]);
    setNama(""); setTanggal(""); setStatus(""); setNik("");
    setAlamat(""); setKategori(""); setKondisi("");
    setIsAutoFilled(false); setShowForm(false);
  };

const handleHapus = async (id: number) => {
  const konfirmasi = confirm("Yakin ingin menghapus data ini?");
  if (!konfirmasi) return;

  try {
    const res = await fetch(`/api/pelayanan?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Gagal menghapus data");
      return;
    }
    // Hapus dari state setelah berhasil di DB
    setData(data.filter((item) => item.id !== id));
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat menghapus");
  }
};

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const judulBulan = filterBulan
    ? ` - ${new Date(filterBulan + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
    : "";
  
  doc.text(`Laporan Kehadiran Posyandu${judulBulan}`, 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["No", "Nama", "NIK", "Alamat", "Pos", "Tanggal", "Kategori", "Hasil Pemeriksaan", "Kehadiran", "Kondisi"]],
      body: filteredData.map((item, i) => [
        i + 1, item.nama, item.nik || "-", item.alamat || "-", item.pos || "-",
        item.tanggal, item.kategori || "-", item.ringkasanPemeriksaan || "-",
        item.status, item.kondisi || "-",
      ]),
    });
    doc.save("laporan-kehadiran.pdf");
  };

  const stats = useMemo(() => ({
    total: filteredData.length,
    hadir: filteredData.filter(d => d.status === "Hadir").length,
    resiko: filteredData.filter(d => d.kondisi === "resiko").length,
  }), [filteredData]);

  if (!role) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-3 h-3 rounded-full bg-teal-400 animate-bounce" style={{animationDelay: `${i*0.15}s`}} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar role={role} />

      <main className="flex-1 p-6 space-y-5 overflow-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Posyandu ILP</p>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Laporan Kehadiran
              <span className="ml-2 text-xs font-semibold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full capitalize">{role}</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
            >
              <span>{showForm ? "✕ Tutup" : "+ Tambah"}</span>
            </button>
            <button
              onClick={handleExportPDF}
              style={{ backgroundColor: '#94468d', color: '#ffffff' }}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
            >
              🖨️ Export PDF
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Peserta", value: stats.total, color: "bg-white border-slate-200", text: "text-slate-800", icon: "👥" },
            { label: "Hadir", value: stats.hadir, color: "bg-teal-50 border-teal-200", text: "text-teal-700", icon: "✅" },
            { label: "Perlu Perhatian", value: stats.resiko, color: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: "⚠️" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} border rounded-2xl p-4 flex items-center gap-3 shadow-sm`}>
              <div className="text-2xl">{s.icon}</div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FORM TAMBAH ── */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-teal-500 rounded-full inline-block" />
              Tambah Data Kehadiran
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

              {/* Nama + Autocomplete */}
              <div className="relative lg:col-span-1" ref={autocompleteRef}>
                <label className="text-xs text-slate-500 font-medium mb-1 block">Nama Peserta</label>
                <input
                  type="text"
                  placeholder="Ketik nama peserta..."
                  value={nama}
                  onChange={(e) => handleNamaChange(e.target.value)}
                  onFocus={() => sugestNama.length > 0 && setShowSugest(true)}
                  autoComplete="off"
                  className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition
                    ${isAutoFilled
                      ? "border-teal-400 bg-teal-50 text-teal-800"
                      : "border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    }`}
                />
                {isAutoFilled && (
                  <span className="absolute top-7 right-2 text-teal-500 text-xs font-semibold">✓</span>
                )}

                {/* Dropdown */}
                {showSugest && sugestNama.length > 0 && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100">
                      <p className="text-xs text-slate-500">{sugestNama.length} peserta ditemukan</p>
                    </div>
                    <ul className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                      {sugestNama.map((p) => (
                        <li
                          key={p.id}
                          onClick={() => handlePilihSaran(p)}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-teal-50 cursor-pointer transition"
                        >
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-bold shrink-0">
                            {(p.nama ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {(p.nama ?? "").split(new RegExp(`(${nama})`, "gi")).map((part: string, i: number) =>
                                part.toLowerCase() === nama.toLowerCase()
                                  ? <mark key={i} className="bg-yellow-200 rounded px-0.5">{part}</mark>
                                  : <span key={i}>{part}</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">
                              {p.nik ? `NIK: ${p.nik}` : "NIK: -"} {p.kategori ? `· ${p.kategori}` : ""}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* NIK */}
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block">NIK</label>
                <input placeholder="NIK" value={nik}
                  onChange={(e) => setNik(e.target.value)} readOnly={isAutoFilled}
                  className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition
                    ${isAutoFilled ? "border-teal-300 bg-teal-50 text-slate-500" : "border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"}`}
                />
              </div>

              {/* Alamat */}
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block">Alamat</label>
                <input placeholder="Alamat" value={alamat}
                  onChange={(e) => setAlamat(e.target.value)} readOnly={isAutoFilled}
                  className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition
                    ${isAutoFilled ? "border-teal-300 bg-teal-50 text-slate-500" : "border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"}`}
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block">Kategori</label>
                <select value={kategori} onChange={(e) => setKategori(e.target.value)}
                  disabled={isAutoFilled}
                  className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition
                    ${isAutoFilled ? "border-teal-300 bg-teal-50 text-slate-500" : "border-slate-300 focus:border-teal-400"}`}
                >
                  <option value="">Pilih Kategori</option>
                  <option value="balita">Balita</option>
                  <option value="ibu_hamil">Ibu Hamil</option>
                  <option value="ibu_nifas_menyusui">Ibu Nifas</option>
                  <option value="lansia">Lansia</option>
                  <option value="remaja">Remaja</option>
                </select>
              </div>

              {/* Tanggal */}
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block">Tanggal</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block">Status Kehadiran</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400 transition"
                >
                  <option value="">Pilih Status</option>
                  <option value="Hadir">✅ Hadir</option>
                  <option value="Tidak Hadir">❌ Tidak Hadir</option>
                </select>
              </div>

              {/* Kondisi */}
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block">Kondisi</label>
                <select value={kondisi} onChange={(e) => setKondisi(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400 transition"
                >
                  <option value="">Pilih Kondisi</option>
                  <option value="normal">🟢 Normal</option>
                  <option value="resiko">🟡 Berisiko</option>
                </select>
              </div>
            </div>

            {isAutoFilled && (
              <p className="mt-3 text-xs text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                ✓ Data peserta terisi otomatis
                <button onClick={() => { setNama(""); setNik(""); setAlamat(""); setKategori(""); setIsAutoFilled(false); }}
                  className="ml-2 underline hover:text-teal-800">Reset</button>
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button onClick={handleTambah} disabled={!nama || !tanggal || !status}
              style={{ backgroundColor: '#824392', color: '#ffffff' }}
                className="bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
              >
                Simpan Data
              </button>
              <button onClick={() => setShowForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm transition"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* ── FILTER & TABEL ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Cari nama peserta..."
                value={searchNama}
                onChange={(e) => setSearchNama(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>
            {/* Filter Bulan */}
              <input
                type="month"
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
              />

              {filterBulan && (
                <button
                  onClick={() => setFilterBulan("")}
                  className="text-xs text-slate-400 hover:text-red-500 transition"
                >
                  ✕ Reset bulan
                </button>
              )}

            {role === "bidan" && (
              <select value={filterPos} onChange={(e) => setFilterPos(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400 transition min-w-[160px]"
              >
                <option value="">Semua Posyandu</option>
                {DAFTAR_POSYANDU.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            )}

            {role === "kader" && (
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 px-3 py-2 rounded-xl text-sm font-medium">
                📍 {posLogin || "Posyandu Anda"}
              </div>
            )}

            <div className="ml-auto text-xs text-slate-400 font-medium">
              {filteredData.length} data ditemukan
            </div>
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">NIK</th>
                  <th className="px-4 py-3 text-left">Alamat</th>
                  <th className="px-4 py-3 text-left">Pos</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Kategori</th>
                  <th className="px-4 py-3 text-left">Hasil Pemeriksaan</th>
                  <th className="px-4 py-3 text-center">Kehadiran</th>
                  <th className="px-4 py-3 text-center">Kondisi</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <span className="text-4xl">📋</span>
                        <p className="font-medium">Belum ada data kehadiran</p>
                        <p className="text-xs">Klik tombol Tambah untuk menambahkan data</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{item.nama}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.nik || "-"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-[120px] truncate">{item.alamat || "-"}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{item.pos || "-"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{item.tanggal}</td>
                      <td className="px-4 py-3">
                        {item.kategori ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${KATEGORI_COLOR[item.kategori] ?? "bg-slate-100 text-slate-600"}`}>
                            {item.kategori.replace(/_/g, " ")}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[180px]">
                        <span className="line-clamp-2">{item.ringkasanPemeriksaan || "-"}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === "Hadir"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {item.status === "Hadir" ? "✓ Hadir" : "✗ Absen"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.kondisi === "normal"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {item.kondisi === "normal" ? "Normal" : "⚠ Risiko"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleHapus(item.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg text-xs transition font-medium"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
