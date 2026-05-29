"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../components/sidebar";

type Peserta = {
  id: number;
  nama: string;
  kategori: string;
  pos: string;
  bulan?: string;
  hadir?: boolean;

  nik?: string;
  alamat?: string;
  tglLahir?: string;
  //balita
  ortu?: string;
  panjangLahir?: string;
  beratLahir?: string;
  noHp?: string;
  dusun?: string;
  desa?: string;

  // lansia
  pekerjaan?: string;
  statusNikah?: string;
  kecamatan?: string;
  riwayatKeluarga?: string[];
  riwayatDiri?: string[];
  merokok?: string;
  gula?: string;
  garam?: string;
  lemak?: string;

  // umum
  umur?: string;
  berat?: string;
  kehamilan?: string;
  tekanan?: string;
  // 🔥 ibu hamil tambahan
  tglPersalinan?: string;
  anakKe?: string;
  caraPersalinan?: string;
  tinggiBadan?: string;

  // 🔥 REMAJA
jenisKelamin?: string;

ortuRemaja?: string;

noHpRemaja?: string;
dusunRemaja?: string;
desaRemaja?: string;
kecamatanRemaja?: string;

riwayatKeluargaRemaja?: string[];
riwayatDiriRemaja?: string[];
};

export default function PendaftaranPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [hadir, setHadir] = useState(false);

  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [pos, setPos] = useState("");
  

  // balita
  const [umur, setUmur] = useState("");
  const [berat, setBerat] = useState("");
  const [kehamilan, setKehamilan] = useState("");
  const [tekanan, setTekanan] = useState("");
  const [nik, setNik] = useState("");
  const [alamat, setAlamat] = useState("");
  const [ortu, setOrtu] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [panjangLahir, setPanjangLahir] = useState("");
  const [beratLahir, setBeratLahir] = useState("");
  const [noHp, setNoHp] = useState("");
  const [dusun, setDusun] = useState("");
  const [desa, setDesa] = useState("");
  // 🔥 LANSIA STATE
  const [nikLansia, setNikLansia] = useState("");
  const [tglLahirLansia, setTglLahirLansia] = useState("");
  const [alamatLansia, setAlamatLansia] = useState("");
  const [pekerjaan, setPekerjaan] = useState("");
  const [statusNikah, setStatusNikah] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [riwayatKeluarga, setRiwayatKeluarga] = useState<string[]>([]);
  const [riwayatDiri, setRiwayatDiri] = useState<string[]>([]);
  const [merokok, setMerokok] = useState("");
  const [gula, setGula] = useState("");
  const [garam, setGaram] = useState("");
  const [lemak, setLemak] = useState("");
  // tambahan lansia
  const [noHpLansia, setNoHpLansia] = useState("");
  const [dusunLansia, setDusunLansia] = useState("");
  const [desaLansia, setDesaLansia] = useState("");

//bumil
const [nikIbu, setNikIbu] = useState("");
const [tglLahirIbu, setTglLahirIbu] = useState("");
const [suami, setSuami] = useState("");
const [alamatIbu, setAlamatIbu] = useState("");
const [noHpIbu, setNoHpIbu] = useState("");
const [dusunIbu, setDusunIbu] = useState("");
const [desaIbu, setDesaIbu] = useState("");
const [kecamatanIbu, setKecamatanIbu] = useState("");
const [jarakKehamilan, setJarakKehamilan] = useState("");
const [beratBadan, setBeratBadan] = useState("");
const [tinggiBadan, setTinggiBadan] = useState("");
const [tglPersalinan, setTglPersalinan] = useState("");
const [anakKe, setAnakKe] = useState("");
const [caraPersalinan, setCaraPersalinan] = useState("");
// REMAJA
const [nikRemaja, setNikRemaja] = useState("");
const [tglLahirRemaja, setTglLahirRemaja] = useState("");
const [jenisKelamin, setJenisKelamin] = useState("");

