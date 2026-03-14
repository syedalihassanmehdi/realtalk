"use client";
import { useEffect, useRef, useState } from "react";
import { Message, Room, User } from "@/stores/chatStore";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import FileUpload from "./FileUpload";
import MessageSearch from "./MessageSearch";
import VoiceRecorder from "./VoiceRecorder";
import GifPicker from "./GifPicker";
import PollCreator from "./PollCreator";
import ImageGallery from "./ImageGallery";

interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface TypingUser {
  userId: string;
  username: string;
}

interface ChatWindowProps {
  room: Room;
  messages: Message[];
  currentUser: User;
  typingUsers: TypingUser[];
  reactions: Record<string, Record<string, Reaction>>;
  onSendMessage: (text: string, replyTo?: Message) => void;
  onSendFile: (file: File) => void;
  onSendVoice: (blob: Blob) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onReact: (messageId: string, emoji: string) => void;
  onDelete: (messageId: string) => void;
  onEdit: (messageId: string, newText: string) => void;
  onSendGif: (url: string) => void;
  onSendPoll: (question: string, options: string[]) => void;
  onPinMessage: (messageId: string) => void;
  pinnedMessage?: import("@/stores/chatStore").Message | null;
  onUnpin: () => void;
}

export default function ChatWindow({
  room, messages, currentUser, typingUsers, reactions,
  onSendMessage, onSendFile, onTypingStart, onTypingStop,
  onReact, onDelete, onEdit, onSendVoice, onSendGif, onSendPoll, onPinMessage, pinnedMessage, onUnpin,
}: ChatWindowProps) {
  const [text, setText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim(), replyTo || undefined);
    setText("");
    setReplyTo(null);
    onTypingStop();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
    if (e.key === "Escape") setReplyTo(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTypingStart();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTypingStop(), 2000);
  };

  const visibleMessages = messages.filter((m) => !m.deleted && (m.text || m.fileUrl));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@300;400;500&display=swap');

        .cw-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #080c14;
          position: relative;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Topbar ── */
        .cw-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 54px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.015);
          backdrop-filter: blur(12px);
          flex-shrink: 0;
          gap: 12px;
        }

        .cw-topbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .cw-room-prefix {
          font-size: 17px;
          color: #4f8ef7;
          font-weight: 500;
          flex-shrink: 0;
        }

        .cw-room-name {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #e8eaf0;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cw-room-sep {
          width: 1px;
          height: 14px;
          background: rgba(255,255,255,0.1);
          flex-shrink: 0;
        }

        .cw-room-meta {
          font-size: 12px;
          color: #4f5872;
          white-space: nowrap;
        }

        .cw-topbar-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        .cw-topbar-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: #4f5872;
          cursor: pointer;
          transition: background 0.12s, color 0.12s;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
        }

        .cw-topbar-btn:hover, .cw-topbar-btn.active {
          background: rgba(255,255,255,0.05);
          color: #8b93a8;
        }

        .cw-topbar-btn svg {
          width: 14px;
          height: 14px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* ── Pinned message ── */
        .cw-pinned {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 20px;
          background: rgba(79,142,247,0.06);
          border-bottom: 1px solid rgba(79,142,247,0.12);
          flex-shrink: 0;
        }

        .cw-pinned-icon {
          width: 20px;
          height: 20px;
          border-radius: 5px;
          background: rgba(79,142,247,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cw-pinned-icon svg {
          width: 11px;
          height: 11px;
          fill: none;
          stroke: #4f8ef7;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .cw-pinned-label {
          font-size: 11px;
          font-weight: 500;
          color: #4f8ef7;
          flex-shrink: 0;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .cw-pinned-text {
          font-size: 12px;
          color: #6b7694;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .cw-pinned-unpin {
          font-size: 11px;
          color: #2e3450;
          background: none;
          border: none;
          cursor: pointer;
          padding: 3px 8px;
          border-radius: 5px;
          transition: color 0.12s, background 0.12s;
          font-family: 'DM Sans', sans-serif;
          flex-shrink: 0;
        }

        .cw-pinned-unpin:hover {
          color: #6b7694;
          background: rgba(255,255,255,0.04);
        }

        /* ── Messages ── */
        .cw-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.06) transparent;
        }

        .cw-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;
          color: #2e3450;
        }

        .cw-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cw-empty-icon svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: #2e3450;
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .cw-empty-text {
          font-size: 13px;
          color: #2e3450;
        }

        /* ── Reply preview ── */
        .cw-reply-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          background: rgba(79,142,247,0.05);
          border-top: 1px solid rgba(79,142,247,0.1);
          flex-shrink: 0;
        }

        .cw-reply-accent {
          width: 2px;
          height: 32px;
          border-radius: 2px;
          background: #4f8ef7;
          flex-shrink: 0;
        }

        .cw-reply-body {
          flex: 1;
          min-width: 0;
        }

        .cw-reply-name {
          font-size: 11px;
          font-weight: 500;
          color: #4f8ef7;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .cw-reply-text {
          font-size: 12px;
          color: #4f5872;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cw-reply-close {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          color: #4f5872;
          transition: all 0.12s;
          flex-shrink: 0;
        }

        .cw-reply-close:hover {
          background: rgba(255,255,255,0.08);
          color: #8b93a8;
        }

        .cw-reply-close svg {
          width: 10px;
          height: 10px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.5;
          stroke-linecap: round;
        }

        /* ── Input area ── */
        .cw-input-area {
          padding: 12px 16px 14px;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.015);
          flex-shrink: 0;
        }

        .cw-input-box {
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.15s;
        }

        .cw-input-box:focus-within {
          border-color: rgba(79,142,247,0.35);
        }

        .cw-input-toolbar {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 8px 10px 0;
        }

        .cw-toolbar-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #2e3450;
          background: none;
          border: none;
          transition: background 0.12s, color 0.12s;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: relative;
        }

        .cw-toolbar-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #6b7694;
        }

        .cw-toolbar-btn svg {
          width: 15px;
          height: 15px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .cw-toolbar-sep {
          width: 1px;
          height: 16px;
          background: rgba(255,255,255,0.06);
          margin: 0 4px;
        }

        .cw-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px 10px;
        }

        .cw-input-field {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 14px;
          color: #e8eaf0;
          font-family: 'DM Sans', sans-serif;
          padding: 4px 0;
        }

        .cw-input-field::placeholder {
          color: #2e3450;
        }

        .cw-send-btn {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: #4f8ef7;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, opacity 0.15s;
          flex-shrink: 0;
        }

        .cw-send-btn:hover:not(:disabled) {
          background: #3d6fd4;
          transform: translateY(-1px);
        }

        .cw-send-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .cw-send-btn svg {
          width: 14px;
          height: 14px;
          fill: none;
          stroke: #fff;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      `}</style>

      <div className="cw-root">
        {/* Topbar */}
        <div className="cw-topbar">
          <div className="cw-topbar-left">
            <span className="cw-room-prefix">{room.type === "group" ? "#" : "@"}</span>
            <span className="cw-room-name">{room.name}</span>
            {room.members && room.members.length > 0 && (
              <>
                <div className="cw-room-sep" />
                <span className="cw-room-meta">{room.members.length} members</span>
              </>
            )}
          </div>
          <div className="cw-topbar-actions">
            <button
              className={`cw-topbar-btn${showGallery ? " active" : ""}`}
              onClick={() => { setShowGallery(!showGallery); setShowSearch(false); }}
            >
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
              Media
            </button>
            <button
              className={`cw-topbar-btn${showSearch ? " active" : ""}`}
              onClick={() => { setShowSearch(!showSearch); setShowGallery(false); }}
            >
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Search
            </button>
          </div>
        </div>

        {/* Pinned message */}
        {pinnedMessage && (
          <div className="cw-pinned">
            <div className="cw-pinned-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2v10M12 12l3 3M9 15l3-3M12 22v-7"/></svg>
            </div>
            <span className="cw-pinned-label">Pinned</span>
            <span className="cw-pinned-text">{pinnedMessage.username}: {pinnedMessage.text}</span>
            <button className="cw-pinned-unpin" onClick={onUnpin}>Unpin</button>
          </div>
        )}

        {/* Messages */}
        <div className="cw-messages">
          {visibleMessages.length === 0 ? (
            <div className="cw-empty">
              <div className="cw-empty-icon">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <span className="cw-empty-text">No messages yet — say hello!</span>
            </div>
          ) : (
            visibleMessages.map((msg) => (
              <MessageBubble
                key={msg.id + msg.timestamp}
                message={msg}
                isOwn={msg.userId === currentUser.uid}
                reactions={reactions[msg.id] || {}}
                allMessages={messages}
                onReact={onReact}
                onDelete={onDelete}
                onEdit={onEdit}
                onReply={setReplyTo}
                onPin={onPinMessage}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <TypingIndicator typingUsers={typingUsers} />

        {/* Reply bar */}
        {replyTo && (
          <div className="cw-reply-bar">
            <div className="cw-reply-accent" />
            <div className="cw-reply-body">
              <div className="cw-reply-name">Replying to {replyTo.username}</div>
              <div className="cw-reply-text">{replyTo.text}</div>
            </div>
            <button className="cw-reply-close" onClick={() => setReplyTo(null)}>
              <svg viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13"/></svg>
            </button>
          </div>
        )}

        {/* Input */}
        <div className="cw-input-area">
          <div className="cw-input-box">
            <div className="cw-input-toolbar">
              <FileUpload onFileSelect={onSendFile} />
              <VoiceRecorder onRecordingComplete={onSendVoice} />
              <div className="cw-toolbar-sep" />
              <button
                type="button"
                className="cw-toolbar-btn"
                onClick={() => setShowGif(!showGif)}
                title="GIF"
              >
                GIF
                {showGif && <GifPicker onSelect={(url) => { onSendGif(url); setShowGif(false); }} onClose={() => setShowGif(false)} />}
              </button>
              <button
                type="button"
                className="cw-toolbar-btn"
                onClick={() => setShowPoll(true)}
                title="Poll"
              >
                <svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="cw-input-row">
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder={"Message " + (room.type === "group" ? "#" : "@") + room.name}
                  className="cw-input-field"
                />
                <button type="submit" disabled={!text.trim()} className="cw-send-btn">
                  <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {showSearch && <MessageSearch messages={messages} onClose={() => setShowSearch(false)} />}
        {showGallery && <ImageGallery messages={messages} onClose={() => setShowGallery(false)} />}
        {showPoll && <PollCreator onCreate={onSendPoll} onClose={() => setShowPoll(false)} />}
      </div>
    </>
  );
}