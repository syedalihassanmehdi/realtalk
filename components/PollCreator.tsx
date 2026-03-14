"use client";
import { useState } from "react";

interface PollCreatorProps {
  onCreate: (question: string, options: string[]) => void;
  onClose: () => void;
}

export default function PollCreator({ onCreate, onClose }: PollCreatorProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const addOption = () => setOptions([...options, ""]);
  const updateOption = (i: number, val: string) => {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  };

  const handleCreate = () => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2) return;
    onCreate(question.trim(), validOptions);
    onClose();
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    padding: "10px 13px",
    fontSize: "13.5px",
    color: "#e8eaf0",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500&display=swap');
        .pc-input:focus { border-color: rgba(79,142,247,0.4) !important; background: rgba(79,142,247,0.04) !important; }
        .pc-input::placeholder { color: #2e3450; }
      `}</style>

      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
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
          padding: "1.5rem",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          animation: "pc-in 0.2s ease both",
        }}>
          <style>{`@keyframes pc-in { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: none; } }`}</style>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                background: "rgba(79,142,247,0.1)",
                border: "1px solid rgba(79,142,247,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg width="15" height="15" fill="none" stroke="#4f8ef7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M18 20V10M12 20V4M6 20v-6"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 700, color: "#e8eaf0", letterSpacing: "-0.02em" }}>
                Create poll
              </span>
            </div>
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

          {/* Question */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#4f5872", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "6px" }}>
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something…"
              className="pc-input"
              style={inputStyle}
            />
          </div>

          {/* Options */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#4f5872", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "6px" }}>
              Options
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="pc-input"
                  style={inputStyle}
                />
              ))}
            </div>
          </div>

          {options.length < 5 && (
            <button
              onClick={addOption}
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#4f8ef7",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add option
            </button>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "13.5px",
                fontWeight: 500,
                color: "#6b7694",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #4f8ef7, #3d6fd4)",
                border: "none",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "13.5px",
                fontWeight: 500,
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
              }}
            >
              Create poll
            </button>
          </div>
        </div>
      </div>
    </>
  );
}