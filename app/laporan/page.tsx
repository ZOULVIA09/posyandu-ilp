"use client";

import { useEffect, useMemo, useState } from "react";
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

const DAFTAR_POSYANDU = [
  "Posyandu 1",
  "Posyandu 2",
  "Posyandu 3",
  "Posyandu 4",
  "Posyandu 5",
  "Posyandu 6",
  "Posyandu 7",
  "Posyandu 8",
  "Posyandu 9",
];

export default function LaporanPage() {
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [posLogin, setPosLogin] = useState("");

  // form
  const [nama, setNama] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [status, setStatus] = useState("");
  const [nik, setNik] = useState("");
  const [alamat, setAlamat] = useState("");
  const [kategori, setKategori] = useState("");
  const [kondisi, setKondisi] = useState("");

  // filter — satu search nama + filter pos
  const [searchNama, setSearchNama] = useState("");
  const [filterPos, setFilterPos] = useState("");

  const [data, setData] = useState<Kehadiran[]>([]);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    const userPos = localStorage.getItem("pos") || "";

    if (!userRole) {
      router.push("/login");
      return;
    }

    setRole(userRole);
    setPosLogin(userPos);

    // kader hanya lihat pos miliknya, tidak bisa ganti
    if (userRole === "kader") {
      setFilterPos(userPos);
    }

    const savedPelayanan = localStorage.getItem("dataPelayanan");
    if (savedPelayanan) {
      const pelayanan = JSON.parse(savedPelayanan);

      const hasilLaporan = pelayanan.map((item: any) => ({
        id: item.id,
        nama: item.nama,
        nik: item.nik,
        alamat: item.alamat,
        kategori: item.kategori,
        tanggal: item.tanggal,
        ringkasanPemeriksaan: item.ringkasanPemeriksaan,
        pos: item.pos || item.namaPos || "-",
        status: "Hadir",
        kondisi: item.ringkasanPemeriksaan
          ?.toLowerCase()
          .includes("resiko")
          ? "resiko"
          : "normal",
      }));

      setData(hasilLaporan);
    }
  }, []);

  // filter data — kader terkunci ke posnya, bidan bebas pilih
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const cocokNama = item.nama
        .toLowerCase()
        .includes(searchNama.toLowerCase());

      const cocokPos = !filterPos || item.pos === filterPos;

      return cocokNama && cocokPos;
    });
  }, [data, searchNama, filterPos]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Kehadiran Posyandu", 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [[
        "No", "Nama", "NIK", "Alamat", "Pos", "Tanggal",
        "Kategori", "Hasil Pemeriksaan", "Kehadiran", "Kondisi",
      ]],
      body: filteredData.map((item, i) => [
        i + 1,
        item.nama,
        item.nik || "-",
        item.alamat || "-",
        item.pos || "-",
        item.tanggal,
        item.kategori || "-",
        item.ringkasanPemeriksaan || "-",
        item.status,
        item.kondisi || "-",
      ]),
    });

    doc.save("laporan-kehadiran.pdf");
  };

  const handleTambah = () => {
    if (!nama || !tanggal || !status) return;

    const newData: Kehadiran = {
      id: data.length + 1,
      nama,
      nik,
      alamat,
      kategori,
      tanggal,
      status,
      kondisi,
      pos: posLogin,
    };

    setData([...data, newData]);
    setNama("");
    setTanggal("");
    setStatus("");
    setNik("");
    setAlamat("");
    setKategori("");
    setKondisi("");
  };

  const handleHapus = (id: number) => {
    setData(data.filter((item) => item.id !== id));
  };

  if (!role) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <Sidebar role={role} />

      {/* MAIN */}
      <main className="flex-1 p-6">

        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          📊 Laporan Kehadiran ({role})
        </h1>

        {/* FILTER */}
        <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 flex flex-wrap gap-3 items-center">

          {/* Search nama — satu untuk semua role */}
          <input
            type="text"
            placeholder="🔍 Cari nama peserta..."
            value={searchNama}
            onChange={(e) => setSearchNama(e.target.value)}
            className="border p-2 rounded-lg w-64"
          />

          {/* Bidan: dropdown posyandu 1–9 */}
          {role === "bidan" && (
            <select
              value={filterPos}
              onChange={(e) => setFilterPos(e.target.value)}
              className="border p-2 rounded-lg"
            >
              <option value="">Semua Posyandu</option>
              {DAFTAR_POSYANDU.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          )}

          {/* Kader: info pos terkunci */}
          {role === "kader" && (
            <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
              📍 Posyandu: <b>{posLogin}</b>
            </div>
          )}

          {/* Badge jumlah hasil */}
          <div className="ml-auto bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
            Menampilkan <b>{filteredData.length}</b> data
          </div>
        </div>

        {/* FORM TAMBAH */}
        {(role === "kader" || role === "bidan") && (
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 hover:shadow-xl transition">

            <h2 className="text-lg font-semibold text-purple-600 mb-4">
              ➕ Tambah Data Kehadiran
            </h2>

            <div className="flex flex-wrap gap-3">

              <input
                type="text"
                placeholder="Nama Peserta"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="border p-2 rounded-lg"
              />

              <input
                placeholder="NIK"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="border p-2 rounded"
              />

              <input
                placeholder="Alamat"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
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
                <option value="lansia">Lansia</option>
                <option value="remaja">Remaja</option>
              </select>

              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="border p-2 rounded-lg"
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border p-2 rounded-lg"
              >
                <option value="">Status</option>
                <option value="Hadir">✅ Hadir</option>
                <option value="Tidak Hadir">❌ Tidak Hadir</option>
              </select>

              <select
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Kondisi</option>
                <option value="normal">Normal</option>
                <option value="resiko">Resiko</option>
              </select>

              <button
                onClick={handleTambah}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
              >
                Simpan
              </button>
            </div>
          </div>
        )}

        {/* TABEL */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">

          <h2 className="text-lg font-semibold text-purple-600 mb-4">
            📋 Data Kehadiran
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full rounded-lg overflow-hidden">

              <thead>
                <tr className="bg-purple-100 text-gray-700">
                  <th className="p-3">No</th>
                  <th className="p-3">Nama</th>
                  <th className="p-3">NIK</th>
                  <th className="p-3">Alamat</th>
                  <th className="p-3">Pos</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Hasil Pemeriksaan</th>
                  <th className="p-3">Kehadiran</th>
                  <th className="p-3">Kondisi</th>
                  {(role === "kader" || role === "bidan") && (
                    <th className="p-3">Aksi</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={role === "kader" || role === "bidan" ? 11 : 10}
                      className="p-6 text-center text-gray-400"
                    >
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`text-center transition hover:bg-purple-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-3">{index + 1}</td>

                      <td className="p-3 font-medium">{item.nama}</td>

                      <td className="p-3">{item.nik || "-"}</td>

                      <td className="p-3">{item.alamat || "-"}</td>

                      <td className="p-3">{item.pos || "-"}</td>

                      <td className="p-3">{item.tanggal}</td>

                      <td className="p-3">{item.kategori || "-"}</td>

                      <td className="p-3 text-xs text-left">
                        {item.ringkasanPemeriksaan || "-"}
                      </td>

                      {/* STATUS */}
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            item.status === "Hadir"
                              ? "bg-green-200 text-green-700"
                              : "bg-red-200 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* KONDISI */}
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            item.kondisi === "normal"
                              ? "bg-blue-200 text-blue-700"
                              : "bg-yellow-200 text-yellow-700"
                          }`}
                        >
                          {item.kondisi || "-"}
                        </span>
                      </td>

                      {/* AKSI */}
                      {(role === "kader" || role === "bidan") && (
                        <td className="p-3">
                          <button
                            onClick={() => handleHapus(item.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                          >
                            Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={handleExportPDF}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              🖨️ Export PDF
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}