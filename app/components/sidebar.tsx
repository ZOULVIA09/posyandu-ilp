"use client";

import Link from "next/link";

export default function Sidebar({ role }: { role: string }) {
  return (
    <aside className="w-64 bg-gradient-to-b from-violet-600 via-purple-600 to-indigo-600 text-white p-5 flex flex-col justify-between shadow-xl">
      
      {/* HEADER */}
      <div>
        <div className="mb-8 flex items-center gap-3">

          {/* 🔥 AVATAR PROFIL */}
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center relative overflow-hidden">
            
            {/* kepala */}
            <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-2"></div>
            
            {/* badan */}
            <div className="w-8 h-4 bg-gray-400 rounded-t-full absolute bottom-1"></div>

          </div>

          {/* INFO */}
          <div>
            <h2 className="text-lg font-bold">
              {role === "bidan" ? "Bidan" : "Kader"}
            </h2>
            <p className="text-sm text-white/70">Posyandu ILP</p>
          </div>

        </div>

        {/* MENU */}
        <nav className="space-y-2">

          <Link
            href={role === "bidan" ? "/dashboard-bidan" : "/dashboard-kader"}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition"
          >
            📊 Dashboard
          </Link>

          <Link
            href="/pendaftaran"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition"
          >
            📝 Pendaftaran
          </Link>

          <Link
            href="/pemeriksaan"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition"
          >
            🩺 Pemeriksaan
          </Link>

          {role === "bidan" && (
            <Link
              href="/pelayanan"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition"
            >
              💊 Pelayanan
            </Link>
          )}

          <Link
            href="/laporan"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition"
          >
            📄 Laporan
          </Link>

        </nav>
      </div>

      {/* LOGOUT */}
      <button
        onClick={() => {
          localStorage.removeItem("role");
          window.location.href = "/login";
        }}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg hover:scale-105 transition shadow"
      >
        🚪 Logout
      </button>
    </aside>
  );
}