"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function getTanggalHariIni() {
  return new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

const KATEGORI_WARNA: Record<string, string> = {
  balita:             "bg-green-100 text-green-700",
  ibu_hamil:          "bg-pink-100 text-pink-700",
  ibu_nifas_menyusui: "bg-rose-100 text-rose-700",
  lansia:             "bg-orange-100 text-orange-700",
  remaja:             "bg-blue-100 text-blue-700",
};

const LABEL_POS: Record<string, string> = {
  "pos-a": "Pos Mawar",
  "pos-b": "Pos Melati",
};

export default function DashboardKader() {
  const router   = useRouter();
  const pathname = usePathname();

  const [posKader, setPosKader]               = useState("");
  const [totalHariIni, setTotalHariIni]       = useState(0);
  const [kehadiranHariIni, setKehadiranHariIni] = useState(0);
  const [perhatianList, setPerhatianList]     = useState<any[]>([]);
  const [grafik, setGrafik]                   = useState<Record<string, number>>({});
  const [showDetail, setShowDetail]           = useState(false);

useEffect(() => {
  const role = localStorage.getItem("role");
  if (role !== "kader") {
    router.push("/login");
    return;
  }

  const posId = localStorage.getItem("posId"); 
  if (!posId) return;

  setPosKader(posId);

  loadData(posId);
}, []);

async function loadData(posId: string) {
  const hariIni = getTanggalHariIni();

  // ──────────────── Ambil peserta by pos ───────────────
  const resPeserta = await fetch(`/api/peserta?posId=${posId}`);
  const peserta = await resPeserta.json();

  const pesertaHariIni = peserta.filter((p: any) => p.tanggal === hariIni);

  setTotalHariIni(pesertaHariIni.length);
  setKehadiranHariIni(pesertaHariIni.filter((p: any) => p.hadir === true).length);

  // Grafik hadir per bulan
  const grafikMap: Record<string, number> = {};
  peserta
    .filter((p: any) => p.hadir === true)
    .forEach((p: any) => {
      const key = p.bulan || p.tanggal?.split(" ").slice(1).join(" ") || "?";
      grafikMap[key] = (grafikMap[key] || 0) + 1;
    });

  setGrafik(grafikMap);

  // ──────────────── Ambil pemeriksaan by pos ───────────────
  const resPemeriksaan = await fetch(`/api/pemeriksaan?posId=${posId}`);
  const pemeriksaan = await resPemeriksaan.json();

  const butuh = pemeriksaan.filter((p: any) => perluPerhatian(p));
  setPerhatianList(butuh);
}

  const grafikData = Object.entries(grafik).map(([bulan, jumlah]) => ({
  bulan,
  jumlah,
}));

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-violet-600 via-purple-600 to-indigo-600 text-white p-5 flex flex-col justify-between shadow-xl">
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold">🌸 Posyandu ILP Desa Sumberurip</h2>
            <p className="text-sm text-white/70">
              Kader · {LABEL_POS[posKader] || posKader || "—"}
            </p>
          </div>
          <nav className="space-y-2">
            {[
              { href: "/dashboard-kader", label: "📊 Dashboard" },
              { href: "/pendaftaran",     label: "📝 Pendaftaran" },
              { href: "/pemeriksaan",     label: "🩺 Pemeriksaan" },
              { href: "/laporan",         label: "📄 Laporan" },
            ].map(({ href, label }) => (
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

      {/* MAIN */}
      <main className="flex-1 p-6">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
            📊 Dashboard Kader
          </h1>
          <p className="text-gray-500 text-sm">
            {getTanggalHariIni()}
            {posKader && (
              <span className="ml-2 bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                {LABEL_POS[posKader] || posKader}
              </span>
            )}
          </p>
        </div>

        {/* CARD RINGKASAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

          {/* Total Peserta */}
          <div className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow hover:shadow-xl hover:scale-105 transition border-l-4 border-violet-500">
            <h2 className="text-gray-500 text-sm">Total Peserta Hari Ini</h2>
            <p className="text-4xl font-bold text-violet-600 mt-2">{totalHariIni}</p>
            <p className="text-xs text-gray-400 mt-1">
              {LABEL_POS[posKader] || "pos kader"} · hari ini
            </p>
          </div>

          {/* Kehadiran */}
          <div className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow hover:shadow-xl hover:scale-105 transition border-l-4 border-indigo-500">
            <h2 className="text-gray-500 text-sm">Hadir Hari Ini</h2>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{kehadiranHariIni}</p>
            <p className="text-xs text-gray-400 mt-1">
              {totalHariIni > 0
                ? `${Math.round((kehadiranHariIni / totalHariIni) * 100)}% dari total terdaftar`
                : "belum ada peserta terdaftar hari ini"}
            </p>
          </div>

          {/* Perlu Perhatian */}
          <div
            onClick={() => perhatianList.length > 0 && setShowDetail(true)}
            className={`bg-white/80 backdrop-blur p-5 rounded-2xl shadow hover:shadow-xl hover:scale-105 transition border-l-4 border-pink-500 ${
              perhatianList.length > 0 ? "cursor-pointer" : ""
            }`}
          >
            <h2 className="text-gray-500 text-sm">Perlu Perhatian</h2>
            <p className="text-4xl font-bold text-pink-600 mt-2">{perhatianList.length}</p>
            <p className="text-xs text-pink-400 mt-1">
              {perhatianList.length > 0
                ? "Klik untuk lihat detail →"
                : "Semua hasil pemeriksaan normal"}
            </p>
          </div>

        </div>

        {/* MODAL PERLU PERHATIAN */}
        {showDetail && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center p-5 border-b">
                <h3 className="text-lg font-bold text-pink-600">
                  ⚠️ Peserta Perlu Perhatian ({perhatianList.length})
                </h3>
                <button onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
              <div className="p-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-pink-50 text-left">
                      <th className="py-2 px-2">Nama</th>
                      <th className="px-2">Kategori</th>
                      <th className="px-2">Masalah</th>
                      <th className="px-2">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perhatianList.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-2 px-2 font-semibold text-slate-700">{item.nama}</td>
                        <td className="px-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${KATEGORI_WARNA[item.kategori] ?? "bg-gray-100 text-gray-600"}`}>
                            {item.kategori?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-2 text-pink-700 font-medium">{labelStatus(item)}</td>
                        <td className="px-2 text-gray-400 text-xs">{item.tanggal || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* GRAFIK */}
        <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg border border-violet-100 hover:shadow-xl transition mb-6">
          <h2 className="text-lg font-semibold mb-1 text-violet-600">
            📈 Grafik Kehadiran Per Bulan
          </h2>

          <p className="text-xs text-gray-400 mb-4">
            Data kehadiran khusus {LABEL_POS[posKader] || "pos kader"}
          </p>

          {grafikData.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
              <span className="text-5xl">📊</span>
              <p>Belum ada data kehadiran</p>
            </div>
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={grafikData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="bulan"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="jumlah"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* TABEL PESERTA HARI INI */}
        <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg border border-indigo-100">
          <h2 className="text-lg font-semibold mb-4 text-indigo-600">
            🗓 Peserta Terdaftar Hari Ini
          </h2>
          <PesertaHariIni tanggal={getTanggalHariIni()} pos={posKader} />
        </div>

      </main>
    </div>
  );
}

// ── Sub-komponen tabel peserta hari ini (filter by pos) ──
function PesertaHariIni({ tanggal, pos }: { tanggal: string; pos: string }) {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    const peserta: any[] = JSON.parse(localStorage.getItem("peserta") || "[]");
    setList(
      peserta.filter((p) => p.tanggal === tanggal && p.pos === pos)
    );
  }, [tanggal, pos]);

  if (list.length === 0)
    return (
      <p className="text-gray-400 text-sm text-center py-4">
        Belum ada peserta terdaftar hari ini di pos ini.
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-center">
        <thead>
          <tr className="bg-indigo-50 text-slate-700">
            <th className="py-2 px-2">No</th>
            <th className="px-2">Nama</th>
            <th className="px-2">Kategori</th>
            <th className="px-2">Hadir</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p, i) => (
            <tr key={p.id ?? i} className="border-t">
              <td className="py-1.5 px-2">{i + 1}</td>
              <td className="px-2 font-semibold text-slate-700">{p.nama}</td>
              <td className="px-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${KATEGORI_WARNA[p.kategori] ?? "bg-gray-100 text-gray-600"}`}>
                  {p.kategori?.replace(/_/g, " ") || "-"}
                </span>
              </td>
              <td className="px-2">
                {p.hadir
                  ? <span className="text-green-600 font-semibold">✅ Hadir</span>
                  : <span className="text-gray-400">— Belum</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}