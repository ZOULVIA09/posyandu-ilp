"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
        --emerald: #7c3aed;
        --emerald-light: #ede9fe;
        --teal: #6366f1;
        --navy: #1e1b4b;
        --navy-mid: #2e1065;
        --slate: #475569;
        --muted: #94a3b8;
        --surface: #f5f3ff;
        --white: #ffffff;
      }

        html { scroll-behavior: smooth; }

        body { font-family: 'Sora', sans-serif; background: var(--surface); color: var(--navy); }

        /* ── NAVBAR ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 18px 64px;
          display: flex; align-items: center; justify-content: space-between;
          transition: all 0.35s ease;
        }

        .nav.scrolled {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(0,0,0,0.06);
          padding: 14px 64px;
        }

        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-size: 16px; font-weight: 800; color: var(--navy);
          text-decoration: none; letter-spacing: -0.01em;
        }

        .nav-logo-dot {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, var(--emerald), var(--teal));
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 12px rgba(5,150,105,0.3);
        }

        .nav-links {
          display: flex; gap: 36px; list-style: none;
        }

        .nav-links a {
          font-size: 14px; font-weight: 500; color: var(--slate);
          text-decoration: none; transition: color 0.2s;
        }

        .nav-links a:hover { color: var(--emerald); }

        .nav-cta {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 22px; border-radius: 100px;
          background: var(--navy); color: #fff;
          font-size: 13px; font-weight: 600; text-decoration: none;
          transition: all 0.2s; letter-spacing: 0.02em;
          box-shadow: 0 4px 16px rgba(15,23,42,0.2);
        }

        .nav-cta:hover { background: var(--emerald); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(5,150,105,0.3); }

        /* ── HERO ── */
        .hero {
          min-height: 100vh;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 120px 64px 80px;
          gap: 60px;
          position: relative;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 60% at 70% 50%, rgba(5,150,105,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 10% 80%, rgba(13,148,136,0.08) 0%, transparent 60%);
        }

        /* floating shapes */
        .shape {
          position: absolute; border-radius: 50%; pointer-events: none;
          animation: shapeFloat 6s ease-in-out infinite alternate;
        }

        .shape-1 {
          width: 300px; height: 300px; right: 5%; top: 10%;
          background: radial-gradient(circle, rgba(5,150,105,0.08), transparent 70%);
          animation-duration: 7s;
        }

        .shape-2 {
          width: 200px; height: 200px; left: 8%; bottom: 20%;
          background: radial-gradient(circle, rgba(13,148,136,0.07), transparent 70%);
          animation-duration: 9s; animation-delay: 1s;
        }

        .hero-left { position: relative; z-index: 2; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--emerald-light);
          color: var(--emerald);
          padding: 6px 16px; border-radius: 100px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 28px;
          border: 1px solid rgba(124,58,237,0.2);
          opacity: 0; animation: fadeUp 0.6s ease 0.1s forwards;
        }

        .hero-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(40px, 5vw, 64px);
          font-weight: 700;
          color: var(--navy);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
          opacity: 0; animation: fadeUp 0.7s ease 0.2s forwards;
        }

        .hero-title em {
          font-style: italic; font-weight: 400;
          color: var(--emerald);
        }

        .hero-desc {
          font-size: 16px; color: var(--slate); line-height: 1.8;
          max-width: 440px; margin-bottom: 40px;
          opacity: 0; animation: fadeUp 0.7s ease 0.3s forwards;
        }

        .hero-actions {
          display: flex; align-items: center; gap: 16px;
          opacity: 0; animation: fadeUp 0.7s ease 0.4s forwards;
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 100px;
          background: linear-gradient(135deg, var(--emerald), var(--teal));
          color: #fff; font-size: 14px; font-weight: 700;
          text-decoration: none; letter-spacing: 0.02em;
          box-shadow: 0 6px 24px rgba(5,150,105,0.35);
          transition: all 0.2s;
        }

        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(5,150,105,0.45); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 24px; border-radius: 100px;
          color: var(--slate); font-size: 14px; font-weight: 600;
          text-decoration: none;
          border: 1.5px solid #e2e8f0;
          transition: all 0.2s;
        }

        .btn-ghost:hover { border-color: var(--emerald); color: var(--emerald); }

        /* hero stats bar */
        .hero-stats {
          display: flex; gap: 32px; margin-top: 56px;
          padding-top: 40px;
          border-top: 1px solid #e2e8f0;
          opacity: 0; animation: fadeUp 0.7s ease 0.55s forwards;
        }

        .hstat-num {
          font-family: 'Fraunces', serif;
          font-size: 32px; font-weight: 700; color: var(--navy);
          letter-spacing: -0.03em;
        }

        .hstat-label { font-size: 12px; color: var(--muted); margin-top: 2px; }

        /* hero right — image stack */
        .hero-right {
          position: relative; z-index: 2;
          opacity: 0; animation: fadeIn 0.9s ease 0.35s forwards;
        }

        .img-card-main {
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.12);
          position: relative;
        }

        .img-card-main img { width: 100%; height: 380px; object-fit: cover; display: block; }

        .img-float {
          position: absolute;
          background: #fff;
          border-radius: 16px;
          padding: 12px 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          display: flex; align-items: center; gap: 10px;
          animation: shapeFloat 4s ease-in-out infinite alternate;
        }

        .img-float-1 { bottom: -20px; left: -30px; animation-delay: 0.5s; }
        .img-float-2 { top: -20px; right: -20px; animation-delay: 1s; }

        .float-icon { font-size: 22px; }
        .float-text-big { font-size: 16px; font-weight: 800; color: var(--navy); }
        .float-text-small { font-size: 10px; color: var(--muted); }

        /* ── LAYANAN ── */
        .section { padding: 100px 64px; }

        .section-label {
          display: inline-block;
          font-size: 11px; font-weight: 700; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--emerald);
          margin-bottom: 12px;
        }

        .section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 700; color: var(--navy);
          letter-spacing: -0.02em; line-height: 1.2;
          margin-bottom: 16px;
        }

        .section-sub { font-size: 15px; color: var(--slate); max-width: 480px; line-height: 1.7; }

        .layanan-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 20px; margin-top: 56px;
        }

        .layanan-card {
          background: var(--white);
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 32px 24px;
          transition: all 0.3s;
          cursor: default;
          position: relative; overflow: hidden;
        }

        .layanan-card::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--emerald), var(--teal));
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s;
        }

        .layanan-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.08); border-color: transparent; }
        .layanan-card:hover::after { transform: scaleX(1); }

        .layanan-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin-bottom: 20px;
          background: var(--emerald-light);
        }

        .layanan-title { font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
        .layanan-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

        /* ── KATEGORI ── */
        .kategori-section {
          padding: 80px 64px;
          background: var(--navy);
          position: relative; overflow: hidden;
        }

        .kategori-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(5,150,105,0.15), transparent);
        }

        .kategori-section .section-label { color: #c4b5fd; }
        .kategori-section .section-title { color: #fff; }
        .kategori-section .section-sub { color: #94a3b8; }

        .kategori-pills {
          display: flex; flex-wrap: wrap; gap: 12px;
          margin-top: 40px;
        }

        .kat-pill {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 12px 24px;
          transition: all 0.2s;
        }

        .kat-pill:hover {
          background: rgba(5,150,105,0.2);
          border-color: rgba(5,150,105,0.4);
          transform: translateY(-2px);
        }

        .kat-emoji { font-size: 20px; }
        .kat-name { font-size: 14px; font-weight: 600; color: #fff; }

        /* ── GALLERY ── */
        .gallery-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-rows: 200px 200px;
          gap: 16px;
          margin-top: 56px;
        }

        .gallery-item {
          border-radius: 16px; overflow: hidden; position: relative;
          transition: transform 0.3s;
        }

        .gallery-item:hover { transform: scale(1.02); }
        .gallery-item:hover .gallery-overlay { opacity: 1; }

        .gallery-item.tall { grid-row: span 2; }

        .gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .gallery-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(5,150,105,0.5), rgba(13,148,136,0.5));
          opacity: 0; transition: opacity 0.3s;
          display: flex; align-items: center; justify-content: center;
        }

        .gallery-overlay-text {
          color: #fff; font-size: 13px; font-weight: 600;
          letter-spacing: 0.05em;
        }

        /* ── WHY ── */
        .why-section { background: #f5f3ff; }

        .why-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 24px; margin-top: 56px;
        }

        .why-card {
          background: var(--white);
          border-radius: 20px;
          padding: 36px 28px;
          border: 1px solid #ede9fe;
          transition: all 0.3s;
        }

        .why-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(5,150,105,0.1); }

        .why-num {
          font-family: 'Fraunces', serif;
          font-size: 48px; font-weight: 700; color: var(--emerald-light);
          line-height: 1; margin-bottom: 16px; letter-spacing: -0.03em;
        }

        .why-title { font-size: 18px; font-weight: 700; color: var(--navy); margin-bottom: 10px; }
        .why-desc { font-size: 14px; color: var(--slate); line-height: 1.7; }

        /* ── CTA BANNER ── */
        .cta-section {
          margin: 0 64px 80px;
          background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%);
          border-radius: 28px;
          padding: 64px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 40px;
          position: relative; overflow: hidden;
        }

        .cta-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 50% 80% at 100% 50%, rgba(5,150,105,0.2), transparent);
        }

        .cta-text { position: relative; z-index: 2; }

        .cta-title {
          font-family: 'Fraunces', serif;
          font-size: 36px; font-weight: 700; color: #fff;
          letter-spacing: -0.02em; margin-bottom: 12px; line-height: 1.2;
        }

        .cta-sub { font-size: 15px; color: #94a3b8; }

        .cta-action { position: relative; z-index: 2; flex-shrink: 0; }

        /* ── FOOTER ── */
        footer {
          background: var(--navy);
          padding: 40px 64px;
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .footer-logo { font-size: 14px; font-weight: 700; color: #fff; }
        .footer-copy { font-size: 12px; color: #475569; }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes shapeFloat {
          from { transform: translateY(0px); }
          to   { transform: translateY(-14px); }
        }

        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; }
          .hero-right { display: none; }
          .section, .kategori-section, .why-section { padding: 60px 24px; }
          .layanan-grid { grid-template-columns: repeat(2, 1fr); }
          .why-grid { grid-template-columns: 1fr; }
          .gallery-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
          .gallery-item.tall { grid-row: span 1; }
          .nav { padding: 16px 24px; }
          .nav.scrolled { padding: 12px 24px; }
          .nav-links { display: none; }
          .cta-section { margin: 0 24px 60px; padding: 40px 28px; flex-direction: column; }
          footer { padding: 28px 24px; flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>

      <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.4s' }}>

        {/* NAVBAR */}
        <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
          <a href="#" className="nav-logo">
            <div className="nav-logo-dot">🏥</div>
            Posyandu ILP
          </a>
          <ul className="nav-links">
            <li><a href="#">Beranda</a></li>
            <li><a href="#layanan">Layanan</a></li>
            <li><a href="#galeri">Galeri</a></li>
            <li><a href="#tentang">Tentang</a></li>
          </ul>
          <Link href="/login" className="nav-cta">
            Masuk ke Sistem →
          </Link>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="shape shape-1" />
          <div className="shape shape-2" />

          <div className="hero-left">
            <div className="hero-badge">✦ Posyandu Digital 2026</div>
            <h1 className="hero-title">
              Kesehatan <em>prima</em><br />untuk seluruh<br />warga desa
            </h1>
            <p className="hero-desc">
              Sistem informasi posyandu terintegrasi untuk pemantauan kesehatan
              ibu, balita, remaja, dan lansia secara modern dan efisien.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="btn-primary">
                Mulai Sekarang →
              </Link>
              <a href="#layanan" className="btn-ghost">
                Lihat Layanan
              </a>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hstat-num">9</div>
                <div className="hstat-label">Posyandu Aktif</div>
              </div>
              <div>
                <div className="hstat-num">5</div>
                <div className="hstat-label">Kategori Peserta</div>
              </div>
              <div>
                <div className="hstat-num">100%</div>
                <div className="hstat-label">Data Digital</div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="img-card-main">
              <Image src="/images/posy1.jpeg" alt="Posyandu" width={560} height={380} className="rounded-2xl object-cover" style={{ height: 380, objectFit: 'cover' }} />
            </div>
            <div className="img-float img-float-1">
              <div className="float-icon">👶</div>
              <div>
                <div className="float-text-big">Balita Sehat</div>
                <div className="float-text-small">Pemantauan rutin</div>
              </div>
            </div>
            <div className="img-float img-float-2">
              <div className="float-icon">📊</div>
              <div>
                <div className="float-text-big">Data Real-time</div>
                <div className="float-text-small">Terupdate otomatis</div>
              </div>
            </div>
          </div>
        </section>

        {/* LAYANAN */}
        <section className="section" id="layanan">
          <div className="section-label">✦ Fitur Utama</div>
          <h2 className="section-title">Layanan lengkap<br />dalam satu platform</h2>
          <p className="section-sub">Semua kebutuhan pencatatan dan pemantauan posyandu tersedia secara digital dan mudah diakses.</p>

          <div className="layanan-grid">
            {[
              { icon: "📝", title: "Pendaftaran", desc: "Daftarkan peserta baru dengan mudah lengkap dengan data identitas dan kategori." },
              { icon: "🩺", title: "Pemeriksaan", desc: "Catat hasil pemeriksaan kesehatan secara real-time dan terstruktur." },
              { icon: "💊", title: "Pelayanan", desc: "Kelola pemberian vitamin, imunisasi, dan layanan kesehatan lainnya." },
              { icon: "📊", title: "Laporan", desc: "Generate laporan bulanan otomatis untuk semua kategori peserta." },
            ].map((item, i) => (
              <div key={i} className="layanan-card">
                <div className="layanan-icon">{item.icon}</div>
                <div className="layanan-title">{item.title}</div>
                <div className="layanan-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* KATEGORI */}
        <section className="kategori-section">
          <div className="kategori-bg" />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="section-label">✦ Peserta</div>
            <h2 className="section-title">Melayani semua<br />kelompok usia</h2>
            <p className="section-sub">Sistem kami dirancang khusus untuk menangani berbagai kategori peserta posyandu.</p>
            <div className="kategori-pills">
              {[
                { emoji: "👶", name: "Balita" },
                { emoji: "🤰", name: "Ibu Hamil" },
                { emoji: "🍼", name: "Ibu Nifas & Menyusui" },
                { emoji: "🧒", name: "Remaja" },
                { emoji: "👴", name: "Lansia" },
              ].map((k, i) => (
                <div key={i} className="kat-pill">
                  <span className="kat-emoji">{k.emoji}</span>
                  <span className="kat-name">{k.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="section" id="galeri">
          <div className="section-label">✦ Galeri</div>
          <h2 className="section-title">Kegiatan posyandu<br />kami</h2>
          <div className="gallery-grid">
            <div className="gallery-item tall">
              <Image src="/images/posy1.jpeg" alt="Kegiatan" fill style={{ objectFit: 'cover' }} />
              <div className="gallery-overlay"><span className="gallery-overlay-text">Posyandu Aktif</span></div>
            </div>
            {["posy2","posy3","posy4","posy6"].map((img, i) => (
              <div key={i} className="gallery-item">
                <Image src={`/images/${img}.jpeg`} alt="Kegiatan" fill style={{ objectFit: 'cover' }} />
                <div className="gallery-overlay"><span className="gallery-overlay-text">Kegiatan Rutin</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY */}
        <section className="why-section" id="tentang">
          <div className="section-label">✦ Mengapa Digital?</div>
          <h2 className="section-title">Lebih cepat, akurat,<br />dan terpercaya</h2>
          <div className="why-grid">
            {[
              { num: "01", title: "Cepat & Efisien", desc: "Proses pendaftaran dan pencatatan data jauh lebih cepat dibanding metode manual dengan kertas." },
              { num: "02", title: "Data Real-time", desc: "Semua data tersinkronisasi secara langsung sehingga bidan dan kader bisa memantau kapan saja." },
              { num: "03", title: "Aman & Terstruktur", desc: "Data tersimpan di database yang aman dengan akses berbasis peran untuk menjaga privasi peserta." },
            ].map((item, i) => (
              <div key={i} className="why-card">
                <div className="why-num">{item.num}</div>
                <div className="why-title">{item.title}</div>
                <div className="why-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="cta-section">
          <div className="cta-bg" />
          <div className="cta-text">
            <div className="cta-title">Siap memulai<br />posyandu digital?</div>
            <div className="cta-sub">Masuk ke sistem dan mulai catat data peserta hari ini.</div>
          </div>
          <div className="cta-action">
            <Link href="/login" className="btn-primary" style={{ fontSize: 15, padding: '16px 36px' }}>
              Login Sekarang →
            </Link>
          </div>
        </div>

        {/* FOOTER */}
        <footer>
          <div className="footer-logo">🏥 Posyandu ILP</div>
          <div className="footer-copy">© 2026 Posyandu ILP Desa Sumberurip. All rights reserved.</div>
        </footer>

      </div>
    </>
  );
}