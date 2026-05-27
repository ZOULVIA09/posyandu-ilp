"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../components/sidebar";

type PemeriksaanRecord = {
  id: number;
  tanggal?: string;
  nama: string;
  nik?: string;
  alamat?: string;
  kategori: string;
  pos?: string;

  // balita
  bb?: string; tb?: string; lingkarKepala?: string; lila?: string;
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

const KATEGORI_LABEL: Record<string, string> = {
  balita: "🍼 Balita",
  lansia: "👴 Lansia",
  ibu_hamil: "🤰 Ibu Hamil",
  ibu_nifas_menyusui: "🤱 Ibu Nifas & Menyusui",
  remaja: "🧑 Remaja",
};

const STATUS_COLOR: Record<string, string> = {
  "Gizi Baik": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "Normal": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "BB normal": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "Gizi Kurang": "bg-amber-100 text-amber-700 border-amber-300",
  "Berisiko": "bg-amber-100 text-amber-700 border-amber-300",
  "Risiko": "bg-amber-100 text-amber-700 border-amber-300",
  "Gizi Buruk": "bg-red-100 text-red-700 border-red-300",
  "Obesitas": "bg-red-100 text-red-700 border-red-300",
  "Gizi Lebih": "bg-orange-100 text-orange-700 border-orange-300",
  "KEK (<23.5 cm)": "bg-red-100 text-red-700 border-red-300",
};

function getStatusColor(status: string) {
  for (const key of Object.keys(STATUS_COLOR)) {
    if (status?.includes(key)) return STATUS_COLOR[key];
  }
  return "bg-slate-100 text-slate-600 border-slate-300";
}

function StatusBadge({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <span className={`inline-block border text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(label)}`}>
      {label}
    </span>
  );
}

function DetailCard({ record }: { record: PemeriksaanRecord }) {
  const k = record.kategori;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
      {/* BALITA */}
      {k === "balita" && (
        <>
          <Stat label="Berat Badan" value={`${record.bb} kg`} />
          <Stat label="Tinggi Badan" value={`${record.tb} cm`} />
          <Stat label="Lingkar Kepala" value={`${record.lingkarKepala} cm`} />
          <Stat label="LILA" value={`${record.lila} cm`} />
          <div className="col-span-2 sm:col-span-3 flex flex-wrap gap-2 pt-1">
            <StatusBadge label={record.statusBbU} />
            <StatusBadge label={record.statusTbU} />
            <StatusBadge label={record.statusBbTb} />
            <StatusBadge label={record.statusLingkar} />
          </div>
        </>
      )}

      {/* LANSIA */}
      {k === "lansia" && (
        <>
          <Stat label="Berat Badan" value={`${record.lansiaBb} kg`} />
          <Stat label="Tinggi Badan" value={`${record.lansiaTb} cm`} />
          <Stat label="Lingkar Perut" value={`${record.lingkarPerut} cm`} />
          <Stat label="LILA" value={`${record.lilaLansia} cm`} />
          <Stat label="Tekanan Darah" value={record.tekananDarah} />
          <Stat label="IMT" value={record.imt} />
          <div className="col-span-2 sm:col-span-3 flex flex-wrap gap-2 pt-1">
            <StatusBadge label={record.statusImt} />
            <StatusBadge label={record.statusTekananDarah} />
          </div>
        </>
      )}

      {/* IBU HAMIL */}
      {k === "ibu_hamil" && (
        <>
          <Stat label="Usia Kehamilan" value={record.usiaKehamilan?.replace(/_/g, " ")} />
          <Stat label="Berat Badan" value={`${record.bbBumil} kg`} />
          <Stat label="LILA" value={`${record.lilaBumil} cm`} />
          <Stat label="Tekanan Darah" value={record.tdBumil} />
          <Stat label="IMT" value={record.imtBumil} />
          <div className="col-span-2 sm:col-span-3 flex flex-wrap gap-2 pt-1">
            <StatusBadge label={record.statusImtBumil} />
            <StatusBadge label={record.statusLilaBumil} />
            <StatusBadge label={record.statusTdBumil} />
          </div>
        </>
      )}

      {/* NIFAS */}
      {k === "ibu_nifas_menyusui" && (
        <>
          <Stat label="Waktu Kunjungan" value={record.waktuKunjungan?.replace(/_/g, " ")} />
          <Stat label="Berat Badan" value={`${record.bbNifas} kg`} />
          <Stat label="Tekanan Darah" value={record.tdNifas} />
        </>
      )}

      {/* REMAJA */}
      {k === "remaja" && (
        <>
          <Stat label="Berat Badan" value={`${record.remajaBb} kg`} />
          <Stat label="Tinggi Badan" value={`${record.remajaTb} cm`} />
          <Stat label="Lingkar Perut" value={`${record.lingkarPerutRemaja} cm`} />
          <Stat label="Tekanan Darah" value={record.tdRemaja} />
          <Stat label="IMT" value={record.imtRemaja} />
          <div className="col-span-2 sm:col-span-3 flex flex-wrap gap-2 pt-1">
            <StatusBadge label={record.statusImtRemaja} />
            <StatusBadge label={record.statusTdRemaja} />
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-0.5">{label}</p>
      <p className="font-bold text-slate-700 text-sm">{value || "—"}</p>
    </div>
  );
}

// ─────────────────────────────────────
// Komponen utama halaman detail
// ─────────────────────────────────────
export default function DetailPemeriksaanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
const id = Number(searchParams.get("id"));

  const [role, setRole] = useState<string | null>(null);
  const [peserta, setPeserta] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<PemeriksaanRecord[]>([]);
  const [riwayatPelayanan, setRiwayatPelayanan] = useState<any[]>([]);

useEffect(() => {
  const init = async () => {
    const meRes = await fetch("/api/auth/me");
    if (!meRes.ok) { router.push("/login"); return; }
    const user = await meRes.json();
    setRole(user.role.toLowerCase());

    const pesertaRes = await fetch(`/api/peserta/${id}`);
    if (pesertaRes.ok) setPeserta(await pesertaRes.json());

    const pemRes = await fetch(`/api/pemeriksaan?pesertaId=${id}`);
    if (pemRes.ok) {
      const pemData = await pemRes.json();
      setRiwayat(Array.isArray(pemData) ? [...pemData].reverse() : []);
    }

    const pelRes = await fetch(`/api/pelayanan?pesertaId=${id}`);
    if (pelRes.ok) {
      const pelData = await pelRes.json();
      setRiwayatPelayanan(Array.isArray(pelData) ? [...pelData].reverse() : []);
    }
  };

  if (id) init();
}, [id]);

  if (!role) return <p className="p-8 text-slate-500">Memuat...</p>;

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#faf5ff 100%)" }}>
      <Sidebar role={role} />

      <main className="flex-1 p-6 max-w-4xl mx-auto">

        {/* ── TOMBOL KEMBALI ── */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-6 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Pemeriksaan
        </button>

        {/* ── HEADER PROFIL PESERTA ── */}
        {peserta ? (
          <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
            {/* aksen warna atas */}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-400" />
            <div className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {/* avatar inisial */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                {peserta.nama?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">{peserta.nama}</h1>
                <p className="text-sm text-slate-500 mt-0.5">NIK: {peserta.nik || "—"}</p>
                <p className="text-sm text-slate-500 truncate">{peserta.alamat || "—"}</p>
              </div>
              <div className="flex-shrink-0">
                <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-sm px-4 py-1.5 rounded-full">
                  {KATEGORI_LABEL[peserta.kategori] || peserta.kategori}
                </span>
              </div>
            </div>

            {/* stats ringkas */}
            <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100 text-center">
              <div className="py-3">
                <p className="text-2xl font-bold text-indigo-600">{riwayat.length}</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Kunjungan</p>
              </div>
              <div className="py-3">
                <p className="text-2xl font-bold text-violet-600">{peserta.pos || "—"}</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pos</p>
              </div>
              <div className="py-3">
                <p className="text-2xl font-bold text-pink-500">{riwayat[0]?.tanggal?.split(" ").slice(1).join(" ") || "—"}</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Kunjungan Terakhir</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-5 py-4 rounded-2xl mb-6 text-sm">
            ⚠️ Data peserta tidak ditemukan. Mungkin belum mendaftar atau ID tidak sesuai.
          </div>
        )}

        {/* ── TIMELINE RIWAYAT ── */}
        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block" />
          Riwayat Pemeriksaan
        </h2>

        {riwayat.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-dashed border-slate-300 text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">Belum ada riwayat pemeriksaan</p>
            <p className="text-sm mt-1">Data akan muncul setelah kader melakukan pemeriksaan</p>
          </div>
        ) : (
          <div className="relative">
            {/* garis timeline */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 via-violet-200 to-transparent" />

            <div className="space-y-6 pl-14">
              {riwayat.map((rec, idx) => {
  const pelayanan = riwayatPelayanan.find(
    (p) => p.pemeriksaanId === rec.id
  );

  return (
    <div key={`${rec.id}-${idx}`} className="relative">
                  {/* dot timeline */}
                  <div className={`absolute -left-9 top-3 w-5 h-5 rounded-full border-2 shadow-sm flex items-center justify-center
                    ${idx === 0
                      ? "bg-indigo-500 border-white ring-2 ring-indigo-300"
                      : "bg-white border-indigo-300"
                    }`}>
                    {idx === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {/* kartu */}
                  <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md
                    ${idx === 0 ? "border-indigo-200 ring-1 ring-indigo-100" : "border-slate-200"}`}>

                    {/* header kartu */}
                    <div className={`px-4 py-3 flex items-center justify-between
                      ${idx === 0 ? "bg-indigo-50" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-semibold text-slate-600">{rec.tanggal || "Tanggal tidak tersedia"}</span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Terbaru
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {rec.pos ? `Pos: ${rec.pos}` : ""}
                      </span>
                    </div>

                    {/* body kartu */}
                   <div className="p-4 space-y-4">
                      <DetailCard record={rec} />

                      {pelayanan?.hasilAi && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                        <h3 className="font-semibold text-emerald-700 mb-2">
                          🤖 Kesimpulan AI
                        </h3>

                        <p className="text-sm text-emerald-800 leading-relaxed">
                          {pelayanan.hasilAi}
                        </p>
                      </div>
                      )}
                    </div>
                  </div>
                </div>
               );
            })}
            </div>
          </div>
        )}

        {/* ── CATATAN BAWAH ── */}
        {riwayat.length > 0 && (
          <p className="text-center text-xs text-slate-400 mt-8">
            Menampilkan {riwayat.length} kunjungan — data tersimpan lokal
          </p>
        )}
      </main>
    </div>
  );
}
