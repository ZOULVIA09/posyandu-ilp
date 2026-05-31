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

function getBulanKey(tanggal: string) {
  if (!tanggal) return null;
  if (tanggal.includes("-") && tanggal.length >= 7) {
    const [y, m] = tanggal.split("-");
    return `${y}-${m.padStart(2, "0")}`;
  }
  const parts = tanggal.split(" ");
  if (parts.length === 3) {
    const bulanIdx = NAMA_BULAN.findIndex(
      (b) => b.toLowerCase() === parts[1].toLowerCase()
    );
    if (bulanIdx !== -1)
      return `${parts[2]}-${String(bulanIdx + 1).padStart(2, "0")}`;
  }
  return null;
}

function formatBulanLabel(key: string) {
  const [y, m] = key.split("-");
  return `${NAMA_BULAN[parseInt(m) - 1]?.slice(0, 3)} '${y.slice(2)}`;
}

function isResiko(item: any) {
  const teks = ((item.hasilAi ?? "") + " " + (item.ringkasan ?? "")).toLowerCase();
  return teks.includes("resiko") || teks.includes("risiko") || teks.includes("berisiko");
}

const KATEGORI_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  balita:             { bg: "bg-sky-50",    text: "text-sky-700",    dot: "#0ea5e9" },
  ibu_hamil:          { bg: "bg-pink-50",   text: "text-pink-700",   dot: "#ec4899" },
  ibu_nifas_menyusui: { bg: "bg-rose-50",   text: "text-rose-700",   dot: "#f43f5e" },
  ibu_nifas:          { bg: "bg-rose-50",   text: "text-rose-700",   dot: "#f43f5e" },
  lansia:             { bg: "bg-amber-50",  text: "text-amber-700",  dot: "#f59e0b" },
  remaja:             { bg: "bg-violet-50", text: "text-violet-700", dot: "#8b5cf6" },
};

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

