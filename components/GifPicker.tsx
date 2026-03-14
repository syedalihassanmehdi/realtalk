"use client";
import { useState, useEffect } from "react";

interface GifResult {
  id: string;
  url: string;
  preview: string;
}

interface GifPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchGifs = async (q: string) => {
    setLoading(true);
    try {
      const term = q || "trending";
      const res = await fetch(
        "https://api.giphy.com/v1/gifs/" + (q ? "search" : "trending") +
        "?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&q=" + encodeURIComponent(term) +
        "&limit=12&rating=g"
      );
      const data = await res.json();
      setGifs(data.data.map((g: { id: string; images: { fixed_height: { url: string }; fixed_height_small: { url: string } } }) => ({
        id: g.id,
        url: g.images.fixed_height.url,
        preview: g.images.fixed_height_small.url,
      })));
    } catch {
      console.error("GIF search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { searchGifs(""); }, []);

  return (
    <div style={{
      position: "absolute",
      bottom: "calc(100% + 8px)",
      left: 0,
      width: "300px",
      background: "#111827",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      overflow: "hidden",
      zIndex: 30,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <div style={{
          flex: 1,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "0 10px",
        }}>
          <svg width="12" height="12" fill="none" stroke="#2e3450" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchGifs(query)}
            placeholder="Search GIFs…"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontSize: "12.5px",
              color: "#e8eaf0",
              fontFamily: "'DM Sans', sans-serif",
              padding: "7px 0",
            }}
          />
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

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "3px",
        padding: "8px",
        maxHeight: "220px",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.06) transparent",
      }}>
        {loading && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "24px", color: "#2e3450", fontSize: "13px" }}>
            Loading…
          </div>
        )}
        {!loading && gifs.map((gif) => (
          <button
            key={gif.id}
            onClick={() => { onSelect(gif.url); onClose(); }}
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "opacity 0.12s, transform 0.12s",
              aspectRatio: "1",
              background: "rgba(255,255,255,0.03)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.8";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            <img src={gif.preview} alt="gif" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </button>
        ))}
      </div>

      <div style={{
        textAlign: "center",
        fontSize: "10px",
        color: "#1e2535",
        padding: "5px 0 7px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        Powered by GIPHY
      </div>
    </div>
  );
}