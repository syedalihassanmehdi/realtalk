"use client";
import { useState } from "react";

const STATUSES = [
  { dot: "#3ecf8e", label: "Available" },
  { dot: "#f5a623", label: "Away" },
  { dot: "#e85454", label: "Do not disturb" },
  { dot: "#1e2535", label: "Invisible" },
  { dot: "#4f8ef7", label: "In a meeting" },
  { dot: "#7c5cf6", label: "Focusing" },
];

interface StatusPickerProps {
  currentStatus: string;
  onSelect: (status: string) => void;
  onClose: () => void;
}

export default function StatusPicker({ currentStatus, onSelect, onClose }: StatusPickerProps) {
  const [custom, setCustom] = useState("");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500&display=swap');
        .sp-custom::placeholder { color: #2e3450; }
        .sp-custom:focus { border-color: rgba(79,142,247,0.4) !important; outline: none; }
      `}</style>

      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          padding: "1.25rem",
          width: "100%",
          maxWidth: "340px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          animation: "sp-in 0.18s ease both",
        }}>
          <style>{`@keyframes sp-in { from { opacity:0; transform: scale(0.96) translateY(8px); } to { opacity:1; transform:none; } }`}</style>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "16px",
              fontWeight: 700,
              color: "#e8eaf0",
              letterSpacing: "-0.02em",
            }}>
              Set status
            </span>
            <button
              onClick={onClose}
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#4f5872",
                cursor: "pointer",
              }}
            >
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 14 14">
                <path d="M1 1l12 12M13 1L1 13"/>
              </svg>
            </button>
          </div>

          {/* Status list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "12px" }}>
            {STATUSES.map((s) => {
              const value = s.label;
              const isActive = currentStatus === value;
              return (
                <button
                  key={s.label}
                  onClick={() => { onSelect(value); onClose(); }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 10px",
                    borderRadius: "9px",
                    border: `1px solid ${isActive ? "rgba(79,142,247,0.25)" : "transparent"}`,
                    background: isActive ? "rgba(79,142,247,0.07)" : "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s, border-color 0.12s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                >
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: s.dot,
                    flexShrink: 0,
                    boxShadow: `0 0 0 2px ${s.dot}25`,
                  }} />
                  <span style={{
                    fontSize: "13.5px",
                    color: isActive ? "#c8ccd8" : "#6b7694",
                    fontWeight: isActive ? 500 : 400,
                  }}>
                    {s.label}
                  </span>
                  {isActive && (
                    <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="13" height="13" fill="none" stroke="#4f8ef7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom input */}
          <div style={{
            display: "flex",
            gap: "6px",
            padding: "10px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "10px",
          }}>
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && custom.trim()) { onSelect(custom.trim()); onClose(); } }}
              placeholder="Custom status…"
              className="sp-custom"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                fontSize: "13px",
                color: "#e8eaf0",
                fontFamily: "'DM Sans', sans-serif",
                padding: 0,
              }}
            />
            <button
              onClick={() => { if (custom.trim()) { onSelect(custom.trim()); onClose(); } }}
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #3d6fd4)",
                border: "none",
                borderRadius: "7px",
                padding: "5px 12px",
                fontSize: "12.5px",
                fontWeight: 500,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              Set
            </button>
          </div>
        </div>
      </div>
    </>
  );
}