export default function DashboardPage() {
  const pathname = usePathname();
  const router   = useRouter();

  const [role, setRole]             = useState<string | null>(null);
  const [allData, setAllData]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [bulanAktif, setBulanAktif] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) { router.push("/login"); return; }
        const user = await meRes.json();
        setRole(user.role.toLowerCase());

        const pelRes  = await fetch("/api/pelayanan");
        const pelData = await pelRes.json();

        if (Array.isArray(pelData)) {
          setAllData(pelData.map((item: any) => ({
            id:        item.id,
            nama:      item.peserta?.nama    ?? "-",
            nik:       item.peserta?.nik     ?? "-",
            alamat:    item.peserta?.alamat  ?? "-",
            kategori:  item.kategori,
            tanggal:   item.tanggal,
            pos:       item.peserta?.posyandu?.nama ?? "-",
            kondisi:   isResiko(item) ? "resiko" : "normal",
            hasilAi:   item.hasilAi  ?? "",
            ringkasan: item.ringkasan ?? "",
          })));
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const hariIni = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const tanggalLabel = useMemo(() =>
    new Date().toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }), []);

  const stats = useMemo(() => {
    const total  = allData.length;
    const resiko = allData.filter((d) => d.kondisi === "resiko").length;
    const perKategori: Record<string, number> = {};
    allData.forEach((d) => {
      const k = d.kategori ?? "lain";
      perKategori[k] = (perKategori[k] ?? 0) + 1;
    });
    const bulanIniList = allData.filter((d) => getBulanKey(d.tanggal) === hariIni);
    return {
      total, resiko, perKategori,
      bulanIni: bulanIniList.length,
      risikoHariIni: bulanIniList.filter((d) => d.kondisi === "resiko").length,
    };
  }, [allData, hariIni]);

  const grafikData = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let delta = -6; delta <= 5; delta++) {
      const d   = new Date(now.getFullYear(), now.getMonth() + delta, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      result.push({
        key,
        bulan:    formatBulanLabel(key),
        jumlah:   allData.filter((item) => getBulanKey(item.tanggal) === key).length,
        isNow:    key === hariIni,
        isFuture: delta > 0,
      });
    }
    return result;
  }, [allData, hariIni]);

  const perhatianList = useMemo(() => allData.filter((d) => d.kondisi === "resiko"), [allData]);

  const modalList = useMemo(() => {
    if (!bulanAktif) return perhatianList;
    return allData.filter((d) => d.kondisi === "resiko" && getBulanKey(d.tanggal) === bulanAktif);
  }, [perhatianList, allData, bulanAktif]);

  const kategoriData = useMemo(() =>
    Object.entries(stats.perKategori)
      .map(([k, v]) => ({ label: k.replace(/_/g, " "), value: v, key: k }))
      .sort((a, b) => b.value - a.value),
  [stats.perKategori]);

  const navItems = [
    { href: "/dashboard-bidan",   icon: "📊", label: "Dashboard" },
    { href: "/pendaftaran", icon: "📝", label: "Pendaftaran" },
    { href: "/pemeriksaan", icon: "🩺", label: "Pemeriksaan" },
    { href: "/pelayanan",   icon: "💊", label: "Pelayanan" },
    { href: "/laporan",     icon: "📄", label: "Laporan" },
  ];

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      <div className="flex gap-2">
        {[0,1,2].map(i => (
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
            <h2 className="text-2xl font-bold">Posyandu ILP Desa Sumberurip</h2>
            <p className="text-sm text-white/70">Bidan</p>
          </div>
          <nav className="space-y-2">
            {navItems.map(({ href, icon, label }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-2 p-2 rounded-lg transition ${
                  pathname === href
                    ? "bg-white/20 backdrop-blur shadow"
                    : "hover:bg-white/10"
                }`}
              >
                {icon} {label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={() => { localStorage.removeItem("role"); window.location.href = "/login"; }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg hover:scale-105 transition shadow"
        >
          Logout
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
              📊 Dashboard Bidan
            </h1>
            <p className="text-gray-500 text-sm mt-1">Data diambil langsung dari pelayanan</p>
          </div>
          <div className="bg-white/80 backdrop-blur border border-violet-100 rounded-2xl px-4 py-2 text-right shadow-sm">
            <p className="text-xs text-slate-400 font-medium">Total keseluruhan</p>
            <p className="text-2xl font-bold text-violet-600">{stats.total}</p>
            <p className="text-[10px] text-slate-400">peserta tercatat</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Bulan Ini",
              value: stats.bulanIni,
              sub: "peserta terlayani",
              accent: "border-violet-500",
              color: "text-violet-600",
              bg: "bg-violet-50",
              icon: "🗓",
            },
            {
              label: "Perlu Perhatian",
              value: stats.resiko,
              sub: "dari semua data",
              accent: "border-amber-400",
              color: "text-amber-600",
              bg: "bg-amber-50",
              icon: "⚠️",
              onClick: () => { setBulanAktif(""); setShowModal(true); },
            },
            {
              label: "Risiko Bulan Ini",
              value: stats.risikoHariIni,
              sub: "perlu tindak lanjut",
              accent: "border-pink-400",
              color: "text-pink-600",
              bg: "bg-pink-50",
              icon: "🚨",
              onClick: () => { setBulanAktif(hariIni); setShowModal(true); },
            },
            {
              label: "Kategori Aktif",
              value: Object.keys(stats.perKategori).length,
              sub: "jenis peserta",
              accent: "border-indigo-400",
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              icon: "🧩",
            },
          ].map((s) => (
            <div
              key={s.label}
              onClick={s.onClick}
              className={`bg-white/80 backdrop-blur border-l-4 ${s.accent} rounded-2xl p-4 shadow hover:shadow-xl hover:scale-105 transition-all
                ${s.onClick ? "cursor-pointer" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                <span className={`${s.bg} rounded-lg w-8 h-8 flex items-center justify-center text-base`}>
                  {s.icon}
                </span>
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
              {s.onClick && <p className="text-[10px] text-gray-300 mt-1">Klik untuk detail →</p>}
            </div>
          ))}
        </div>

        {/* Grafik + Distribusi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Area Chart */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-violet-100 p-5 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-violet-600">📈 Tren Kehadiran Per Bulan</h2>
                <p className="text-xs text-gray-400">6 bulan lalu · sekarang · 5 bulan mendatang</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-3 h-0.5 bg-violet-500 inline-block rounded" />
                peserta
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
                    name="Peserta"
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
                Sudah terlayani
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
            <p className="text-xs text-gray-400 mb-4">Total semua data pelayanan</p>

            {kategoriData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-300 text-sm">
                Belum ada data
              </div>
            ) : (
              <div className="space-y-3">
                {kategoriData.map((k) => {
                  const c = KATEGORI_COLOR[k.key] ?? { bg: "bg-slate-50", text: "text-slate-600", dot: "#94a3b8" };
                  const pct = stats.total > 0 ? Math.round((k.value / stats.total) * 100) : 0;
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

        {/* Tabel Peserta Bulan Ini */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-indigo-100 overflow-hidden hover:shadow-xl transition">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-indigo-600">🗓 Peserta Bulan Ini</h2>
              <p className="text-xs text-gray-400">
                {NAMA_BULAN[new Date().getMonth()]} {new Date().getFullYear()}
              </p>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
              {stats.bulanIni} peserta
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50 text-xs text-slate-500 font-semibold uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">No</th>
                  <th className="px-5 py-3 text-left">Nama</th>
                  <th className="px-5 py-3 text-left">Kategori</th>
                  <th className="px-5 py-3 text-left">Pos</th>
                  <th className="px-5 py-3 text-left">Tanggal</th>
                  <th className="px-5 py-3 text-center">Kondisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allData
                  .filter((d) => getBulanKey(d.tanggal) === hariIni)
                  .slice(0, 10)
                  .map((item, i) => {
                    const c = KATEGORI_COLOR[item.kategori] ?? { bg: "bg-slate-50", text: "text-slate-600" };
                    return (
                      <tr key={item.id} className="hover:bg-violet-50/40 transition">
                        <td className="px-5 py-3 text-xs text-slate-400 font-mono">{i + 1}</td>
                        <td className="px-5 py-3 font-semibold text-slate-700">{item.nama}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${c.bg} ${c.text}`}>
                            {(item.kategori ?? "-").replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">{item.pos}</td>
                        <td className="px-5 py-3 text-xs text-slate-400">{item.tanggal}</td>
                        <td className="px-5 py-3 text-center">
                          {item.kondisi === "resiko" ? (
                            <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                              ⚠ Risiko
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                              ✓ Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {stats.bulanIni === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-300 text-sm">
                      Belum ada peserta bulan ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {stats.bulanIni > 10 && (
              <div className="px-5 py-3 text-xs text-gray-400 border-t border-slate-50 text-center">
                Menampilkan 10 dari {stats.bulanIni} peserta ·{" "}
                <Link href="/laporan" className="text-violet-600 font-semibold hover:underline">
                  Lihat semua di Laporan →
                </Link>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Modal Perlu Perhatian */}
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
                      <th className="px-3 text-xs text-slate-500 font-semibold uppercase">Pos</th>
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
                          <td className="px-3 text-xs text-slate-500">{item.pos}</td>
                          <td className="px-3 text-xs text-slate-400">{item.tanggal}</td>
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
