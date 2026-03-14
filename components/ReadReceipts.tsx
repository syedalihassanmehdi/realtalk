"use client";

interface ReadReceiptsProps {
  readBy: string[];
  currentUserId: string;
  totalMembers: number;
}

export default function ReadReceipts({ readBy, currentUserId, totalMembers }: ReadReceiptsProps) {
  const othersRead = readBy.filter((id) => id !== currentUserId);
  if (othersRead.length === 0) return null;

  const allRead = othersRead.length === totalMembers - 1;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "4px",
      marginTop: "3px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path
          d={allRead ? "M2 12l5 5L15 7M7 12l5 5L20 7" : "M5 12l5 5L20 7"}
          stroke={allRead ? "#4f8ef7" : "#2e3450"}
          strokeWidth="2.5"
        />
      </svg>
      <span style={{
        fontSize: "10.5px",
        color: allRead ? "#4f8ef7" : "#2e3450",
        fontWeight: allRead ? 500 : 400,
      }}>
        {allRead ? "Seen by all" : `Seen by ${othersRead.length}`}
      </span>
    </div>
  );
}