"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email dan password wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login gagal");
        setLoading(false);
        return;
      }

      const role = (data.role || "").toLowerCase();

      localStorage.setItem("role", role);
      localStorage.setItem("nama", data.nama ?? "");
      localStorage.setItem("posId", data.currentPosId ?? "");
      localStorage.setItem("posyandu", data.posyandu ?? "");

      if (role === "bidan") router.push("/dashboard-bidan");
      else if (role === "kader") router.push("/dashboard-kader");
      else if (role === "admin") router.push("/dashboard-admin");
      else router.push("/login");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f5f3ff;
          overflow: hidden;
          position: relative;
        }

        /* ── decorative circles ── */
        .deco-circle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .circle-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%);
          top: -200px; left: -150px;
          animation: floatA 9s ease-in-out infinite alternate;
        }

        .circle-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          bottom: -150px; right: -100px;
          animation: floatB 11s ease-in-out infinite alternate;
        }

        .circle-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%);
          top: 35%; left: 35%;
          animation: floatA 13s ease-in-out infinite alternate-reverse;
        }

        /* dot pattern */
        .dot-pattern {
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, rgba(109,40,217,0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          z-index: 1;
        }

        /* ── left panel ── */
        .left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 70px;
          position: relative;
          z-index: 2;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 64px;
          opacity: 0;
          transform: translateY(-16px);
          animation: fadeUp 0.6s ease forwards;
        }

        .brand-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
        }

        .brand-name {
          font-size: 15px;
          font-weight: 800;
          color: #1e1b4b;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .hero-text {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.7s ease 0.1s forwards;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #7c3aed;
          margin-bottom: 20px;
          background: rgba(124,58,237,0.08);
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid rgba(124,58,237,0.15);
        }

        .hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(38px, 4vw, 56px);
          font-weight: 400;
          color: #1e1b4b;
          line-height: 1.15;
          margin-bottom: 20px;
        }

        .hero-title em {
          font-style: italic;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 15px;
          color: #6b7280;
          line-height: 1.75;
          max-width: 380px;
        }

        /* stats */
        .stats {
          display: flex;
          gap: 0;
          margin-top: 52px;
          opacity: 0;
          animation: fadeUp 0.7s ease 0.3s forwards;
          background: #fff;
          border-radius: 16px;
          padding: 24px 32px;
          box-shadow: 0 4px 24px rgba(109,40,217,0.08);
          border: 1px solid rgba(109,40,217,0.08);
          max-width: 420px;
        }

        .stat-item {
          flex: 1;
          text-align: center;
          position: relative;
        }

        .stat-item + .stat-item::before {
          content: '';
          position: absolute;
          left: 0; top: 10%; height: 80%;
          width: 1px;
          background: rgba(109,40,217,0.1);
        }

        .stat-num {
          font-size: 30px;
          font-weight: 800;
          color: #1e1b4b;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 3px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* feature pills */
        .feature-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 24px;
          opacity: 0;
          animation: fadeUp 0.7s ease 0.45s forwards;
        }

        .pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #4c1d95;
          background: rgba(124,58,237,0.07);
          border: 1px solid rgba(124,58,237,0.12);
          padding: 6px 12px;
          border-radius: 100px;
        }

        /* ── right panel ── */
        .right-panel {
          width: 480px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 44px;
          position: relative;
          z-index: 2;
        }

        .form-card {
          width: 100%;
          background: #fff;
          border-radius: 24px;
          padding: 44px 40px;
          box-shadow:
            0 0 0 1px rgba(109,40,217,0.07),
            0 20px 60px rgba(109,40,217,0.12),
            0 4px 16px rgba(0,0,0,0.04);
          opacity: 0;
          transform: translateY(24px);
          animation: fadeUp 0.7s ease 0.2s forwards;
        }

        .form-top-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7c3aed;
          background: rgba(124,58,237,0.06);
          padding: 5px 12px;
          border-radius: 100px;
          margin-bottom: 20px;
        }

        .form-heading {
          font-size: 26px;
          font-weight: 800;
          color: #1e1b4b;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }

        .form-sub {
          font-size: 13px;
          color: #9ca3af;
          margin-bottom: 36px;
        }

        .field-group { margin-bottom: 20px; }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 8px;
          transition: color 0.2s;
        }

        .field-label.active { color: #7c3aed; }

        .field-wrap { position: relative; }

        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 15px;
          opacity: 0.45;
          pointer-events: none;
          transition: opacity 0.2s;
        }

        .field-wrap:focus-within .field-icon { opacity: 1; }

        .field-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          background: #faf9ff;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          color: #1e1b4b;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: all 0.2s;
        }

        .field-input::placeholder { color: #d1d5db; }

        .field-input:focus {
          background: #fff;
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124,58,237,0.08);
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          margin-top: 8px;
          background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #fff;
          letter-spacing: 0.04em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(124,58,237,0.45);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .submit-btn .btn-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
          transform: translateX(-100%);
          animation: shine 2.5s infinite;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0 0;
        }

        .divider-line { flex: 1; height: 1px; background: #f3f4f6; }
        .divider-text { font-size: 11px; color: #d1d5db; letter-spacing: 0.05em; }

        .footer-note {
          margin-top: 24px;
          text-align: center;
          font-size: 11px;
          color: #d1d5db;
        }

        /* loading dots */
        .loading-dots { display: inline-flex; gap: 4px; align-items: center; }
        .dot {
          width: 5px; height: 5px;
          background: #fff;
          border-radius: 50%;
          animation: dotBounce 1.2s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shine {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(200%); }
        }

        @keyframes floatA {
          from { transform: scale(1) translate(0, 0); }
          to   { transform: scale(1.08) translate(15px, 20px); }
        }

        @keyframes floatB {
          from { transform: scale(1) translate(0, 0); }
          to   { transform: scale(1.06) translate(-20px, -15px); }
        }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }

        @media (max-width: 768px) {
          .left-panel { display: none; }
          .right-panel {
            width: 100%;
            padding: 32px 24px;
            align-items: flex-start;
            padding-top: 80px;
          }
          .form-card { padding: 32px 28px; }
        }
      `}</style>

      <div className="login-root" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s' }}>

        {/* background */}
        <div className="deco-circle circle-1" />
        <div className="deco-circle circle-2" />
        <div className="deco-circle circle-3" />
        <div className="dot-pattern" />

        {/* LEFT */}
        <div className="left-panel">
          <div className="brand">
            <div className="brand-icon">🏥</div>
            <span className="brand-name">Posyandu ILP</span>
          </div>

          <div className="hero-text">
            <div className="hero-eyebrow">
              ✦ Sistem Informasi Kesehatan
            </div>
            <h1 className="hero-title">
              Layanan <em>sehat</em><br />untuk semua<br />warga
            </h1>
            <p className="hero-sub">
              Platform terpadu untuk pemantauan kesehatan ibu, balita, remaja, dan lansia di seluruh posyandu.
            </p>
          </div>

          <div className="stats">
            <div className="stat-item">
              <div className="stat-num">9</div>
              <div className="stat-label">Posyandu</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">5</div>
              <div className="stat-label">Kategori</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">24/7</div>
              <div className="stat-label">Akses Data</div>
            </div>
          </div>

          <div className="feature-pills">
            <span className="pill">👶 Balita</span>
            <span className="pill">🤰 Ibu Hamil</span>
            <span className="pill">🧒 Remaja</span>
            <span className="pill">👴 Lansia</span>
            <span className="pill">🍼 Ibu Nifas</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-panel">
          <div className="form-card">
            <div className="form-top-badge">🔐 Portal Masuk</div>
            <h2 className="form-heading">Selamat datang!</h2>
            <p className="form-sub">Masuk ke akun Anda untuk melanjutkan</p>

            <form onSubmit={handleLogin}>
              <div className="field-group">
                <label className={`field-label ${focused === 'email' ? 'active' : ''}`}>
                  Email
                </label>
                <div className="field-wrap">
                  <span className="field-icon">✉️</span>
                  <input
                    type="email"
                    className="field-input"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className={`field-label ${focused === 'password' ? 'active' : ''}`}>
                  Password
                </label>
                <div className="field-wrap">
                  <span className="field-icon">🔒</span>
                  <input
                    type="password"
                    className="field-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                <span className="btn-shine" />
                {loading ? (
                  <span className="loading-dots">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </span>
                ) : (
                  "Masuk →"
                )}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">POSYANDU ILP SYSTEM</span>
              <div className="divider-line" />
            </div>

            <p className="footer-note">© 2026 Posyandu ILP · All rights reserved</p>
          </div>
        </div>

      </div>
    </>
  );
}