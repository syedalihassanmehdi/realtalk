"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/chat/general");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/chat/general");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google login failed");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .rt-root {
          min-height: 100vh;
          background-color: #080c14;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .rt-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(79,142,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,142,247,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }

        .rt-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 70%);
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .rt-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 2.5rem;
          backdrop-filter: blur(20px);
          animation: rt-fadein 0.4s ease both;
        }

        @keyframes rt-fadein {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .rt-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 2rem;
        }

        .rt-logo-mark {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #4f8ef7, #7c5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rt-logo-mark svg {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: #fff;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .rt-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #e8eaf0;
          letter-spacing: -0.02em;
        }

        .rt-heading {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #e8eaf0;
          letter-spacing: -0.03em;
          margin-bottom: 4px;
          line-height: 1.2;
        }

        .rt-subheading {
          font-size: 14px;
          color: #4f5872;
          margin-bottom: 2rem;
          font-weight: 400;
        }

        .rt-error {
          background: rgba(232,84,84,0.08);
          border: 1px solid rgba(232,84,84,0.2);
          color: #e88484;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }

        .rt-field {
          margin-bottom: 1rem;
        }

        .rt-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #6b7694;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .rt-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          color: #e8eaf0;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
          box-sizing: border-box;
        }

        .rt-input::placeholder {
          color: #2e3450;
        }

        .rt-input:focus {
          border-color: rgba(79,142,247,0.5);
          background: rgba(79,142,247,0.04);
        }

        .rt-btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #4f8ef7, #3d6fd4);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          margin-top: 0.25rem;
          letter-spacing: 0.01em;
        }

        .rt-btn-primary:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .rt-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .rt-btn-primary:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .rt-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.5rem 0;
        }

        .rt-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .rt-divider-text {
          font-size: 12px;
          color: #2e3450;
        }

        .rt-btn-google {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 11px;
          font-size: 14px;
          font-weight: 500;
          color: #8b93a8;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .rt-btn-google:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.12);
          color: #e8eaf0;
          transform: translateY(-1px);
        }

        .rt-footer {
          text-align: center;
          font-size: 13px;
          color: #4f5872;
          margin-top: 1.5rem;
        }

        .rt-link {
          color: #4f8ef7;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }

        .rt-link:hover {
          color: #7cb0fa;
        }

        .rt-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: rt-spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes rt-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="rt-root">
        <div className="rt-bg-grid" />
        <div className="rt-glow" />

        <div className="rt-card">
          <div className="rt-logo">
            <div className="rt-logo-mark">
              <svg viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <span className="rt-logo-text">RealTalk</span>
          </div>

          <h1 className="rt-heading">Welcome back</h1>
          <p className="rt-subheading">Sign in to continue</p>

          {error && <div className="rt-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="rt-field">
              <label className="rt-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rt-input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="rt-field">
              <label className="rt-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rt-input"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="rt-btn-primary">
              {loading && <span className="rt-spinner" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="rt-divider">
            <div className="rt-divider-line" />
            <span className="rt-divider-text">or</span>
            <div className="rt-divider-line" />
          </div>

          <button onClick={handleGoogle} className="rt-btn-google">
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <p className="rt-footer">
            No account?{" "}
            <Link href="/register" className="rt-link">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}