const [ortuRemaja, setOrtuRemaja] = useState("");
const [alamatRemaja, setAlamatRemaja] = useState("");
const [noHpRemaja, setNoHpRemaja] = useState("");
const [dusunRemaja, setDusunRemaja] = useState("");
const [desaRemaja, setDesaRemaja] = useState("");
const [kecamatanRemaja, setKecamatanRemaja] = useState("");

const [riwayatKeluargaRemaja, setRiwayatKeluargaRemaja] = useState<string[]>([]);
const [riwayatDiriRemaja, setRiwayatDiriRemaja] = useState<string[]>([]);
  const [data, setData] = useState<Peserta[]>([]);

useEffect(() => {
  const userRole = localStorage.getItem("role");

  if (!userRole) {
    router.push("/login");
    return;
  }

  setRole(userRole);
}, []);

useEffect(() => {
  if (role) {
    loadData();
  }
}, [role, pos]);

const loadData = async () => {
  let url = "/api/peserta";

  // 🔥 jika bidan dan pilih pos
  if (role === "bidan" && pos) {
    const posId = pos.replace("Posyandu ", "");
    url += `?posId=${posId}`;
  }

  const res = await fetch(url);
  const hasil = await res.json();

  setData(hasil);
};

  const handleCheckbox = (
  value: string,
  list: string[],
  setList: any
) => {
  if (list.includes(value)) {
    setList(list.filter((v) => v !== value));
  } else {
    setList([...list, value]);
  }
};

const handleTambah = () => {
  if (role === "bidan") return; // 🔒 blok bidan
  if (!nama || !kategori) return;

   const bulan = new Date().toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const newData: Record<string, any> = {
  nama,
  kategori,
  pos:
    role === "kader"
      ? localStorage.getItem("posyandu") || ""
      : pos,
  bulan,
  hadir,
  };

  // kategori lansia
  if (kategori === "lansia") {
    newData.nik = nikLansia;            // 🔥 SAMAKAN
    newData.alamat = alamatLansia;
    newData.noHp = noHpLansia;
    newData.dusun = dusunLansia;
    newData.desa = desaLansia;
    newData.tglLahir = tglLahirLansia;
    newData.pekerjaan = pekerjaan;
    newData.statusNikah = statusNikah;
    newData.kecamatan = kecamatan;
    newData.riwayatKeluarga = riwayatKeluarga;
    newData.riwayatDiri = riwayatDiri;
    newData.merokok = merokok;
    newData.gula = gula;
    newData.garam = garam;
    newData.lemak = lemak;
    newData.tekanan = tekanan;
  }

  // balita
  if (kategori === "balita") {
    newData.nik = nik;
    newData.alamat = alamat;
    newData.ortu = ortu;
    newData.tglLahir = tglLahir;
    newData.panjangLahir = panjangLahir;
    newData.beratLahir = beratLahir;
    newData.noHp = noHp;
    newData.dusun = dusun;
    newData.desa = desa;
  }

  // ibu hamil
  if (kategori === "ibu_hamil") {
    newData.nik = nikIbu;
    newData.tglLahir = tglLahirIbu;
    newData.ortu = suami;
    newData.alamat = alamatIbu;
    newData.noHp = noHpIbu;
    newData.dusun = dusunIbu;
    newData.desa = desaIbu;
    newData.kecamatan = kecamatanIbu;
    newData.kehamilan = jarakKehamilan;
    newData.berat = beratBadan;
    newData.tinggiBadan = tinggiBadan;
    newData.tglPersalinan = tglPersalinan;
    newData.anakKe = anakKe;
    newData.caraPersalinan = caraPersalinan;
  }
  if (kategori === "ibu_nifas") {
  newData.nik = nikIbu;
  newData.tglLahir = tglLahirIbu;
  newData.ortu = suami;
  newData.alamat = alamatIbu;
  newData.noHp = noHpIbu;
  newData.dusun = dusunIbu;
  newData.desa = desaIbu;
  newData.kecamatan = kecamatanIbu;
  newData.kehamilan = jarakKehamilan;
  newData.berat = beratBadan;
  newData.tinggiBadan = tinggiBadan;
  newData.tglPersalinan = tglPersalinan;
  newData.anakKe = anakKe;
  newData.caraPersalinan = caraPersalinan;
}
    if (kategori === "remaja") {
    newData.nik = nikRemaja;           
    newData.alamat = alamatRemaja;   
    newData.tglLahir = tglLahirRemaja;
    newData.jenisKelamin = jenisKelamin;

    newData.ortuRemaja = ortuRemaja;
    newData.noHpRemaja = noHpRemaja;
    newData.dusunRemaja = dusunRemaja;
    newData.desaRemaja = desaRemaja;
    newData.kecamatanRemaja = kecamatanRemaja;

    newData.riwayatKeluargaRemaja = riwayatKeluargaRemaja;
    newData.riwayatDiriRemaja = riwayatDiriRemaja;
  }

fetch("/api/peserta", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(newData),
})
  .then(async (res) => {
    const result = await res.json();

    console.log("STATUS:", res.status);
    console.log("RESULT:", result);

    if (!res.ok) {
      alert("Gagal simpan");
      return;
    }

    const refresh = await fetch("/api/peserta");
    const dataBaru = await refresh.json();

    setData(dataBaru);
  })
  .catch((err) => {
    console.log("ERROR:", err);
  });

  // reset
  setNama("");
