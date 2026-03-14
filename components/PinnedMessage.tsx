"use client";
import { Message } from "@/stores/chatStore";

interface PinnedMessageProps {
  message: Message | null;
  onUnpin: () => void;
}

export default function PinnedMessage({ message, onUnpin }: PinnedMessageProps) {
  if (!message) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "7px 20px",
      background: "rgba(79,142,247,0.06)",
      borderBottom: "1px solid rgba(79,142,247,0.12)",
      fontFamily: "'DM Sans', sans-serif",
      flexShrink: 0,
    }}>
      <div style={{
        width: "20px",
        height: "20px",
        borderRadius: "5px",
        background: "rgba(79,142,247,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width="11" height="11" fill="none" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M12 2v10M12 12l3 3M9 15l3-3M12 22v-7"/>
        </svg>
      </div>
      <span style={{
        fontSize: "11px",
        fontWeight: 500,
        color: "#4f8ef7",
        flexShrink: 0,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}>
        Pinned
      </span>
      <span style={{
        fontSize: "12px",
        color: "#6b7694",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        flex: 1,
      }}>
        {message.username}: {message.text}
      </span>
      <button
        onClick={onUnpin}
        style={{
          fontSize: "11px",
          color: "#2e3450",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "3px 8px",
          borderRadius: "5px",
          transition: "color 0.12s, background 0.12s",
          fontFamily: "'DM Sans', sans-serif",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#6b7694";
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#2e3450";
          (e.currentTarget as HTMLButtonElement).style.background = "none";
        }}
      >
        Unpin
      </button>
    </div>
  );
}