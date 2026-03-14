"use client";
import { useState } from "react";
import { Message, useChatStore } from "@/stores/chatStore";
import { format } from "date-fns";
import MessageReactions from "./MessageReactions";
import MessageReply from "./MessageReply";
import LinkPreview from "./LinkPreview";

function renderText(text: string) {
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const inlineCodeRegex = /`([^`]+)`/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts = text.split(codeBlockRegex);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <pre key={i} style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: "8px",
          padding: "10px 12px",
          marginTop: "6px",
          fontSize: "12px",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <code>{part}</code>
        </pre>
      );
    }
    const urlMatch = part.match(urlRegex);
    const inlineParts = part.split(inlineCodeRegex);
    return (
      <span key={i}>
        {inlineParts.map((p, j) =>
          j % 2 === 1 ? (
            <code key={j} style={{
              background: "rgba(0,0,0,0.25)",
              padding: "1px 5px",
              borderRadius: "4px",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#a78bfa",
            }}>{p}</code>
          ) : (
            <span key={j}>{p}</span>
          )
        )}
        {urlMatch && urlMatch[0] && <LinkPreview url={urlMatch[0]} />}
      </span>
    );
  });
}

interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  reactions?: Record<string, Reaction>;
  allMessages?: Message[];
  onReact?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newText: string) => void;
  onReply?: (message: Message) => void;
  onPin?: (messageId: string) => void;
}

const AVATAR_COLORS = ["#4f8ef7","#7c5cf6","#3ecf8e","#f5a623","#e85454","#06b6d4","#ec4899"];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function MessageBubble({ message, isOwn, reactions, allMessages, onReact, onDelete, onEdit, onReply, onPin }: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const [showMenu, setShowMenu] = useState(false);
  const currentUser = useChatStore((s) => s.currentUser);

  const time = message.timestamp ? format(new Date(message.timestamp), "HH:mm") : "";
  const displayName = isOwn ? (currentUser?.displayName || "You") : message.username;
  const avatarUrl = isOwn ? currentUser?.photoURL : message.avatar;
  const initial = displayName?.charAt(0).toUpperCase() || "?";
  const avatarColor = getAvatarColor(displayName || "?");
  const replyToMessage = message.replyTo ? allMessages?.find((m) => m.id === message.replyTo?.id) : null;

  const handleEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(message.id, editText.trim());
      setEditing(false);
      setShowMenu(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

        .mb-group {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          padding: 3px 0;
          margin-bottom: 4px;
          font-family: 'DM Sans', sans-serif;
        }

        .mb-group:hover .mb-actions { opacity: 1; }

        .mb-group.own { flex-direction: row-reverse; }

        .mb-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          overflow: hidden;
          margin-bottom: 2px;
        }

        .mb-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .mb-body {
          max-width: min(420px, 68%);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .mb-group.own .mb-body { align-items: flex-end; }

        .mb-sender {
          font-size: 11.5px;
          font-weight: 600;
          color: #8b93a8;
          margin-bottom: 2px;
          margin-left: 2px;
          letter-spacing: 0.01em;
        }

        .mb-bubble {
          padding: 9px 13px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.55;
          word-break: break-word;
          position: relative;
          cursor: default;
        }

        .mb-bubble.other {
          background: #1e2535;
          border: 1px solid rgba(255,255,255,0.09);
          color: #d8dce8;
          border-bottom-left-radius: 5px;
        }

        .mb-bubble.own {
          background: #1a4080;
          border: 1px solid rgba(79,142,247,0.35);
          color: #e8eef8;
          border-bottom-right-radius: 5px;
        }

        .mb-bubble.own .mb-edited {
          color: rgba(232,238,248,0.5);
        }

        .mb-edited {
          font-size: 11px;
          color: rgba(200,204,220,0.5);
          margin-left: 5px;
        }

        .mb-audio {
          padding: 6px 0;
        }

        .mb-audio audio {
          max-width: 240px;
          height: 32px;
        }

        .mb-actions {
          opacity: 0;
          display: flex;
          align-items: center;
          gap: 2px;
          transition: opacity 0.15s;
          margin-bottom: 4px;
        }

        .mb-action-btn {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b7694;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          transition: background 0.12s, color 0.12s;
        }

        .mb-action-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #c8ccd8;
        }

        .mb-action-btn svg {
          width: 12px;
          height: 12px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Context menu */
        .mb-menu {
          position: absolute;
          bottom: calc(100% + 6px);
          background: #111827;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          overflow: hidden;
          z-index: 20;
          min-width: 148px;
          padding: 4px;
        }

        .mb-group.own .mb-menu { right: 0; }
        .mb-group:not(.own) .mb-menu { left: 0; }

        .mb-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 7px 10px;
          font-size: 13px;
          color: #8b93a8;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s, color 0.1s;
          font-family: 'DM Sans', sans-serif;
        }

        .mb-menu-item:hover {
          background: rgba(255,255,255,0.05);
          color: #e8eaf0;
        }

        .mb-menu-item.danger { color: #e88484; }
        .mb-menu-item.danger:hover { background: rgba(232,84,84,0.08); color: #e85454; }

        .mb-menu-item svg {
          width: 13px;
          height: 13px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        .mb-menu-sep {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 3px 0;
        }

        /* Edit input */
        .mb-edit-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mb-edit-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(79,142,247,0.4);
          border-radius: 10px;
          padding: 8px 12px;
          color: #e8eaf0;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          min-width: 200px;
        }

        .mb-edit-save {
          font-size: 12px;
          font-weight: 500;
          color: #4f8ef7;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px 8px;
          border-radius: 6px;
          transition: background 0.12s;
          font-family: 'DM Sans', sans-serif;
        }

        .mb-edit-save:hover { background: rgba(79,142,247,0.1); }

        .mb-edit-cancel {
          font-size: 12px;
          color: #4f5872;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px 8px;
          border-radius: 6px;
          transition: background 0.12s;
          font-family: 'DM Sans', sans-serif;
        }

        .mb-edit-cancel:hover { background: rgba(255,255,255,0.04); color: #6b7694; }

        .mb-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 2px;
        }

        .mb-time {
          font-size: 10.5px;
          color: #4f5872;
          margin-left: 2px;
        }
      `}</style>

      <div className={`mb-group${isOwn ? " own" : ""}`}>
        {/* Avatar */}
        <div className="mb-avatar" style={{ background: avatarUrl ? "transparent" : avatarColor }}>
          {avatarUrl ? <img src={avatarUrl} alt={initial} /> : initial}
        </div>

        {/* Body */}
        <div className="mb-body">
          {!isOwn && <span className="mb-sender">{message.username}</span>}

          {replyToMessage && <MessageReply replyTo={replyToMessage} isOwn={isOwn} />}

          <div style={{ position: "relative" }}>
            {editing ? (
              <div className="mb-edit-wrap">
                <input
                  className="mb-edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEdit();
                    if (e.key === "Escape") setEditing(false);
                  }}
                  autoFocus
                />
                <button className="mb-edit-save" onClick={handleEdit}>Save</button>
                <button className="mb-edit-cancel" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            ) : (
              <div
                className={`mb-bubble ${isOwn ? "own" : "other"}`}
                onContextMenu={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
              >
                {message.fileType === "audio/webm" || message.fileType?.startsWith("audio/") ? (
                  <div className="mb-audio">
                    <audio controls src={message.fileUrl} />
                  </div>
                ) : message.fileType?.startsWith("image/") && message.fileUrl ? (
                  <div style={{ marginTop: "2px" }}>
                    <img
                      src={message.fileUrl}
                      alt="attachment"
                      style={{ maxWidth: "220px", borderRadius: "10px", display: "block" }}
                    />
                  </div>
                ) : message.poll ? null : (
                  message.text ? renderText(message.text) : null
                )}
                {message.edited && <span className="mb-edited">(edited)</span>}
              </div>
            )}

            {showMenu && (
              <div className="mb-menu">
                <button
                  className="mb-menu-item"
                  onClick={() => { onReply?.(message); setShowMenu(false); }}
                >
                  <svg viewBox="0 0 24 24"><path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><path d="M13 21l-4-4 4-4"/><path d="M9 17h9a2 2 0 002-2V9"/></svg>
                  Reply
                </button>
                <button
                  className="mb-menu-item"
                  onClick={() => { onPin?.(message.id); setShowMenu(false); }}
                >
                  <svg viewBox="0 0 24 24"><path d="M12 2v10M12 12l3 3M9 15l3-3M12 22v-7"/></svg>
                  Pin message
                </button>
                {isOwn && (
                  <>
                    <div className="mb-menu-sep" />
                    <button
                      className="mb-menu-item"
                      onClick={() => { setEditing(true); setShowMenu(false); }}
                    >
                      <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>
                    <button
                      className="mb-menu-item danger"
                      onClick={() => { onDelete?.(message.id); setShowMenu(false); }}
                    >
                      <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {reactions && onReact && (
            <MessageReactions
              messageId={message.id}
              reactions={reactions}
              currentUserId={message.userId}
              onReact={onReact}
            />
          )}

          <div className="mb-meta">
            <span className="mb-time">{time}</span>
          </div>
        </div>

        {/* Hover actions */}
        <div className="mb-actions">
          <button
            className="mb-action-btn"
            title="React"
            onClick={() => onReact?.(message.id, "👍")}
          >
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
          </button>
          <button
            className="mb-action-btn"
            title="Reply"
            onClick={() => onReply?.(message)}
          >
            <svg viewBox="0 0 24 24"><path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><path d="M13 21l-4-4 4-4"/><path d="M9 17h9a2 2 0 002-2V9"/></svg>
          </button>
          <button
            className="mb-action-btn"
            title="More"
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>
    </>
  );
}