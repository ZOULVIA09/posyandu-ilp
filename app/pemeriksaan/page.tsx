"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";

type Peserta = {
  id: number;
  pesertaId?: number;
  nama: string;
  peserta?: { nama: string; kategori: string }; // ← tambah ini
  kategori: string;
  pos: string;
  tanggal?: string;
  posyandu?: { nama: string };
  nik?: string;
  alamat?: string;
  bb?: string; tb?: string; lingkarKepala?: string; lila?: string;
  statusBbU?: string; statusTbU?: string; statusBbTb?: string; statusLingkar?: string;
  lansiaBb?: string; lansiaTb?: string; lingkarPerut?: string; lilaLansia?: string;
  tekananDarah?: string; imt?: string; statusImt?: string; statusTekananDarah?: string;
  usiaKehamilan?: string; bbBumil?: string; lilaBumil?: string; tdBumil?: string;
  imtBumil?: string; statusImtBumil?: string; statusLilaBumil?: string; statusTdBumil?: string;
  waktuKunjungan?: string; bbNifas?: string; tdNifas?: string;
  remajaBb?: string; remajaTb?: string; lingkarPerutRemaja?: string;
  tdRemaja?: string; imtRemaja?: string; statusImtRemaja?: string; statusTdRemaja?: string;
};

const DAFTAR_POSYANDU = [
  { label: "Posyandu 1", posId: 1 },
  { label: "Posyandu 2", posId: 2 },
  { label: "Posyandu 3", posId: 3 },
  { label: "Posyandu 4", posId: 4 },
  { label: "Posyandu 5", posId: 5 },
  { label: "Posyandu 6", posId: 6 },
  { label: "Posyandu 7", posId: 7 },
  { label: "Posyandu 8", posId: 8 },
  { label: "Posyandu 9", posId: 9 },
];

export default function PemeriksaanPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [activePosId, setActivePosId] = useState<number | null>(null);
  const [kaderPosId, setKaderPosId] = useState<number | null>(null);
  const [bidanSelectedLabel, setBidanSelectedLabel] = useState("");
  const [data, setData] = useState<Peserta[]>([]);
  const [dataPeserta, setDataPeserta] = useState<any[]>([]);

  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [alamat, setAlamat] = useState("");
  const [kategori, setKategori] = useState("");
  const [pos, setPos] = useState("");
  const [bb, setBb] = useState("");
  const [tb, setTb] = useState("");
  const [lingkarKepala, setLingkarKepala] = useState("");
  const [lila, setLila] = useState("");
  const [statusBbU, setStatusBbU] = useState("");
  const [statusTbU, setStatusTbU] = useState("");
  const [statusBbTb, setStatusBbTb] = useState("");
  const [statusLingkar, setStatusLingkar] = useState("");
  const [lansiaBb, setLansiaBb] = useState("");
  const [lansiaTb, setLansiaTb] = useState("");
  const [lingkarPerut, setLingkarPerut] = useState("");
  const [lilaLansia, setLilaLansia] = useState("");
  const [tekananDarah, setTekananDarah] = useState("");
  const [imt, setImt] = useState("");
  const [statusImt, setStatusImt] = useState("");
  const [statusTekananDarah, setStatusTekananDarah] = useState("");
  const [usiaKehamilan, setUsiaKehamilan] = useState("");
  const [bbBumil, setBbBumil] = useState("");
  const [lilaBumil, setLilaBumil] = useState("");
  const [tdBumil, setTdBumil] = useState("");
  const [imtBumil, setImtBumil] = useState("");
  const [statusImtBumil, setStatusImtBumil] = useState("");
  const [statusLilaBumil, setStatusLilaBumil] = useState("");
  const [statusTdBumil, setStatusTdBumil] = useState("");
  const [waktuKunjungan, setWaktuKunjungan] = useState("");
  const [bbNifas, setBbNifas] = useState("");
  const [tdNifas, setTdNifas] = useState("");
  const [remajaBb, setRemajaBb] = useState("");
  const [remajaTb, setRemajaTb] = useState("");
  const [lingkarPerutRemaja, setLingkarPerutRemaja] = useState("");
  const [tdRemaja, setTdRemaja] = useState("");
  const [imtRemaja, setImtRemaja] = useState("");
  const [statusImtRemaja, setStatusImtRemaja] = useState("");
  const [statusTdRemaja, setStatusTdRemaja] = useState("");
  const [jawaban, setJawaban] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [activePesertaId, setActivePesertaId] = useState<number | null>(null);
  const [searchNama, setSearchNama] = useState("");
  // ✅ FIX: default true supaya tabel langsung tampil
  const [showPeserta, setShowPeserta] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // ── inisialisasi role & posId ──────────────────────────────────────────────
  // ✅ Jadi ini:
