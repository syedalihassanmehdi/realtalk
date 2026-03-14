"use client";
import { useEffect, useState } from "react";

interface PreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
}

interface LinkPreviewProps {
  url: string;
}

export default function LinkPreview({ url }: LinkPreviewProps) {
  const [preview, setPreview] = useState<PreviewData | null>(null);

  useEffect(() => {
    fetch("/api/link-preview?url=" + encodeURIComponent(url))
      .then((r) => r.json())
      .then((data) => { if (!data.error) setPreview(data); })
      .catch(() => {});
  }, [url]);

  if (!preview) return null;

  return (
    <div style={{
      marginTop: "8px",
      background: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderLeft: "2px solid #4f8ef7",
      borderRadius: "10px",
      overflow: "hidden",
      maxWidth: "260px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {preview.image && (
        <img
          src={preview.image}
          alt={preview.title}
          style={{ width: "100%", height: "110px", objectFit: "cover", display: "block" }}
        />
      )}
      <div style={{ padding: "8px 10px" }}>
        <p style={{
          color: "#e8eaf0",
          fontSize: "12px",
          fontWeight: 500,
          marginBottom: "3px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>{preview.title}</p>
        {preview.description && (
          <p style={{
            color: "#4f5872",
            fontSize: "11px",
            lineHeight: 1.4,
            marginBottom: "4px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>{preview.description.slice(0, 100)}</p>
        )}
        <p style={{
          color: "#4f8ef7",
          fontSize: "11px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          opacity: 0.7,
        }}>{url}</p>
      </div>
    </div>
  );
}