setKategori("");
setPos("");

// reset balita
setNik("");
setOrtu("");
setTglLahir("");
setPanjangLahir("");
setBeratLahir("");
setNoHp("");
setDusun("");
setDesa("");
setAlamat("");

// reset ibu hamil & nifas ← TAMBAHKAN INI
setNikIbu("");
setTglLahirIbu("");
setSuami("");
setAlamatIbu("");
setNoHpIbu("");
setDusunIbu("");
setDesaIbu("");
setKecamatanIbu("");
setJarakKehamilan("");
setBeratBadan("");
setTinggiBadan("");
setTglPersalinan("");
setAnakKe("");
setCaraPersalinan("");
setHadir(false);

// reset lansia
setNikLansia("");
setTglLahirLansia("");
setAlamatLansia("");
setNoHpLansia("");
setDusunLansia("");
setDesaLansia("");
setPekerjaan("");
setStatusNikah("");
setKecamatan("");
setRiwayatKeluarga([]);
setRiwayatDiri([]);
setMerokok("");
setGula("");
setGaram("");
setLemak("");
setTekanan("");

// reset remaja
setNikRemaja("");
setTglLahirRemaja("");
setJenisKelamin("");
setOrtuRemaja("");
setAlamatRemaja("");
setNoHpRemaja("");
setDusunRemaja("");
setDesaRemaja("");
setKecamatanRemaja("");
setRiwayatKeluargaRemaja([]);
setRiwayatDiriRemaja([]);
};

