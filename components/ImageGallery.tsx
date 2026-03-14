"use client";
import { Message } from "@/stores/chatStore";
import { useState } from "react";

interface ImageGalleryProps {
  messages: Message[];
  onClose: () => void;
}

export default function ImageGallery({ messages, onClose }: ImageGalleryProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const images = messages.filter((m) => m.fileType?.startsWith("image/") && m.fileUrl);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500&display=swap');

        .ig-panel {
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
          animation: ig-slide-in 0.2s ease both;
        }

        @keyframes ig-slide-in {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .ig-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        .ig-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #e8eaf0;
          letter-spacing: -0.01em;
        }

        .ig-count {
          font-size: 12px;
          color: #2e3450;
          margin-left: 6px;
        }

        .ig-close {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: #4f5872;
          cursor: pointer;
          transition: background 0.12s, color 0.12s;
        }

        .ig-close:hover { background: rgba(255,255,255,0.08); color: #8b93a8; }

        .ig-grid {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          align-content: start;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.06) transparent;
        }

        .ig-empty {
          grid-column: 1/-1;
          text-align: center;
          padding: 48px 0;
          color: #1e2535;
          font-size: 13px;
        }

        .ig-thumb {
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: none;
          cursor: pointer;
          padding: 0;
          background: rgba(255,255,255,0.03);
          transition: opacity 0.12s, transform 0.12s;
        }

        .ig-thumb:hover { opacity: 0.85; transform: scale(0.97); }

        .ig-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ig-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          cursor: zoom-out;
          animation: ig-lb-in 0.15s ease both;
        }

        @keyframes ig-lb-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ig-lightbox img {
          max-width: 90vw;
          max-height: 90vh;
          border-radius: 12px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
        }
      `}</style>

      <div className="ig-panel">
        <div className="ig-header">
          <span className="ig-title">Media <span className="ig-count">{images.length}</span></span>
          <button className="ig-close" onClick={onClose}>
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 14 14">
              <path d="M1 1l12 12M13 1L1 13"/>
            </svg>
          </button>
        </div>

        <div className="ig-grid">
          {images.length === 0 ? (
            <div className="ig-empty">No images shared yet</div>
          ) : (
            images.map((msg) => (
              <button key={msg.id} className="ig-thumb" onClick={() => setSelected(msg.fileUrl || null)}>
                <img src={msg.fileUrl} alt="shared" />
              </button>
            ))
          )}
        </div>
      </div>

      {selected && (
        <div className="ig-lightbox" onClick={() => setSelected(null)}>
          <img src={selected} alt="full size" />
        </div>
      )}
    </>
  );
}