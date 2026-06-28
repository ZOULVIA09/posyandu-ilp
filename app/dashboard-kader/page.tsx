"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const NAMA_BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const LABEL_POS: Record<string, string> = {
  "pos-a": "Pos Mawar",
  "pos-b": "Pos Melati",
};

const KATEGORI_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  balita:             { bg: "bg-sky-50",    text: "text-sky-700",    dot: "#0ea5e9" },
  ibu_hamil:          { bg: "bg-pink-50",   text: "text-pink-700",   dot: "#ec4899" },
  ibu_nifas_menyusui: { bg: "bg-rose-50",   text: "text-rose-700",   dot: "#f43f5e" },
  ibu_nifas:          { bg: "bg-rose-50",   text: "text-rose-700",   dot: "#f43f5e" },
  lansia:             { bg: "bg-amber-50",  text: "text-amber-700",  dot: "#f59e0b" },
  remaja:             { bg: "bg-violet-50", text: "text-violet-700", dot: "#8b5cf6" },
};

// ✅ Fix: getBulanKey bisa baca format "Senin, 28 Juni 2026"
function getBulanKey(tanggal: string) {
  if (!tanggal) return null;
  if (tanggal.match(/^\d{4}-\d{2}/)) {
    const [y, m] = tanggal.split("-");
    return `${y}-${m.padStart(2, "0")}`;
  }
  const cleaned = tanggal.replace(/^[^,]+,\s*/, "").trim();
  const parts = cleaned.split(" ");
  if (parts.length === 3) {
    const bulanIdx = NAMA_BULAN.findIndex(
      (b) => b.toLowerCase() === parts[1].toLowerCase()
    );
    if (bulanIdx !== -1)
      return `${parts[2]}-${String(bulanIdx + 1).padStart(2, "0")}`;
  }
  return null;
}

