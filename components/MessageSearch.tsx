"use client";
import { useState } from "react";
import { Message } from "@/stores/chatStore";
import { format } from "date-fns";

interface MessageSearchProps {
  messages: Message[];
  onClose: () => void;
}

export default function MessageSearch({ messages, onClose }: MessageSearchProps) {
  const [query, setQuery] = useState("");

  const results = query.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500&display=swap');

        .ms-panel {
          position: absolute;
          top: 0;
          right: 0;
          width: 280px;
          height: 100%;
          background: #0d1120;
          border-left: 1px solid rgba(255,255,255,0.06);
          z-index: 20;
          display: flex;
          flex-direction: column;
          font-family: 'DM Sans', sans-serif;
          animation: ms-slide 0.2s ease both;
        }

        @keyframes ms-slide {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .ms-header {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        .ms-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 0 10px;
          transition: border-color 0.15s;
        }

        .ms-search-wrap:focus-within {
          border-color: rgba(79,142,247,0.35);
        }

        .ms-search-wrap svg {
          flex-shrink: 0;
        }

        .ms-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 13px;
          color: #e8eaf0;
          font-family: 'DM Sans', sans-serif;
          padding: 9px 0;
        }

        .ms-input::placeholder { color: #2e3450; }

        .ms-close {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: #4f5872;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.12s, color 0.12s;
        }

        .ms-close:hover { background: rgba(255,255,255,0.08); color: #8b93a8; }

        .ms-body {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.06) transparent;
        }

        .ms-empty {
          text-align: center;
          padding: 48px 0;
          color: #1e2535;
          font-size: 13px;
        }

        .ms-result {
          padding: 10px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          margin-bottom: 6px;
          transition: background 0.12s, border-color 0.12s;
          cursor: default;
        }

        .ms-result:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.08);
        }

        .ms-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .ms-result-name {
          font-size: 11.5px;
          font-weight: 500;
          color: #4f8ef7;
        }

        .ms-result-time {
          font-size: 10.5px;
          color: #2e3450;
        }

        .ms-result-text {
          font-size: 12.5px;
          color: #6b7694;
          line-height: 1.45;
        }

        .ms-hint {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #0d1120;
          text-align: center;
          padding-top: 48px;
          letter-spacing: -0.01em;
        }
      `}</style>

      <div className="ms-panel">
        <div className="ms-header">
          <div className="ms-search-wrap">
            <svg width="13" height="13" fill="none" stroke="#2e3450" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              autoFocus
              className="ms-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages…"
            />
            <button className="ms-close" onClick={onClose}>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 14 14">
                <path d="M1 1l12 12M13 1L1 13"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="ms-body">
          {query && results.length === 0 && (
            <div className="ms-empty">No results for "{query}"</div>
          )}
          {results.map((msg) => (
            <div key={msg.id} className="ms-result">
              <div className="ms-result-header">
                <span className="ms-result-name">{msg.username}</span>
                <span className="ms-result-time">{format(new Date(msg.timestamp), "MMM d, HH:mm")}</span>
              </div>
              <p className="ms-result-text">{msg.text}</p>
            </div>
          ))}
          {!query && (
            <div className="ms-hint">Start typing to search</div>
          )}
        </div>
      </div>
    </>
  );
}