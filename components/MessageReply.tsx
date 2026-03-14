"use client";
import { Message } from "@/stores/chatStore";

interface MessageReplyProps {
  replyTo: Message;
  isOwn: boolean;
}

export default function MessageReply({ replyTo, isOwn }: MessageReplyProps) {
  return (
    <div style={{
      display: "flex",
      gap: "7px",
      padding: "5px 10px",
      borderRadius: "8px",
      marginBottom: "3px",
      background: "rgba(0,0,0,0.2)",
      border: "1px solid rgba(255,255,255,0.05)",
      borderLeft: `2px solid ${isOwn ? "rgba(79,142,247,0.5)" : "rgba(139,147,168,0.4)"}`,
      maxWidth: "320px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "11px",
          fontWeight: 500,
          color: isOwn ? "#4f8ef7" : "#6b7694",
          marginBottom: "2px",
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
        }}>
          {replyTo.username}
        </div>
        <div style={{
          fontSize: "12px",
          color: "#4f5872",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {replyTo.text || "Attachment"}
        </div>
      </div>
    </div>
  );
}