const handleHapus = async (id: number) => {
  const ok = confirm("Yakin ingin menghapus data?");
  if (!ok) return;

  try {
    await fetch(`/api/peserta?id=${id}`, {
      method: "DELETE",
    });

    // ⬇ refresh data dari database
    const res = await fetch("/api/peserta");
    const fresh = await res.json();

    setData(fresh);  // tampilkan data paling terbaru
  } catch (error) {
    console.error("Gagal menghapus", error);
  }
};

  if (!role) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">

      {/* SIDEBAR */}
      <Sidebar role={role} />
        
      {/* MAIN */}
      <main className="flex-1 p-6" style={{color: '#1e293b'}}>

        <h1 className="text-3xl font-bold mb-6 text-slate-800">
          📋 Pendaftaran Peserta ({role})
        </h1>

        {/* FORM */}
        {role !== "bidan" && (
        <div className="mb-6 bg-white/50 backdrop-blur p-6 rounded-2xl shadow-lg border border-violet-100 text-slate-800">
          <h2 className="mb-4 font-semibold text-violet-700">
            ➕ Tambah Peserta
          </h2>

          <div className="flex flex-wrap gap-3">

            <input
              type="text"
              placeholder="Nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="border p-2 rounded"
            />

            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Kategori</option>
              <option value="balita">Balita</option>
              <option value="ibu_hamil">Ibu Hamil</option>
              <option value="ibu_nifas">Ibu Nifas/Menyusui</option>
              <option value="lansia">Lansia</option>
              <option value="remaja">Remaja</option>
            </select>

            {role === "bidan" && (
              <select
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Pilih Posyandu</option>

                <option value="Posyandu 1">Posyandu 1</option>
                <option value="Posyandu 2">Posyandu 2</option>
                <option value="Posyandu 3">Posyandu 3</option>
                <option value="Posyandu 4">Posyandu 4</option>
                <option value="Posyandu 5">Posyandu 5</option>
                <option value="Posyandu 6">Posyandu 6</option>
                <option value="Posyandu 7">Posyandu 7</option>
                <option value="Posyandu 8">Posyandu 8</option>
                <option value="Posyandu 9">Posyandu 9</option>
              </select>
            )}

            {/* 🔥 FORM DINAMIS */}
            {kategori === "balita" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-3">

    <input placeholder="NIK" value={nik} onChange={(e) => setNik(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Nama Orang Tua" value={ortu} onChange={(e) => setOrtu(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Tanggal Lahir" type="date" value={tglLahir} onChange={(e) => setTglLahir(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Panjang Badan Lahir (cm)" value={panjangLahir} onChange={(e) => setPanjangLahir(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Berat Badan Lahir (kg)" value={beratLahir} onChange={(e) => setBeratLahir(e.target.value)} className="border p-2 rounded" />

    <input placeholder="No HP" value={noHp} onChange={(e) => setNoHp(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Dusun/RT/RW" value={dusun} onChange={(e) => setDusun(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Desa/Kelurahan" value={desa} onChange={(e) => setDesa(e.target.value)} className="border p-2 rounded" />

    <textarea placeholder="Alamat Lengkap" value={alamat} onChange={(e) => setAlamat(e.target.value)} className="border p-2 rounded col-span-2" />

  </div>
)}
            {kategori === "ibu_hamil" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-3">

    <input placeholder="NIK" value={nikIbu} onChange={(e) => setNikIbu(e.target.value)} className="border p-2 rounded" />

    <input type="date" value={tglLahirIbu} onChange={(e) => setTglLahirIbu(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Nama Suami" value={suami} onChange={(e) => setSuami(e.target.value)} className="border p-2 rounded" />

    <input placeholder="No HP" value={noHpIbu} onChange={(e) => setNoHpIbu(e.target.value)} className="border p-2 rounded" />

    <textarea placeholder="Alamat" value={alamatIbu} onChange={(e) => setAlamatIbu(e.target.value)} className="border p-2 rounded col-span-2" />

    <input placeholder="Dusun/RT/RW" value={dusunIbu} onChange={(e) => setDusunIbu(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Desa/Kelurahan/Nagari" value={desaIbu} onChange={(e) => setDesaIbu(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Kecamatan" value={kecamatanIbu} onChange={(e) => setKecamatanIbu(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Jarak kehamilan sebelumnya" value={jarakKehamilan} onChange={(e) => setJarakKehamilan(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Berat Badan (kg)" value={beratBadan} onChange={(e) => setBeratBadan(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Tinggi Badan (cm)" value={tinggiBadan} onChange={(e) => setTinggiBadan(e.target.value)} className="border p-2 rounded" />

    <input type="date" value={tglPersalinan} onChange={(e) => setTglPersalinan(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Anak ke-" value={anakKe} onChange={(e) => setAnakKe(e.target.value)} className="border p-2 rounded" />

    {/* CARA PERSALINAN */}
    <div className="col-span-2">
      <p className="font-semibold">Cara Persalinan:</p>

      <label className="mr-4">
        <input
          type="radio"
          checked={caraPersalinan === "normal"}
          onChange={() => setCaraPersalinan("normal")}
        /> Normal
      </label>

      <label>
        <input
          type="radio"
          checked={caraPersalinan === "tindakan"}
          onChange={() => setCaraPersalinan("tindakan")}
        /> Dengan Tindakan
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hadir}
          onChange={(e) => setHadir(e.target.checked)}
        />
        Hadir bulan ini
      </label>
    </div>

  </div>
)}

            {kategori === "ibu_nifas" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-3">

    <input placeholder="NIK" value={nikIbu} onChange={(e) => setNikIbu(e.target.value)} className="border p-2 rounded" />

    <input type="date" value={tglLahirIbu} onChange={(e) => setTglLahirIbu(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Nama Suami" value={suami} onChange={(e) => setSuami(e.target.value)} className="border p-2 rounded" />

    <input placeholder="No HP" value={noHpIbu} onChange={(e) => setNoHpIbu(e.target.value)} className="border p-2 rounded" />

    <textarea placeholder="Alamat" value={alamatIbu} onChange={(e) => setAlamatIbu(e.target.value)} className="border p-2 rounded col-span-2" />

    <input placeholder="Dusun/RT/RW" value={dusunIbu} onChange={(e) => setDusunIbu(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Desa/Kelurahan/Nagari" value={desaIbu} onChange={(e) => setDesaIbu(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Kecamatan" value={kecamatanIbu} onChange={(e) => setKecamatanIbu(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Jarak kehamilan sebelumnya" value={jarakKehamilan} onChange={(e) => setJarakKehamilan(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Berat Badan (kg)" value={beratBadan} onChange={(e) => setBeratBadan(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Tinggi Badan (cm)" value={tinggiBadan} onChange={(e) => setTinggiBadan(e.target.value)} className="border p-2 rounded" />

    <input type="date" value={tglPersalinan} onChange={(e) => setTglPersalinan(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Anak ke-" value={anakKe} onChange={(e) => setAnakKe(e.target.value)} className="border p-2 rounded" />

    {/* CARA PERSALINAN */}
    <div className="col-span-2">
      <p className="font-semibold">Cara Persalinan:</p>

      <label className="mr-4">
        <input
          type="radio"
          checked={caraPersalinan === "normal"}
          onChange={() => setCaraPersalinan("normal")}
        /> Normal
      </label>

      <label>
        <input
          type="radio"
          checked={caraPersalinan === "tindakan"}
          onChange={() => setCaraPersalinan("tindakan")}
        /> Dengan Tindakan
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hadir}
          onChange={(e) => setHadir(e.target.checked)}
        />
        Hadir bulan ini
      </label>
    </div>

  </div>
)}

            {kategori === "lansia" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-3">

    <input placeholder="NIK" value={nikLansia} onChange={(e) => setNikLansia(e.target.value)} className="border p-2 rounded" />

    <input type="date" value={tglLahirLansia} onChange={(e) => setTglLahirLansia(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Alamat" value={alamatLansia} onChange={(e) => setAlamatLansia(e.target.value)} className="border p-2 rounded col-span-2" />

    <input placeholder="No HP" value={noHpLansia} onChange={(e) => setNoHpLansia(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Pekerjaan" value={pekerjaan} onChange={(e) => setPekerjaan(e.target.value)} className="border p-2 rounded" />

    <select value={statusNikah} onChange={(e) => setStatusNikah(e.target.value)} className="border p-2 rounded">
      <option value="">Status Nikah</option>
      <option value="menikah">Menikah</option>
      <option value="tidak">Tidak Menikah</option>
    </select>

    <input placeholder="Dusun/RT/RW" value={dusunLansia} onChange={(e) => setDusunLansia(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Desa/Kelurahan" value={desaLansia} onChange={(e) => setDesaLansia(e.target.value)} className="border p-2 rounded" />

    <input placeholder="Kecamatan" value={kecamatan} onChange={(e) => setKecamatan(e.target.value)} className="border p-2 rounded" />

    {/* RIWAYAT KELUARGA */}
    <div className="col-span-2">
      <p className="font-semibold">Riwayat Keluarga:</p>
      {["Hipertensi", "DM", "Stroke", "Jantung", "Asma"].map((item) => (
        <label key={item} className="mr-3">
          <input
            type="checkbox"
            checked={riwayatKeluarga.includes(item)}
            onChange={() =>
              handleCheckbox(item, riwayatKeluarga, setRiwayatKeluarga)
            }
          />{" "}
          {item}
        </label>
      ))}
    </div>

    {/* RIWAYAT DIRI */}
    <div className="col-span-2">
      <p className="font-semibold">Riwayat Diri:</p>
      {["Hipertensi", "DM", "Stroke", "Jantung", "Asma"].map((item) => (
        <label key={item} className="mr-3">
          <input
            type="checkbox"
            checked={riwayatDiri.includes(item)}
            onChange={() =>
              handleCheckbox(item, riwayatDiri, setRiwayatDiri)
            }
          />{" "}
          {item}
        </label>
      ))}
    </div>

    {/* PERILAKU */}
    <div className="col-span-2">
      <p className="font-semibold">Perilaku Berisiko:</p>

      {[
        { label: "Merokok", value: merokok, set: setMerokok },
        { label: "Konsumsi Gula Tinggi", value: gula, set: setGula },
        { label: "Konsumsi Garam Tinggi", value: garam, set: setGaram },
        { label: "Konsumsi Lemak", value: lemak, set: setLemak },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-56">{item.label}</span>
          <label>
            <input
              type="radio"
              checked={item.value === "ya"}
              onChange={() => item.set("ya")}
            />{" "}
            Ya
          </label>
          <label>
            <input
              type="radio"
              checked={item.value === "tidak"}
              onChange={() => item.set("tidak")}
            />{" "}
            Tidak
          </label>
        </div>
      ))}
    </div>

    <input
      placeholder="Tekanan Darah"
      value={tekanan}
      onChange={(e) => setTekanan(e.target.value)}
      className="border p-2 rounded"
    />

  </div>
)}

{kategori === "remaja" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-3">

  {/* IDENTITAS */}
  <input
    placeholder="NIK"
    value={nikRemaja}
    onChange={(e) => setNikRemaja(e.target.value)}
    className="border p-2 rounded"
  />

  <input
    type="date"
    value={tglLahirRemaja}
    onChange={(e) => setTglLahirRemaja(e.target.value)}
    className="border p-2 rounded"
  />

  {/* JENIS KELAMIN */}
  <div className="col-span-2">
    <p className="font-semibold">Jenis Kelamin</p>
    <label className="mr-4">
      <input
        type="radio"
        checked={jenisKelamin === "laki-laki"}
        onChange={() => setJenisKelamin("laki-laki")}
      /> Laki-laki
    </label>
    <label>
      <input
        type="radio"
        checked={jenisKelamin === "perempuan"}
        onChange={() => setJenisKelamin("perempuan")}
      /> Perempuan
    </label>
  </div>

  {/* ORANG TUA */}
  <input
    placeholder="Nama Ayah/Ibu"
    value={ortuRemaja}
    onChange={(e) => setOrtuRemaja(e.target.value)}
    className="border p-2 rounded col-span-2"
  />

  {/* ALAMAT */}
  <textarea
    placeholder="Alamat"
    value={alamatRemaja}
    onChange={(e) => setAlamatRemaja(e.target.value)}
    className="border p-2 rounded col-span-2"
  />

  <input
    placeholder="No HP"
    value={noHpRemaja}
    onChange={(e) => setNoHpRemaja(e.target.value)}
    className="border p-2 rounded"
  />

  <input
    placeholder="Dusun/RT/RW"
    value={dusunRemaja}
    onChange={(e) => setDusunRemaja(e.target.value)}
    className="border p-2 rounded"
  />

  <input
    placeholder="Desa/Kelurahan"
    value={desaRemaja}
    onChange={(e) => setDesaRemaja(e.target.value)}
    className="border p-2 rounded"
  />

  <input
    placeholder="Kecamatan"
    value={kecamatanRemaja}
    onChange={(e) => setKecamatanRemaja(e.target.value)}
    className="border p-2 rounded"
  />

  {/* RIWAYAT KELUARGA */}
  <div className="col-span-2">
    <p className="font-semibold">Riwayat Keluarga</p>
    {["Hipertensi", "DM", "Stroke", "Jantung", "Asma", "Kanker", "Kolesterol Tinggi"].map((item) => (
      <label key={item} className="mr-3">
        <input
          type="checkbox"
          checked={riwayatKeluargaRemaja.includes(item)}
          onChange={() =>
            handleCheckbox(item, riwayatKeluargaRemaja, setRiwayatKeluargaRemaja)
          }
        /> {item}
      </label>
    ))}
  </div>

  {/* RIWAYAT DIRI */}
  <div className="col-span-2">
    <p className="font-semibold">Perilaku Berisiko Diri</p>
    {["Hipertensi", "DM", "Stroke", "Jantung", "Asma", "Kanker", "Kolesterol Tinggi"].map((item) => (
      <label key={item} className="mr-3">
        <input
          type="checkbox"
          checked={riwayatDiriRemaja.includes(item)}
          onChange={() =>
            handleCheckbox(item, riwayatDiriRemaja, setRiwayatDiriRemaja)
          }
        /> {item}
      </label>
    ))}
  </div>

</div>
)}
            <button
              onClick={handleTambah}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded hover:from-violet-700 hover:to-indigo-700 transition"
            >
              Tambah
            </button>
          </div>
        </div>
)}

{/* FILTER POS BIDAN */}
{role === "bidan" && (
  <div className="mb-4">
    <select
      value={pos}
      onChange={(e) => setPos(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="">Semua Posyandu</option>

      <option value="Posyandu 1">Posyandu 1</option>
      <option value="Posyandu 2">Posyandu 2</option>
      <option value="Posyandu 3">Posyandu 3</option>
      <option value="Posyandu 4">Posyandu 4</option>
      <option value="Posyandu 5">Posyandu 5</option>
      <option value="Posyandu 6">Posyandu 6</option>
      <option value="Posyandu 7">Posyandu 7</option>
      <option value="Posyandu 8">Posyandu 8</option>
      <option value="Posyandu 9">Posyandu 9</option>
    </select>
  </div>
)}
        {/* TABEL */}
        <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow border border-violet-100" 
     style={{backgroundColor: 'rgba(255,255,255,0.95)', color: '#1e293b'}}>
          <h2 className="mb-4 font-semibold text-violet-700">
            📊 Data Peserta
          </h2>

          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-violet-200 to-indigo-200">
                <th style={{color: '#1e293b', padding: '8px'}}>No</th>
                <th style={{color: '#1e293b', padding: '8px'}}>Nama</th>
                <th style={{color: '#1e293b', padding: '8px'}}>Kategori</th>
                <th style={{color: '#1e293b', padding: '8px'}}>Detail</th>
                <th style={{color: '#1e293b', padding: '8px'}}>Pos</th>
                <th style={{color: '#1e293b', padding: '8px'}}>Aksi</th>
              </tr>
            </thead>

            <tbody>
   {data

  .map((item, i) => (
    <tr key={item.id} className="text-center border-b" style={{color: '#1e293b'}}>
      <td>{i + 1}</td>
      <td>{item.nama}</td>

      <td>
        <span className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-2 py-1 rounded text-sm">
          {item.kategori}
        </span>
      </td>

      {/* ✅ DETAIL DINAMIS PER KATEGORI */}
<td className="text-left p-2 text-sm" style={{color: '#334155'}}>
        
        {/* BALITA */}
        {item.kategori === "balita" && (
          <div className="space-y-1">
            <p><b>NIK:</b> {item.nik}</p>
            <p><b>Ortu:</b> {item.ortu}</p>
            <p><b>Lahir:</b> {item.tglLahir}</p>
            <p><b>BB/PB:</b> {item.beratLahir} kg / {item.panjangLahir} cm</p>
            <p><b>HP:</b> {item.noHp}</p>
            <p><b>Alamat:</b> {item.dusun}, {item.desa}</p>
          </div>
        )}

        {/* IBU HAMIL */}
        {item.kategori === "ibu_hamil" && (
  <div className="space-y-1">
    <p><b>NIK:</b> {item.nik}</p>
    <p><b>Suami:</b> {item.ortu}</p>
    <p><b>No HP:</b> {item.noHp}</p>
    <p><b>Alamat:</b> {item.dusun}, {item.desa}</p>
    <p><b>Jarak Kehamilan:</b> {item.kehamilan}</p>
    <p><b>BB/TB:</b> {item.berat} kg / {item.umur} cm</p>
    <p><b>Anak ke:</b> {item.anakKe}</p>
    <p><b>Persalinan:</b> {item.caraPersalinan}</p>
  </div>
)}
        {/* IBU NIFAS */}
        {item.kategori === "ibu_nifas" && (
  <div className="space-y-1">
    <p><b>NIK:</b> {item.nik}</p>
    <p><b>Suami:</b> {item.ortu}</p>
    <p><b>No HP:</b> {item.noHp}</p>
    <p><b>Alamat:</b> {item.dusun}, {item.desa}</p>
    <p><b>Jarak Kehamilan:</b> {item.kehamilan}</p>
    <p><b>BB/TB:</b> {item.berat} kg / {item.umur} cm</p>
    <p><b>Anak ke:</b> {item.anakKe}</p>
    <p><b>Persalinan:</b> {item.caraPersalinan}</p>
  </div>
)}
        {/* LANSIA */}
        {item.kategori === "lansia" && (
          <div className="space-y-1">
            <p><b>NIK:</b> {item.nik}</p>
            <p><b>Tgl Lahir:</b> {item.tglLahir}</p>
            <p><b>No HP:</b> {item.noHp}</p>
            <p><b>Status Nikah:</b> {item.statusNikah}</p>
            <p><b>Kecamatan:</b> {item.kecamatan}</p>
            <p><b>Riwayat Keluarga:</b> {item.riwayatKeluarga?.join(", ")}</p>
            <p><b>Riwayat Diri:</b> {item.riwayatDiri?.join(", ")}</p>
            <p><b>Merokok:</b> {item.merokok}</p>
            <p><b>Gula:</b> {item.gula}</p>
            <p><b>Garam:</b> {item.garam}</p>
            <p><b>Lemak:</b> {item.lemak}</p>
            <p><b>Tekanan Darah:</b> {item.tekanan}</p>
          </div>
        )}
        {/* REMAJA */}
        {item.kategori === "remaja" && (
          <div className="space-y-1">
            <p><b>NIK:</b> {item.nik}</p>
            <p><b>Tgl Lahir:</b> {item.tglLahir}</p>
            <p><b>Jenis Kelamin:</b> {item.jenisKelamin}</p>
            <p><b>Orang Tua:</b> {item.ortuRemaja}</p>
            <p><b>No HP:</b> {item.noHpRemaja}</p>
            <p><b>Alamat:</b> {item.dusunRemaja}, {item.desaRemaja}</p>
            <p><b>Kecamatan:</b> {item.kecamatanRemaja}</p>
            <p><b>Riwayat Keluarga:</b> {item.riwayatKeluargaRemaja?.join(", ")}</p>
            <p><b>Perilaku Berisiko:</b> {item.riwayatDiriRemaja?.join(", ")}</p>
          </div>
        )}
      </td>

      <td>{(item as any).posyandu?.nama ?? item.pos ?? "-"}</td>

    <td>
  {role !== "bidan" && (
    <button
      onClick={() => handleHapus(item.id)}
      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded hover:from-red-600 hover:to-pink-600 transition"
    >
      Hapus
    </button>
  )}
</td>
    </tr>
  ))}
</tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