// ✅ Fix: helper cek tanggal hari ini, support semua format
function isTanggalHariIni(tanggal: string): boolean {
  const tanggalIso = new Date().toISOString().slice(0, 10);
  if (!tanggal) return false;
  if (tanggal.startsWith(tanggalIso)) return true;
  const cleaned = tanggal.replace(/^[^,]+,\s*/, "").trim();
  const parts = cleaned.split(" ");
  if (parts.length === 3) {
    const bulanIdx = NAMA_BULAN.findIndex(
      (b) => b.toLowerCase() === parts[1].toLowerCase()
    );
    if (bulanIdx !== -1) {
      const iso = `${parts[2]}-${String(bulanIdx + 1).padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      return iso === tanggalIso;
    }
  }
  return false;
}

function formatBulanLabel(key: string) {
  const [y, m] = key.split("-");
  return `${NAMA_BULAN[parseInt(m) - 1]?.slice(0, 3)} '${y.slice(2)}`;
}

// ✅ Fix: helper untuk cek apakah suatu record (peserta/pemeriksaan) milik pos tertentu.
// Field yang benar (dikonfirmasi dari data asli) adalah `posId` (angka) di kedua tabel.
// localStorage menyimpan posId sebagai string, sedangkan di data posId berupa number,
// jadi dibandingkan via String(...) supaya "6" === 6 tetap cocok.
function milikPos(item: any, posId: string): boolean {
  if (!item) return false;
  const nilaiPos = item.posId ?? item.pos_id ?? item.pos ?? null;
  if (nilaiPos === null) return false;
  return String(nilaiPos) === String(posId);
}

function perluPerhatian(item: any): boolean {
  const k = item.kategori;
  if (k === "balita") {
    const buruk = ["Gizi Buruk", "Gizi Kurang", "Berisiko", "Gizi Lebih", "Obesitas"];
    if (buruk.includes(item.statusBbTb)) return true;
    if (item.statusBbU === "BB tidak naik" || item.statusBbU === "BB naik tidak akurat") return true;
    if (item.statusTbU === "Pendek") return true;
    if (item.statusLingkar === "Melebihi Normal" || item.statusLingkar === "Kurang") return true;
  }
  if (k === "lansia") {
    if (item.statusImt === "Kurang" || item.statusImt === "Berisiko") return true;
    if (item.statusTekananDarah === "Risiko") return true;
  }
  if (k === "ibu_hamil") {
    if (item.statusImtBumil && item.statusImtBumil !== "Normal") return true;
    if (item.statusLilaBumil?.includes("KEK")) return true;
    if (item.statusTdBumil?.includes("Risiko")) return true;
  }
  if (k === "remaja") {
    if (item.statusImtRemaja?.includes("Risiko")) return true;
    if (item.statusTdRemaja?.includes("Risiko")) return true;
  }
  return false;
}

function labelStatus(item: any): string {
  const k = item.kategori;
  const parts: string[] = [];
  if (k === "balita") {
    if (item.statusBbTb && item.statusBbTb !== "Gizi Baik") parts.push(item.statusBbTb);
    if (item.statusBbU === "BB tidak naik") parts.push("BB tidak naik");
    if (item.statusTbU === "Pendek") parts.push("Pendek");
  }
  if (k === "lansia") {
    if (item.statusImt && item.statusImt !== "Normal") parts.push("IMT " + item.statusImt);
    if (item.statusTekananDarah === "Risiko") parts.push("TD Risiko");
  }
  if (k === "ibu_hamil") {
    if (item.statusLilaBumil?.includes("KEK")) parts.push("KEK");
    if (item.statusTdBumil?.includes("Risiko")) parts.push("TD Risiko");
    if (item.statusImtBumil && item.statusImtBumil !== "Normal") parts.push("IMT " + item.statusImtBumil);
  }
  if (k === "remaja") {
    if (item.statusImtRemaja?.includes("Risiko")) parts.push("IMT Risiko");
    if (item.statusTdRemaja?.includes("Risiko")) parts.push("TD Risiko");
  }
  return parts.join(", ") || "-";
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-violet-950 text-white px-3 py-2 rounded-xl text-xs shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function DashboardKader() {
  const router   = useRouter();
  const pathname = usePathname();

  const [posKader, setPosKader]     = useState("");
  const [allPeserta, setAllPeserta] = useState<any[]>([]);
  const [allPeriksa, setAllPeriksa] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [bulanAktif, setBulanAktif] = useState("");

  const hariIni = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const tanggalLabel = useMemo(() =>
    new Date().toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }), []);

  const tanggalHariIni = useMemo(() =>
    new Date().toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    }), []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "kader") { router.push("/login"); return; }
    const posId = localStorage.getItem("posId");
    if (!posId) return;
    setPosKader(posId);
    loadData(posId);
  }, []);

  async function loadData(posId: string) {
    try {
      const [resPeserta, resPeriksa] = await Promise.all([
        fetch(`/api/peserta?posId=${posId}`),
        fetch(`/api/pemeriksaan?posId=${posId}`),
      ]);
      const peserta = await resPeserta.json();
      const periksa = await resPeriksa.json();

      // ✅ Fix: filter ulang di client berdasarkan posId, sebagai pengaman tambahan
      // supaya data antar pos tidak pernah tercampur di dashboard ini, walau
      // endpoint sudah dipanggil dengan ?posId=...
      if (Array.isArray(peserta)) {
        setAllPeserta(peserta.filter((p) => milikPos(p, posId)));
      }
      if (Array.isArray(periksa)) {
        setAllPeriksa(periksa.filter((p) => milikPos(p, posId)));
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Statistik ─────────────────────────────────────────────
  const stats = useMemo(() => {
    // ✅ Fix: tabel peserta tidak punya field `tanggal`, yang ada `createdAt` (ISO).
    // Format ISO ini tetap kompatibel dengan isTanggalHariIni()/getBulanKey().
    const pesertaHariIni = allPeserta.filter((p) => isTanggalHariIni(p.createdAt));
    const totalHariIni   = pesertaHariIni.length;
    const hadirHariIni   = pesertaHariIni.filter((p) => p.hadir === true).length;

    const bulanIniList   = allPeserta.filter((p) => getBulanKey(p.createdAt) === hariIni);
    const perhatianAll   = allPeriksa.filter(perluPerhatian);
    const perhatianBulan = allPeriksa.filter(
      (p) => perluPerhatian(p) && getBulanKey(p.tanggal) === hariIni
    );

    return {
      totalHariIni,
      hadirHariIni,
      bulanIni: bulanIniList.length,
      perhatianAll,
      perhatianBulan,
      totalSemua: allPeserta.length,
    };
  }, [allPeserta, allPeriksa, hariIni]);

  // ── Grafik kehadiran per bulan ──
  const grafikData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const delta = i - 6;
      const d   = new Date(now.getFullYear(), now.getMonth() + delta, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        key,
        bulan:    formatBulanLabel(key),
        jumlah:   allPeserta.filter(
          (p) => p.hadir === true && getBulanKey(p.createdAt) === key
        ).length,
        isNow:    key === hariIni,
        isFuture: delta > 0,
      };
    });
  }, [allPeserta, hariIni]);

  // ── Distribusi kategori ──
  // ✅ Fix: sekarang diambil dari data PEMERIKSAAN (allPeriksa), bukan dari data
  // pendaftaran (allPeserta). Ini supaya angkanya mencerminkan hasil periksa
  // per kategori di pos ini, dan karena allPeriksa sudah difilter per-pos di
  // loadData(), distribusinya pasti hanya untuk pos kader yang login.
  const kategoriData = useMemo(() => {
    const perKategoriPeriksa: Record<string, number> = {};
    allPeriksa.forEach((p) => {
      const k = p.kategori ?? "lain";
      perKategoriPeriksa[k] = (perKategoriPeriksa[k] ?? 0) + 1;
    });
    return Object.entries(perKategoriPeriksa)
      .map(([k, v]) => ({ label: k.replace(/_/g, " "), value: v, key: k }))
      .sort((a, b) => b.value - a.value);
  }, [allPeriksa]);

  const totalPeriksaSemua = allPeriksa.length;

  // ── Modal list ──
  const modalList = useMemo(() => {
    if (!bulanAktif) return stats.perhatianAll;
    return stats.perhatianAll.filter(
      (p) => getBulanKey(p.tanggal) === bulanAktif
    );
  }, [stats.perhatianAll, bulanAktif]);

  const navItems = [
    { href: "/dashboard-kader", label: "📊 Dashboard" },
    { href: "/pendaftaran",     label: "📝 Pendaftaran" },
    { href: "/pemeriksaan",     label: "🩺 Pemeriksaan" },
    { href: "/laporan",         label: "📄 Laporan" },
  ];

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-violet-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">

      {/* ══ SIDEBAR ══ */}
      <aside className="w-64 bg-gradient-to-b from-violet-600 via-purple-600 to-indigo-600 text-white p-5 flex flex-col justify-between shadow-xl">
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold">🌸 Posyandu ILP Desa Sumberurip</h2>
            <p className="text-sm text-white/70">
              Kader · {LABEL_POS[posKader] || posKader || "—"}
            </p>
          </div>
          <nav className="space-y-2">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-2 p-2 rounded-lg transition ${
                  pathname === href ? "bg-white/20 backdrop-blur shadow" : "hover:bg-white/10"
                }`}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={() => { localStorage.removeItem("role"); window.location.href = "/login"; }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg hover:scale-105 transition shadow">
          🚪 Logout
        </button>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="flex-1 overflow-auto p-7 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">
              {tanggalLabel}
            </p>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
              📊 Dashboard Kader
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Data khusus {LABEL_POS[posKader] || posKader || "pos kader"}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur border border-violet-100 rounded-2xl px-4 py-2 text-right shadow-sm">
            <p className="text-xs text-slate-400 font-medium">Total semua peserta</p>
            <p className="text-2xl font-bold text-violet-600">{stats.totalSemua}</p>
            <p className="text-[10px] text-slate-400">di {LABEL_POS[posKader] || posKader}</p>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label:  "Hadir Hari Ini",
              value:  stats.hadirHariIni,
              sub:    stats.totalHariIni > 0
                        ? `${Math.round((stats.hadirHariIni / stats.totalHariIni) * 100)}% dari ${stats.totalHariIni} terdaftar`
                        : "belum ada peserta terdaftar",
              accent: "border-violet-500",
              color:  "text-violet-600",
              bg:     "bg-violet-50",
              icon:   "✅",
            },
            {
              label:  "Peserta Bulan Ini",
              value:  stats.bulanIni,
              sub:    "peserta terdaftar",
              accent: "border-indigo-400",
              color:  "text-indigo-600",
              bg:     "bg-indigo-50",
              icon:   "🗓",
            },
            {
              label:   "Perlu Perhatian",
              value:   stats.perhatianAll.length,
              sub:     "dari semua data pemeriksaan",
              accent:  "border-amber-400",
              color:   "text-amber-600",
              bg:      "bg-amber-50",
              icon:    "⚠️",
              onClick: () => { setBulanAktif(""); setShowModal(true); },
            },
            {
              label:   "Risiko Bulan Ini",
              value:   stats.perhatianBulan.length,
              sub:     "perlu tindak lanjut",
              accent:  "border-pink-400",
              color:   "text-pink-600",
              bg:      "bg-pink-50",
              icon:    "🚨",
              onClick: () => { setBulanAktif(hariIni); setShowModal(true); },
            },
          ].map((s) => (
            <div
              key={s.label}
              onClick={(s as any).onClick}
              className={`bg-white/80 backdrop-blur border-l-4 ${s.accent} rounded-2xl p-4 shadow hover:shadow-xl hover:scale-105 transition-all ${
                (s as any).onClick ? "cursor-pointer" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                <span className={`${s.bg} rounded-lg w-8 h-8 flex items-center justify-center text-base`}>
                  {s.icon}
                </span>
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
              {(s as any).onClick && (
                <p className="text-[10px] text-gray-300 mt-1">Klik untuk detail →</p>
              )}
            </div>
          ))}
        </div>

        {/* ── Grafik + Distribusi ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Area Chart */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-violet-100 p-5 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-violet-600">📈 Tren Kehadiran Per Bulan</h2>
                <p className="text-xs text-gray-400">
                  6 bulan lalu · sekarang · 5 bulan mendatang —{" "}
                  {LABEL_POS[posKader] || posKader}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-3 h-0.5 bg-violet-500 inline-block rounded" />
                peserta hadir
              </div>
            </div>

            {grafikData.every((d) => d.jumlah === 0) ? (
              <div className="h-52 flex flex-col items-center justify-center text-gray-300 gap-2">
                <span className="text-4xl">📊</span>
                <p className="text-sm">Belum ada data kehadiran</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={grafikData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="jumlah"
                    name="Hadir"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    fill="url(#violetGrad)"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (payload.isNow)    return <circle key={cx} cx={cx} cy={cy} r={6} fill="#7c3aed" stroke="#fff" strokeWidth={2} />;
                      if (payload.isFuture) return <circle key={cx} cx={cx} cy={cy} r={3} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} />;
                      return <circle key={cx} cx={cx} cy={cy} r={4} fill="#7c3aed" />;
                    }}
                    activeDot={{ r: 7, fill: "#5b21b6" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-violet-500 inline-block" />
                Sudah hadir
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-violet-500 ring-2 ring-white inline-block" />
                Bulan ini
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" />
                Mendatang (proyeksi)
              </span>
            </div>
          </div>

          {/* Distribusi Kategori */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-violet-100 p-5 hover:shadow-xl transition">
            <h2 className="text-lg font-semibold text-violet-600 mb-1">🧩 Distribusi Kategori</h2>
            <p className="text-xs text-gray-400 mb-4">
              Berdasarkan data pemeriksaan di {LABEL_POS[posKader] || posKader}
            </p>

            {kategoriData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-300 text-sm">
                Belum ada data
              </div>
            ) : (
              <div className="space-y-3">
                {kategoriData.map((k) => {
                  const c = KATEGORI_COLOR[k.key] ?? { bg: "bg-slate-50", text: "text-slate-600", dot: "#94a3b8" };
                  const pct = totalPeriksaSemua > 0
                    ? Math.round((k.value / totalPeriksaSemua) * 100)
                    : 0;
                  return (
                    <div key={k.key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-semibold capitalize ${c.text}`}>{k.label}</span>
                        <span className="text-xs text-gray-400">{k.value} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: c.dot }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Tabel Peserta Hari Ini ── */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-indigo-100 overflow-hidden hover:shadow-xl transition">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-indigo-600">🗓 Peserta Terdaftar Hari Ini</h2>
              <p className="text-xs text-gray-400">{tanggalHariIni}</p>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
              {stats.totalHariIni} peserta
            </span>
          </div>

          {/* ✅ Fix: allPeserta sudah difilter per-pos di loadData(); pakai createdAt karena
              tabel peserta tidak punya field tanggal harian */}
          <PesertaHariIni
            list={allPeserta.filter((p) => isTanggalHariIni(p.createdAt))}
          />
        </div>

      </main>

      {/* ══ Modal Perlu Perhatian ══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-pink-600 text-lg">⚠️ Peserta Perlu Perhatian</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {bulanAktif
                    ? `Bulan ${NAMA_BULAN[parseInt(bulanAktif.split("-")[1]) - 1]} ${bulanAktif.split("-")[0]}`
                    : "Semua periode"
                  } · {modalList.length} peserta
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 text-xl transition">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {modalList.length === 0 ? (
                <p className="text-center text-gray-400 py-12">
                  Tidak ada peserta berisiko pada periode ini
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-pink-50 text-left">
                      <th className="py-2 px-2 text-xs text-slate-500 font-semibold uppercase">Nama</th>
                      <th className="px-3 text-xs text-slate-500 font-semibold uppercase">Kategori</th>
                      <th className="px-3 text-xs text-slate-500 font-semibold uppercase">Masalah</th>
                      <th className="px-3 text-xs text-slate-500 font-semibold uppercase">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {modalList.map((item, i) => {
                      const c = KATEGORI_COLOR[item.kategori] ?? { bg: "bg-slate-50", text: "text-slate-600" };
                      return (
                        <tr key={i} className="hover:bg-pink-50/30 transition">
                          <td className="py-2.5 px-2 font-semibold text-slate-700">{item.nama}</td>
                          <td className="px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${c.bg} ${c.text}`}>
                              {(item.kategori ?? "-").replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-3 text-pink-700 font-medium text-xs">{labelStatus(item)}</td>
                          <td className="px-3 text-xs text-slate-400">{item.tanggal || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center">
              <Link href="/laporan" className="text-xs text-violet-600 font-semibold hover:underline">
                Lihat detail lengkap di Laporan →
              </Link>
              <button onClick={() => setShowModal(false)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-komponen tabel peserta hari ini ──
function PesertaHariIni({ list }: { list: any[] }) {
  if (list.length === 0)
    return (
      <p className="text-gray-400 text-sm text-center py-10">
        Belum ada peserta terdaftar hari ini di pos ini.
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-indigo-50 text-xs text-slate-500 font-semibold uppercase tracking-wide">
            <th className="px-5 py-3 text-left">No</th>
            <th className="px-5 py-3 text-left">Nama</th>
            <th className="px-5 py-3 text-left">Kategori</th>
            <th className="px-5 py-3 text-center">Hadir</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {list.map((p, i) => {
            const c = KATEGORI_COLOR[p.kategori] ?? { bg: "bg-slate-50", text: "text-slate-600" };
            return (
              <tr key={p.id ?? i} className="hover:bg-violet-50/40 transition">
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">{i + 1}</td>
                <td className="px-5 py-3 font-semibold text-slate-700">{p.nama}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${c.bg} ${c.text}`}>
                    {p.kategori?.replace(/_/g, " ") || "-"}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  {p.hadir
                    ? <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">✓ Hadir</span>
                    : <span className="bg-slate-50 text-slate-400 text-xs font-semibold px-2 py-0.5 rounded-full">— Belum</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
