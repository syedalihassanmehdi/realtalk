"use client";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";

interface PollData {
  question: string;
  options: string[];
  votes: Record<string, string>;
}

interface PollMessageProps {
  messageId: string;
  roomId: string;
  poll: PollData;
  currentUserId: string;
}

export default function PollMessage({ messageId, roomId, poll, currentUserId }: PollMessageProps) {
  const totalVotes = Object.keys(poll.votes || {}).length;
  const userVote = poll.votes?.[currentUserId];

  const vote = (option: string) => {
    const voteRef = ref(db, "messages/" + roomId + "/" + messageId + "/poll/votes/" + currentUserId);
    set(voteRef, option);
  };

  const getCount = (option: string) =>
    Object.values(poll.votes || {}).filter((v) => v === option).length;

  const getPercent = (option: string) =>
    totalVotes === 0 ? 0 : Math.round((getCount(option) / totalVotes) * 100);

  return (
    <div style={{
      background: "rgba(0,0,0,0.2)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      padding: "12px 14px",
      maxWidth: "280px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        marginBottom: "10px",
      }}>
        <svg width="13" height="13" fill="none" stroke="#4f8ef7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
        <p style={{
          fontSize: "13.5px",
          fontWeight: 500,
          color: "#e8eaf0",
          lineHeight: 1.35,
        }}>
          {poll.question}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {poll.options.map((option) => {
          const pct = getPercent(option);
          const isVoted = userVote === option;

          return (
            <button
              key={option}
              onClick={() => vote(option)}
              style={{
                width: "100%",
                textAlign: "left",
                borderRadius: "9px",
                overflow: "hidden",
                border: `1px solid ${isVoted ? "rgba(79,142,247,0.4)" : "rgba(255,255,255,0.06)"}`,
                cursor: "pointer",
                background: "none",
                transition: "border-color 0.12s",
                position: "relative",
              }}
            >
              <div style={{
                position: "absolute",
                inset: 0,
                background: isVoted ? "rgba(79,142,247,0.12)" : "rgba(255,255,255,0.03)",
                width: pct + "%",
                transition: "width 0.4s ease",
                borderRadius: "8px",
              }} />
              <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 10px",
              }}>
                <span style={{
                  fontSize: "13px",
                  color: isVoted ? "#a5c4fb" : "#8b93a8",
                  fontWeight: isVoted ? 500 : 400,
                }}>
                  {option}
                </span>
                <span style={{
                  fontSize: "11px",
                  color: isVoted ? "#4f8ef7" : "#2e3450",
                  fontWeight: 500,
                }}>
                  {pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p style={{
        fontSize: "11px",
        color: "#2e3450",
        marginTop: "8px",
        textAlign: "right",
      }}>
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
      </p>
    </div>
  );
}