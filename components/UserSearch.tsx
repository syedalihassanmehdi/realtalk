"use client";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

interface UserResult {
  uid: string;
  displayName: string;
  photoURL?: string;
  email?: string;
}

interface UserSearchProps {
  currentUserId: string;
  onSelectUser: (user: UserResult) => void;
  onClose: () => void;
}

const AVATAR_COLORS = ["#4f8ef7","#7c5cf6","#3ecf8e","#f5a623","#e85454","#06b6d4","#ec4899"];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function UserSearch({ currentUserId, onSelectUser, onClose }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [filtered, setFiltered] = useState<UserResult[]>([]);

  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList: UserResult[] = Object.values(data);
        setUsers(userList.filter((u) => u.uid !== currentUserId));
      }
    });
    return () => unsub();
  }, [currentUserId]);

  useEffect(() => {
    if (!query.trim()) { setFiltered(users); return; }
    setFiltered(
      users.filter((u) =>
        u.displayName?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase()) ||
        u.uid?.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, users]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500&display=swap');
        .us-input::placeholder { color: #2e3450; }
        .us-input:focus { border-color: rgba(79,142,247,0.4) !important; }
      `}</style>

      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          overflow: "hidden",
          animation: "us-in 0.18s ease both",
        }}>
          <style>{`@keyframes us-in { from { opacity:0; transform: scale(0.96) translateY(8px); } to { opacity:1; transform:none; } }`}</style>

          {/* Header */}
          <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px",
              padding: "0 12px",
              transition: "border-color 0.15s",
            }}>
              <svg width="13" height="13" fill="none" stroke="#2e3450" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="us-input"
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  fontSize: "13.5px",
                  color: "#e8eaf0",
                  fontFamily: "'DM Sans', sans-serif",
                  padding: "11px 0",
                }}
              />
              <button
                onClick={onClose}
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#4f5872",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 14 14">
                  <path d="M1 1l12 12M13 1L1 13"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={{ maxHeight: "280px", overflowY: "auto", padding: "6px", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.05) transparent" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#1e2535", fontSize: "13px" }}>
                {query ? `No results for "${query}"` : "No users found"}
              </div>
            ) : (
              filtered.map((user) => {
                const color = getAvatarColor(user.displayName || "?");
                const initial = user.displayName?.charAt(0).toUpperCase() || "?";
                return (
                  <button
                    key={user.uid}
                    onClick={() => onSelectUser(user)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.12s",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <div style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: user.photoURL ? "transparent" : color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#fff",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}>
                      {user.photoURL
                        ? <img src={user.photoURL} alt={initial} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        : initial
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 500, color: "#c8ccd8" }}>{user.displayName}</div>
                      <div style={{ fontSize: "12px", color: "#2e3450", marginTop: "1px" }}>{user.email}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div style={{ padding: "8px 14px 10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ fontSize: "11px", color: "#1e2535", textAlign: "center" }}>
              Click a user to start a direct message
            </p>
          </div>
        </div>
      </div>
    </>
  );
}