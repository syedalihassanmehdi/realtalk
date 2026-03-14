interface TypingUser {
  userId: string;
  username: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0].username} is typing`
      : typingUsers.length === 2
      ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing`
      : "Several people are typing";

  return (
    <>
      <style>{`
        @keyframes ti-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
        .ti-dot { animation: ti-bounce 1.4s infinite ease-in-out; }
        .ti-dot:nth-child(2) { animation-delay: 0.18s; }
        .ti-dot:nth-child(3) { animation-delay: 0.36s; }
      `}</style>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "5px 20px 6px",
        minHeight: "26px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="ti-dot"
              style={{
                display: "inline-block",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#4f5872",
              }}
            />
          ))}
        </div>
        <span style={{
          fontSize: "12px",
          color: "#4f5872",
          fontStyle: "italic",
        }}>
          {text}…
        </span>
      </div>
    </>
  );
}