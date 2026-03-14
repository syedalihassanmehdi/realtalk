"use client";
import { useState, useRef } from "react";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, disabled }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(blob);
        stream.getTracks().forEach((t) => t.stop());
        setSeconds(0);
      };

      mediaRecorder.start();
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return m + ":" + String(s % 60).padStart(2, "0");
  };

  if (recording) {
    return (
      <>
        <style>{`
          @keyframes vr-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
          .vr-pulse { animation: vr-pulse 1.2s ease infinite; }
        `}</style>
        <button
          type="button"
          onClick={stopRecording}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 8px",
            borderRadius: "20px",
            background: "rgba(232,84,84,0.12)",
            border: "1px solid rgba(232,84,84,0.3)",
            cursor: "pointer",
            color: "#e85454",
            fontFamily: "'DM Sans', sans-serif",
            flexShrink: 0,
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232,84,84,0.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(232,84,84,0.12)")}
        >
          <span
            className="vr-pulse"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#e85454",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.03em" }}>
            {formatTime(seconds)}
          </span>
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      disabled={disabled}
      title="Record voice message"
      style={{
        width: "28px",
        height: "28px",
        borderRadius: "7px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        color: "#2e3450",
        background: "none",
        border: "none",
        transition: "background 0.12s, color 0.12s",
        opacity: disabled ? 0.4 : 1,
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
          (e.currentTarget as HTMLButtonElement).style.color = "#6b7694";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "none";
        (e.currentTarget as HTMLButtonElement).style.color = "#2e3450";
      }}
    >
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
      </svg>
    </button>
  );
}