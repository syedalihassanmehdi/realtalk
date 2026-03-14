"use client";
import { Room, User } from "@/stores/chatStore";
import PresenceDot from "./PresenceDot";
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";

interface RoomListProps {
  rooms: Room[];
  currentRoomId?: string;
  onlineUsers: string[];
  currentUser: User;
  unreadCounts: Record<string, number>;
  onSelectRoom: (room: Room) => void;
  onCreateRoom: () => void;
  onNewDm: () => void;
}

const AVATAR_COLORS = ["#4f8ef7","#7c5cf6","#3ecf8e","#f5a623","#e85454","#06b6d4","#ec4899"];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function RoomList({ rooms, currentRoomId, onlineUsers, currentUser, unreadCounts, onSelectRoom, onCreateRoom, onNewDm }: RoomListProps) {
  const groupRooms = rooms.filter((r) => r.type === "group");
  const privateRooms = rooms.filter((r) => r.type === "private");
  const initial = currentUser.displayName?.charAt(0).toUpperCase() || "?";
  const avatarColor = getAvatarColor(currentUser.displayName || "?");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .rl-root {
          width: 240px;
          min-width: 240px;
          background: #0b0f1a;
          border-right: 1px solid rgba(255,255,255,0.055);
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: 'DM Sans', sans-serif;
          flex-shrink: 0;
        }

        /* Header */
        .rl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 14px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
          flex-shrink: 0;
        }

        .rl-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rl-logo-mark {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #4f8ef7, #7c5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rl-logo-mark svg {
          width: 14px;
          height: 14px;
          fill: none;
          stroke: #fff;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .rl-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #e8eaf0;
          letter-spacing: -0.03em;
        }

        .rl-header-actions {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .rl-icon-btn {
          width: 26px;
          height: 26px;
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
        }

        .rl-icon-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #6b7694;
        }

        .rl-icon-btn svg {
          width: 14px;
          height: 14px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Scroller */
        .rl-scroller {
          flex: 1;
          overflow-y: auto;
          padding: 8px 6px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.05) transparent;
        }

        /* Section label */
        .rl-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 8px 4px;
        }

        .rl-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #4f5872;
          text-transform: uppercase;
        }

        .rl-section-add {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #2e3450;
          background: none;
          border: none;
          transition: background 0.12s, color 0.12s;
          font-size: 14px;
          line-height: 1;
          font-family: 'DM Sans', sans-serif;
        }

        .rl-section-add:hover {
          background: rgba(255,255,255,0.05);
          color: #6b7694;
        }

        /* Channel item */
        .rl-channel {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 8px;
          border-radius: 8px;
          margin-bottom: 1px;
          cursor: pointer;
          border: none;
          background: none;
          text-align: left;
          transition: background 0.12s;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .rl-channel:hover { background: rgba(255,255,255,0.04); }

        .rl-channel.active {
          background: rgba(79,142,247,0.1);
        }

        .rl-channel.active .rl-ch-prefix { color: #4f8ef7; }
        .rl-channel.active .rl-ch-name { color: #e8eaf0; }

        .rl-ch-prefix {
          font-size: 14px;
          color: #1e2535;
          flex-shrink: 0;
          font-weight: 500;
          line-height: 1;
          width: 14px;
          text-align: center;
        }

        .rl-ch-name {
          font-size: 13px;
          color: #8b93a8;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 400;
        }

        .rl-channel.active .rl-ch-name { font-weight: 500; }

        .rl-badge {
          background: #e85454;
          color: #fff;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          padding: 1px 5px;
          min-width: 16px;
          text-align: center;
          flex-shrink: 0;
        }

        /* DM item */
        .rl-dm {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 8px;
          border-radius: 8px;
          margin-bottom: 1px;
          cursor: pointer;
          border: none;
          background: none;
          text-align: left;
          transition: background 0.12s;
          font-family: 'DM Sans', sans-serif;
        }

        .rl-dm:hover { background: rgba(255,255,255,0.04); }
        .rl-dm.active { background: rgba(79,142,247,0.1); }

        .rl-dm-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          color: #fff;
          flex-shrink: 0;
          position: relative;
        }

        .rl-dm-presence {
          position: absolute;
          bottom: -1px;
          right: -1px;
        }

        .rl-dm-name {
          font-size: 13px;
          color: #8b93a8;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rl-dm.active .rl-dm-name { color: #e8eaf0; font-weight: 500; }

        /* Footer */
        .rl-footer {
          padding: 10px 8px;
          border-top: 1px solid rgba(255,255,255,0.055);
          flex-shrink: 0;
        }

        .rl-user-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 9px;
          text-decoration: none;
          transition: background 0.12s;
          margin-bottom: 4px;
        }

        .rl-user-row:hover { background: rgba(255,255,255,0.04); }

        .rl-user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          flex-shrink: 0;
          overflow: hidden;
        }

        .rl-user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .rl-user-name {
          font-size: 13px;
          font-weight: 500;
          color: #8b93a8;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rl-user-sub {
          font-size: 11px;
          color: #4f5872;
        }

        .rl-footer-links {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 8px;
        }

        .rl-footer-link {
          font-size: 11.5px;
          color: #4f5872;
          text-decoration: none;
          transition: color 0.12s;
        }

        .rl-footer-link:hover { color: #8b93a8; }

        .rl-footer-dot {
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: #2e3450;
        }

        @media (max-width: 768px) {
          .rl-root {
            width: 52px;
            min-width: 52px;
          }
          .rl-logo-text, .rl-section-label, .rl-ch-name, .rl-dm-name,
          .rl-badge, .rl-user-name, .rl-user-sub, .rl-footer-links,
          .rl-section-add { display: none; }
          .rl-header { padding: 12px 8px; justify-content: center; }
          .rl-header-actions { display: none; }
          .rl-channel, .rl-dm { justify-content: center; padding: 8px 0; }
          .rl-ch-prefix { width: auto; }
          .rl-dm-avatar { width: 28px; height: 28px; }
          .rl-user-row { justify-content: center; padding: 6px 0; }
          .rl-section { justify-content: center; padding: 6px 0 2px; }
        }
      `}</style>

      <div className="rl-root">
        {/* Header */}
        <div className="rl-header">
          <div className="rl-logo">
            <div className="rl-logo-mark">
              <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <span className="rl-logo-text">RealTalk</span>
          </div>
          <div className="rl-header-actions">
            <ThemeToggle />
            <button className="rl-icon-btn" onClick={onCreateRoom} title="New channel">
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>

        {/* Scroller */}
        <div className="rl-scroller">
          {/* Channels */}
          <div className="rl-section">
            <span className="rl-section-label">Channels</span>
            <button className="rl-section-add" onClick={onCreateRoom}>+</button>
          </div>

          {groupRooms.map((room) => (
            <button
              key={room.id}
              className={`rl-channel${currentRoomId === room.id ? " active" : ""}`}
              onClick={() => onSelectRoom(room)}
            >
              <span className="rl-ch-prefix">#</span>
              <span className="rl-ch-name">{room.name}</span>
              {unreadCounts[room.id] > 0 && currentRoomId !== room.id && (
                <span className="rl-badge">
                  {unreadCounts[room.id] > 9 ? "9+" : unreadCounts[room.id]}
                </span>
              )}
            </button>
          ))}

          {/* DMs */}
          <div className="rl-section" style={{ marginTop: "12px" }}>
            <span className="rl-section-label">Direct Messages</span>
            <button className="rl-section-add" onClick={onNewDm}>+</button>
          </div>

          {privateRooms.map((room) => {
            const isOnline = room.members.some((m) => onlineUsers.includes(m));
            const dmColor = getAvatarColor(room.name || "?");
            return (
              <button
                key={room.id}
                className={`rl-dm${currentRoomId === room.id ? " active" : ""}`}
                onClick={() => onSelectRoom(room)}
              >
                <div className="rl-dm-avatar" style={{ background: dmColor }}>
                  {room.name?.charAt(0).toUpperCase() || "?"}
                  <span className="rl-dm-presence">
                    <PresenceDot online={isOnline} size="sm" />
                  </span>
                </div>
                <span className="rl-dm-name">{room.name}</span>
                {unreadCounts[room.id] > 0 && currentRoomId !== room.id && (
                  <span className="rl-badge">
                    {unreadCounts[room.id] > 9 ? "9+" : unreadCounts[room.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="rl-footer">
          <Link href="/profile" className="rl-user-row">
            <div className="rl-user-avatar" style={{ background: currentUser.photoURL ? "transparent" : avatarColor }}>
              {currentUser.photoURL
                ? <img src={currentUser.photoURL} alt={initial} />
                : initial
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="rl-user-name">{currentUser.displayName}</div>
              <div className="rl-user-sub">View profile</div>
            </div>
          </Link>
          <div className="rl-footer-links">
            <Link href="/saved" className="rl-footer-link">Saved</Link>
            <div className="rl-footer-dot" />
            <Link href="/security" className="rl-footer-link">Security</Link>
          </div>
        </div>
      </div>
    </>
  );
}