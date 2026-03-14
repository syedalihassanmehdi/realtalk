"use client";
import { useState } from "react";

interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Record<string, Reaction>;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function MessageReactions({ messageId, reactions, currentUserId, onReact }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "4px",
      marginTop: "5px",
      flexWrap: "wrap",
      position: "relative",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {Object.entries(reactions || {}).map(([emoji, reaction]) => {
        const isMe = reaction.userIds.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => onReact(messageId, emoji)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "20px",
              fontSize: "12px",
              border: `1px solid ${isMe ? "rgba(79,142,247,0.4)" : "rgba(255,255,255,0.07)"}`,
              background: isMe ? "rgba(79,142,247,0.1)" : "rgba(255,255,255,0.04)",
              color: isMe ? "#4f8ef7" : "#6b7694",
              cursor: "pointer",
              transition: "all 0.12s",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              if (!isMe) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.14)";
                (e.currentTarget as HTMLButtonElement).style.color = "#8b93a8";
              }
            }}
            onMouseLeave={(e) => {
              if (!isMe) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "#6b7694";
              }
            }}
          >
            <span style={{ fontSize: "13px" }}>{emoji}</span>
            <span style={{ fontSize: "11px", fontWeight: 500 }}>{reaction.count}</span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "#2e3450",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            transition: "all 0.12s",
            fontFamily: "sans-serif",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "#6b7694";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLButtonElement).style.color = "#2e3450";
          }}
        >
          +
        </button>

        {showPicker && (
          <div style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: 0,
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "6px 8px",
            display: "flex",
            gap: "4px",
            zIndex: 20,
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
          }}>
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => { onReact(messageId, emoji); setShowPicker(false); }}
                style={{
                  fontSize: "17px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "6px",
                  transition: "transform 0.1s, background 0.1s",
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.3)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLButtonElement).style.background = "none";
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}