useEffect(() => {
  const init = async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) { router.push("/login"); return; }

    const user = await res.json();
    // Simpan role dalam huruf kecil untuk keperluan UI
    const roleUI = user.role.toLowerCase(); // "KADER" → "kader"
    setRole(roleUI);

    if (roleUI === "kader") {
      setKaderPosId(user.currentPosId);
      setActivePosId(user.currentPosId);
    }
  };

  init();
}, []);

  // ── fetch ulang setiap kali activePosId berubah ───────────────────────────
  useEffect(() => {
    if (!activePosId) return;
    fetchPosData(activePosId);
  }, [activePosId]);

  const fetchPosData = async (posId: number) => {
    setLoadingData(true);
    try {
      const [pesertaRes, pemeriksaanRes] = await Promise.all([
        // ✅ FIX: kirim posId ke /api/peserta supaya difilter
        fetch(`/api/peserta?posId=${posId}`),
        fetch(`/api/pemeriksaan?posId=${posId}`),
      ]);
      const pesertaData = await pesertaRes.json();
      const pemeriksaanData = await pemeriksaanRes.json();
      setDataPeserta(Array.isArray(pesertaData) ? pesertaData : []);
      setData(Array.isArray(pemeriksaanData) ? pemeriksaanData : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  // ── bidan pilih posyandu ──────────────────────────────────────────────────
  const handleBidanPilihPos = (posId: number, label: string) => {
    setDataPeserta([]);
    setData([]);
    setActivePesertaId(null);
    setNama("");
    setBidanSelectedLabel(label);
    setActivePosId(posId);
  };

  const sudahDiperiksa = (pesertaId: number) =>
    data.some((d) => d.pesertaId === pesertaId);

  const resetForm = () => {
    setNama(""); setNik(""); setAlamat(""); setKategori(""); setPos("");
    setBb(""); setTb(""); setLila(""); setLingkarKepala("");
    setStatusBbU(""); setStatusTbU(""); setStatusBbTb(""); setStatusLingkar("");
    setLansiaBb(""); setLansiaTb(""); setLingkarPerut(""); setLilaLansia("");
    setTekananDarah(""); setImt(""); setStatusImt(""); setStatusTekananDarah("");
    setUsiaKehamilan(""); setBbBumil(""); setLilaBumil(""); setTdBumil(""); setImtBumil("");
    setStatusImtBumil(""); setStatusLilaBumil(""); setStatusTdBumil("");
    setWaktuKunjungan(""); setBbNifas(""); setTdNifas("");
    setRemajaBb(""); setRemajaTb(""); setLingkarPerutRemaja("");
    setTdRemaja(""); setImtRemaja(""); setStatusImtRemaja(""); setStatusTdRemaja("");
    setJawaban(""); setEditId(null); setActivePesertaId(null);
  };

const handlePeriksa = (item: any) => {
  setNama(item.nama ?? "");
  setNik(item.nik ?? "");
  setAlamat(item.alamat ?? "");
  setKategori(item.kategori ?? "");
  setPos(item.pos ?? "");
  setActivePesertaId(item.id);
  setEditId(null);              // ← FIX: null, bukan item.id (itu peserta, bukan pemeriksaan)

  // reset semua field pengukuran
  setBb(""); setTb(""); setLila(""); setLingkarKepala("");
  setStatusBbU(""); setStatusTbU(""); setStatusBbTb(""); setStatusLingkar("");
  setLansiaBb(""); setLansiaTb(""); setLingkarPerut(""); setLilaLansia("");
  setTekananDarah(""); setImt(""); setStatusImt(""); setStatusTekananDarah("");
  setUsiaKehamilan(""); setBbBumil(""); setLilaBumil(""); setTdBumil(""); setImtBumil("");
  setStatusImtBumil(""); setStatusLilaBumil(""); setStatusTdBumil("");
  setWaktuKunjungan(""); setBbNifas(""); setTdNifas("");
  setRemajaBb(""); setRemajaTb(""); setLingkarPerutRemaja("");
  setTdRemaja(""); setImtRemaja(""); setStatusImtRemaja(""); setStatusTdRemaja("");
  setJawaban("");

  setTimeout(() => {
    document.getElementById("form-pemeriksaan")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
  };

  const handleEdit = (item: Peserta) => {
    setEditId(item.id); setActivePesertaId(item.pesertaId ?? item.id);
    setNama(item.nama); setNik(item.nik || ""); setAlamat(item.alamat || "");
    setKategori(item.kategori); setPos(item.pos);
    setBb(item.bb || ""); setTb(item.tb || "");
    setLingkarKepala(item.lingkarKepala || ""); setLila(item.lila || "");
    setStatusBbU(item.statusBbU || ""); setStatusTbU(item.statusTbU || "");
    setStatusBbTb(item.statusBbTb || ""); setStatusLingkar(item.statusLingkar || "");
    setLansiaBb(item.lansiaBb || ""); setLansiaTb(item.lansiaTb || "");
    setLingkarPerut(item.lingkarPerut || ""); setLilaLansia(item.lilaLansia || "");
    setTekananDarah(item.tekananDarah || ""); setImt(item.imt || "");
    setStatusImt(item.statusImt || ""); setStatusTekananDarah(item.statusTekananDarah || "");
    setUsiaKehamilan((item as any).usiaKehamilan || "");
    setBbBumil((item as any).bbBumil || ""); setTdBumil((item as any).tdBumil || "");
    setLilaBumil((item as any).lilaBumil || ""); setImtBumil((item as any).imtBumil || "");
    setStatusImtBumil((item as any).statusImtBumil || "");
    setStatusLilaBumil((item as any).statusLilaBumil || "");
    setStatusTdBumil((item as any).statusTdBumil || "");
    setWaktuKunjungan((item as any).waktuKunjungan || "");
    setBbNifas((item as any).bbNifas || ""); setTdNifas((item as any).tdNifas || "");
    setRemajaBb((item as any).remajaBb || ""); setRemajaTb((item as any).remajaTb || "");
    setLingkarPerutRemaja((item as any).lingkarPerutRemaja || "");
    setTdRemaja((item as any).tdRemaja || ""); setImtRemaja((item as any).imtRemaja || "");
    setStatusImtRemaja((item as any).statusImtRemaja || "");
    setStatusTdRemaja((item as any).statusTdRemaja || "");
    setTimeout(() => {
      document.getElementById("form-pemeriksaan")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSimpan = async () => {
    if (!nama || !kategori) {
      alert("Klik tombol Periksa dulu sebelum simpan!");
      return;
    }
    try {
      const res = await fetch("/api/pemeriksaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesertaId: activePesertaId,
          posId: activePosId,
          kategori, nama, nik, alamat, pos,
          bb, tb, lingkarKepala, lila,
          statusBbU, statusTbU, statusBbTb, statusLingkar,
          lansiaBb, lansiaTb, lingkarPerut, lilaLansia,
          tekananDarah, imt, statusImt, statusTekananDarah,
          usiaKehamilan, bbBumil, lilaBumil, tdBumil, imtBumil,
          statusImtBumil, statusLilaBumil, statusTdBumil,
          waktuKunjungan, bbNifas, tdNifas,
          remajaBb, remajaTb, lingkarPerutRemaja,
          tdRemaja, imtRemaja, statusImtRemaja, statusTdRemaja,
        }),
      });

      if (!res.ok) throw new Error("Gagal simpan");

      if (activePosId) await fetchPosData(activePosId);
      resetForm();
      alert("Data berhasil disimpan");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data");
    }
  };

  const handleHapus = async (id: number) => {
    const confirmDelete = confirm("Yakin ingin menghapus data?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/pemeriksaan?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal hapus");
      setData((prev) => prev.filter((item) => item.id !== id));
      alert("Data berhasil dihapus");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data");
    }
  };

  const handleTanyaAI = async () => {
    if (!nama || !kategori) { alert("Isi nama dan kategori dulu"); return; }
    let detail = "";
    if (kategori === "balita") detail = `BB: ${bb} kg\nTB: ${tb} cm\nLILA: ${lila} cm\nStatus BB/U: ${statusBbU}\nStatus TB/U: ${statusTbU}\nStatus BB/TB: ${statusBbTb}`;
    if (kategori === "lansia") detail = `BB: ${lansiaBb} kg\nTB: ${lansiaTb} cm\nLingkar Perut: ${lingkarPerut}\nTD: ${tekananDarah}\nIMT: ${imt}`;
    if (kategori === "ibu_hamil") detail = `Usia Kehamilan: ${usiaKehamilan}\nBB: ${bbBumil} kg\nLILA: ${lilaBumil}\nTD: ${tdBumil}\nIMT: ${imtBumil}`;
    if (kategori === "ibu_nifas_menyusui") detail = `Waktu Kunjungan: ${waktuKunjungan}\nBB: ${bbNifas} kg\nTD: ${tdNifas}`;
    if (kategori === "remaja") detail = `BB: ${remajaBb} kg\nTB: ${remajaTb} cm\nLingkar Perut: ${lingkarPerutRemaja}\nTD: ${tdRemaja}\nIMT: ${imtRemaja}`;
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, kategori, detail }),
      });
      const resData = await res.json();
      setJawaban(resData.jawaban);
    } catch (error) {
      console.error("ERROR:", error);
      alert("Gagal menghubungi AI");
    }
  };

  const latestPerPeserta = (pesertaId: number): Peserta | undefined => {
    const records = data.filter((d) => d.pesertaId === pesertaId);
    return records[0];
  };

  if (!role) return <p>Loading...</p>;

  const canEdit = role === "kader";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role={role} />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🩺 Pemeriksaan ({role})</h1>

        {/* ── BIDAN: PILIH POSYANDU ─────────────────────────────────────────── */}
        {role === "bidan" && (
          <div className="bg-white p-5 rounded-2xl shadow mb-6 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Pilih Posyandu yang ingin dilihat:</p>
              <select
                value={activePosId ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const label = DAFTAR_POSYANDU.find((p) => p.posId === id)?.label || "";
                  handleBidanPilihPos(id, label);
                }}
                className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-[180px]"
              >
                <option value="">-- Pilih Posyandu --</option>
                {DAFTAR_POSYANDU.map((p) => (
                  <option key={p.posId} value={p.posId}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {activePosId && (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
                📍 Menampilkan: <b>{bidanSelectedLabel}</b>
                <span className="ml-2 text-slate-400">
                  ({dataPeserta.length} peserta)
                </span>
              </div>
            )}

            {loadingData && (
              <div className="text-sm text-slate-400 animate-pulse">Memuat data...</div>
            )}
          </div>
        )}

        {/* ── KADER: INFO POS ──────────────────────────────────────────────── */}
        {role === "kader" && (
          <div className="bg-purple-50 border border-purple-200 text-purple-700 px-5 py-3 rounded-2xl mb-6 text-sm font-medium flex items-center gap-2">
            📍 Posyandu Anda:
            <b>{DAFTAR_POSYANDU.find((p) => p.posId === kaderPosId)?.label ?? `Pos ${kaderPosId}`}</b>
            <span className="ml-auto text-slate-400 font-normal">
              {dataPeserta.length} peserta terdaftar
            </span>
          </div>
        )}

        {/* ── TABEL PENDAFTARAN ─────────────────────────────────────────────── */}
        {(role === "kader" || (role === "bidan" && activePosId)) && (
          <div className="bg-white p-6 rounded-2xl shadow mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h2 className="font-semibold text-indigo-600">📋 Data Pendaftaran</h2>
                <p className="text-sm text-slate-400">Total peserta: {dataPeserta.length}</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cari nama peserta..."
                  value={searchNama}
                  onChange={(e) => setSearchNama(e.target.value)}
                  autoComplete="off"
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={() => setShowPeserta(!showPeserta)}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  {showPeserta ? "Sembunyikan" : "Tampilkan"} Data
                </button>
              </div>
            </div>

            {showPeserta && (
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="bg-indigo-100">
                    <th className="py-2">No</th>
                    <th>Nama</th>
                    <th>NIK</th>
                    <th>Alamat</th>
                    <th>Kategori</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPeserta
                    .filter((item) =>
                      item.nama?.toLowerCase().includes(searchNama.toLowerCase().trim())
                    )
                    .map((item, i) => (
                      <tr
                        key={item.id}
                        className={`border-b transition-colors ${activePesertaId === item.id ? "bg-indigo-50" : ""}`}
                      >
                        <td className="py-2">{i + 1}</td>
                        <td>
                          <button
                            onClick={() => canEdit && handlePeriksa(item)}
                            className={`font-semibold ${canEdit ? "text-indigo-600 hover:underline cursor-pointer" : "text-slate-700 cursor-default"}`}
                          >
                            {item.nama}
                            {canEdit && <span className="ml-1 text-xs text-indigo-400">✏️</span>}
                          </button>
                        </td>
                        <td>{item.nik ?? "—"}</td>
                        <td>{item.alamat ?? "—"}</td>
                        <td>
                          <span className="bg-indigo-200 text-indigo-700 px-2 py-1 rounded text-xs capitalize">
                            {item.kategori?.replace("_", " ") || "—"}
                          </span>
                        </td>
                        <td className="space-x-1 py-1">
                          {canEdit && (
                            <button
                              onClick={() => handlePeriksa(item)}
                              className={`px-3 py-1 rounded text-xs font-medium text-white transition ${
                                activePesertaId === item.id
                                  ? "bg-indigo-700"
                                  : "bg-blue-500 hover:bg-blue-600"
                              }`}
                            >
                              {activePesertaId === item.id ? "Sedang Periksa" : "Periksa"}
                            </button>
                          )}
                          {sudahDiperiksa(item.id) && (
                            <button
                              onClick={() => router.push(`/detail?id=${item.id}`)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                            >
                              Detail
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  {dataPeserta.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-6">
                        {loadingData ? "Memuat data..." : "Belum ada peserta terdaftar"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── PLACEHOLDER bidan belum pilih pos ───────────────────────────── */}
        {role === "bidan" && !activePosId && (
          <div className="bg-white p-10 rounded-2xl shadow text-center text-slate-400 mb-6">
            <p className="text-4xl mb-3">🏥</p>
            <p className="text-base font-medium">Pilih posyandu terlebih dahulu</p>
            <p className="text-sm mt-1">Gunakan dropdown di atas untuk memilih Posyandu 1 – 9</p>
          </div>
        )}

        {/* ── FORM PEMERIKSAAN (kader only) ────────────────────────────────── */}
        {canEdit && (
          <div id="form-pemeriksaan" className="bg-white p-6 rounded-2xl shadow-lg mb-6 scroll-mt-6">
            <h2 className="font-semibold mb-1 text-violet-600">✏️ Form Pemeriksaan</h2>
            {nama ? (
              <p className="text-sm text-slate-500 mb-4">
                Mengisi pemeriksaan untuk: <span className="font-bold text-slate-700">{nama}</span>
              </p>
            ) : (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg mb-4">
                ⬆️ Klik nama peserta atau tombol <strong>Periksa</strong> untuk mulai mengisi.
              </p>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder="Nama" value={nama} readOnly className="border p-2 rounded bg-gray-100" />
              <input placeholder="NIK" value={nik} readOnly className="border p-2 rounded bg-gray-100" />
              <input placeholder="Alamat" value={alamat} readOnly className="border p-2 rounded bg-gray-100 col-span-2" />
              {/* Kategori: read-only jika sudah pilih peserta, editable jika manual */}
{activePesertaId ? (
  <div className="border p-2 rounded bg-gray-100 text-gray-600 text-sm flex items-center gap-2">
    <span className="text-xs text-gray-400">Kategori:</span>
    <span className="font-medium capitalize">
      {kategori?.replace(/_/g, " ") || "—"}
    </span>
    <span className="ml-auto text-xs text-indigo-400">🔒 dari data peserta</span>
  </div>
) : (
  <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="border p-2 rounded">
    <option value="">Kategori</option>
    <option value="balita">Balita</option>
    <option value="ibu_hamil">Ibu Hamil</option>
    <option value="ibu_nifas_menyusui">Ibu Nifas &amp; Menyusui</option>
    <option value="lansia">Lansia</option>
    <option value="remaja">Remaja</option>
  </select>
)}

              {kategori === "balita" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 col-span-2">
                  <input placeholder="BB (kg)" value={bb} onChange={(e) => setBb(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="TB/Panjang (cm)" value={tb} onChange={(e) => setTb(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="Lingkar Kepala (cm)" value={lingkarKepala} onChange={(e) => setLingkarKepala(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="LILA (cm)" value={lila} onChange={(e) => setLila(e.target.value)} className="border p-2 rounded" />
                  <select value={statusBbU} onChange={(e) => setStatusBbU(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Status BB/U</option>
                    <option>BB tidak naik</option>
                    <option>BB naik tidak akurat</option>
                    <option>BB normal</option>
                    <option>BB lebih</option>
                  </select>
                  <select value={statusTbU} onChange={(e) => setStatusTbU(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Status TB/U</option>
                    <option>Pendek</option>
                    <option>Normal</option>
                    <option>Tinggi</option>
                  </select>
                  <select value={statusBbTb} onChange={(e) => setStatusBbTb(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Status BB/TB</option>
                    <option>Gizi Buruk</option>
                    <option>Gizi Kurang</option>
                    <option>Gizi Baik</option>
                    <option>Berisiko</option>
                    <option>Gizi Lebih</option>
                    <option>Obesitas</option>
                  </select>
                  <select value={statusLingkar} onChange={(e) => setStatusLingkar(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Status Lingkar Kepala</option>
                    <option>Normal</option>
                    <option>Melebihi Normal</option>
                    <option>Kurang</option>
                  </select>
                </div>
              )}

              {kategori === "lansia" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 col-span-2 bg-orange-50 p-4 rounded">
                  <input placeholder="BB (kg)" value={lansiaBb} onChange={(e) => setLansiaBb(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="TB (cm)" value={lansiaTb} onChange={(e) => setLansiaTb(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="Lingkar Perut" value={lingkarPerut} onChange={(e) => setLingkarPerut(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="LILA" value={lilaLansia} onChange={(e) => setLilaLansia(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="Tekanan Darah" value={tekananDarah} onChange={(e) => setTekananDarah(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="IMT" value={imt} onChange={(e) => setImt(e.target.value)} className="border p-2 rounded col-span-2" />
                  <select value={statusImt} onChange={(e) => setStatusImt(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Status IMT</option>
                    <option>Kurang</option>
                    <option>Normal</option>
                    <option>Berisiko</option>
                  </select>
                  <select value={statusTekananDarah} onChange={(e) => setStatusTekananDarah(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Status Tekanan Darah</option>
                    <option>Normal</option>
                    <option>Risiko</option>
                  </select>
                </div>
              )}

              {kategori === "ibu_hamil" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 col-span-2 bg-pink-50 p-4 rounded">
                  <select value={usiaKehamilan} onChange={(e) => setUsiaKehamilan(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Usia Kehamilan</option>
                    {["<4_minggu","4-8_minggu","8-12_minggu","12-16_minggu","16-20_minggu","20-24_minggu","24-28_minggu","28-32_minggu","32-36_minggu","36-40_minggu"].map((v) => (
                      <option key={v} value={v}>{v.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                  <input placeholder="BB (kg)" value={bbBumil} onChange={(e) => setBbBumil(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="LILA (cm)" value={lilaBumil} onChange={(e) => setLilaBumil(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="Tekanan Darah (mmHg)" value={tdBumil} onChange={(e) => setTdBumil(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="IMT" value={imtBumil} onChange={(e) => setImtBumil(e.target.value)} className="border p-2 rounded" />
                  <select value={statusImtBumil} onChange={(e) => setStatusImtBumil(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Status IMT</option>
                    <option>Normal</option>
                    <option>Risiko (&lt;18.5)</option>
                    <option>Lebih (&gt;25)</option>
                  </select>
                  <select value={statusLilaBumil} onChange={(e) => setStatusLilaBumil(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Status LILA</option>
                    <option>Normal (&gt;23.5 cm)</option>
                    <option>KEK (&lt;23.5 cm)</option>
                  </select>
                  <select value={statusTdBumil} onChange={(e) => setStatusTdBumil(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Status Tekanan Darah</option>
                    <option>Normal (&lt;130/85)</option>
                    <option>Risiko (&ge;130/85)</option>
                  </select>
                </div>
              )}

             {(
  kategori === "ibu_nifas_menyusui" ||
  kategori === "ibu_nifas" ||
  kategori === "Ibu Nifas"
) && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 col-span-2 bg-pink-50 p-4 rounded">

    {/* Waktu Kunjungan */}
    <select
      value={waktuKunjungan}
      onChange={(e) => setWaktuKunjungan(e.target.value)}
      className="border p-2 rounded col-span-2"
    >
      <option value="">Waktu Kunjungan</option>

      <option value="<7_hari">&lt; 7 hari</option>
      <option value="7-28_hari">7 - 28 hari</option>
      <option value="28-42_hari">28 - 42 hari</option>

      {Array.from({ length: 24 }, (_, i) => i + 1).map((bulan) => (
        <option key={bulan} value={`bulan_${bulan}`}>
          Bulan {bulan}
        </option>
      ))}
    </select>

    {/* BB */}
    <input
      placeholder="BB (kg)"
      value={bbNifas}
      onChange={(e) => setBbNifas(e.target.value)}
      className="border p-2 rounded"
    />

    {/* Tekanan Darah */}
    <input
      placeholder="Tekanan Darah (mm/Hg)"
      value={tdNifas}
      onChange={(e) => setTdNifas(e.target.value)}
      className="border p-2 rounded"
    />

    {/* Ploting IMT */}
    <select
      value={imtBumil}
      onChange={(e) => setImtBumil(e.target.value)}
      className="border p-2 rounded col-span-2"
    >
      <option value="">Ploting IMT sesuai kurva Buku KIA</option>
      <option>Normal</option>
      <option>Kurang</option>
      <option>Lebih</option>
      <option>Obesitas</option>
    </select>

    {/* Status Tekanan Darah */}
    <select
      value={statusTdBumil}
      onChange={(e) => setStatusTdBumil(e.target.value)}
      className="border p-2 rounded col-span-2"
    >
      <option value="">
        Ploting tekanan darah sesuai kurva Buku KIA
      </option>
      <option>Normal (&lt;130/85)</option>
      <option>Risiko (≥130/85)</option>
    </select>

  </div>
)}

              {kategori === "remaja" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 col-span-2 bg-blue-50 p-4 rounded">
                  <input placeholder="BB (kg)" value={remajaBb} onChange={(e) => setRemajaBb(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="TB (cm)" value={remajaTb} onChange={(e) => setRemajaTb(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="Lingkar Perut (>15 th)" value={lingkarPerutRemaja} onChange={(e) => setLingkarPerutRemaja(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="Tekanan Darah (mmHg)" value={tdRemaja} onChange={(e) => setTdRemaja(e.target.value)} className="border p-2 rounded" />
                  <input placeholder="IMT" value={imtRemaja} onChange={(e) => setImtRemaja(e.target.value)} className="border p-2 rounded col-span-2" />
                  <select value={statusImtRemaja} onChange={(e) => setStatusImtRemaja(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Status IMT</option>
                    <option>Normal (18.5 – 24.9)</option>
                    <option>Risiko (&lt;18.5 / &gt;25)</option>
                  </select>
                  <select value={statusTdRemaja} onChange={(e) => setStatusTdRemaja(e.target.value)} className="border p-2 rounded col-span-2">
                    <option value="">Status Tekanan Darah</option>
                    <option>Normal (&lt;130/85)</option>
                    <option>Risiko (&ge;130/85)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={handleSimpan}
                disabled={!nama || !kategori}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2 rounded-lg disabled:opacity-50 font-medium hover:opacity-90 transition"
              >
                💾 Simpan Data
              </button>
              {nama && (
                <button
                  onClick={resetForm}
                  className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-300 text-sm transition"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── TABEL PEMERIKSAAN ─────────────────────────────────────────────── */}
        {(role === "kader" || (role === "bidan" && activePosId)) && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="font-semibold mb-4 text-violet-700">📊 Data Pemeriksaan</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-violet-100 text-slate-700 text-center">
                    <th className="py-2 rounded-l-lg">No</th>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    {canEdit && <th className="rounded-r-lg">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {dataPeserta.filter((p) => sudahDiperiksa(p.id)).map((p, i) => {
                    const latest = latestPerPeserta(p.id);
                    if (!latest) return null;
                    const totalKunjungan = data.filter((d) => d.pesertaId === p.id).length;
                    return (
                      <tr key={p.id} className="bg-white shadow rounded-lg text-center">
                        <td className="py-3">{i + 1}</td>
                        <td className="font-semibold text-slate-700">
                          <button onClick={() => router.push(`/detail?id=${p.id}`)}>
                            {(latest as any).peserta?.nama ?? p.nama}
                          </button>
                        </td>
                        <td>
                          <span className="bg-violet-200 text-violet-700 px-2 py-1 rounded-full text-xs capitalize">
                            {latest.kategori?.replace("_", " ") || "—"}
                          </span>
                        </td>
                        <td className="text-xs text-slate-500">
                          <div>{latest.tanggal || "—"}</div>
                          {totalKunjungan > 1 && (
                            <div className="text-indigo-500 font-medium">{totalKunjungan}× kunjungan</div>
                          )}
                        </td>
                        <td className="text-sm">
                          {latest.kategori === "balita" && latest.statusBbTb}
                          {latest.kategori === "lansia" && latest.statusImt}
                          {latest.kategori === "ibu_hamil" && latest.statusImtBumil}
                          {latest.kategori === "ibu_nifas_menyusui" && (latest.tdNifas ?? "—")}
                          {latest.kategori === "remaja" && latest.statusImtRemaja}
                        </td>
                        {canEdit && (
                          <td className="space-x-1">
                            <button
                              onClick={() => handleEdit(latest)}
                              className="bg-yellow-400 text-white px-3 py-1 rounded-lg text-xs hover:bg-yellow-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleHapus(latest.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600"
                            >
                              Hapus
                            </button>
                            <button
                              onClick={() => router.push(`/detail?id=${p.id}`)}
                              className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-emerald-600"
                            >
                              Detail
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {dataPeserta.filter((p) => sudahDiperiksa(p.id)).length === 0 && (
                    <tr>
                      <td colSpan={canEdit ? 6 : 5} className="text-center text-gray-400 py-6">
                        Belum ada data pemeriksaan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}