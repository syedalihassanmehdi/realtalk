"use client";
import PresenceDot from "./PresenceDot";

interface User {
  uid: string;
  displayName: string;
  photoURL?: string;
  lastSeen?: number;
}

interface UserListProps {
  users: User[];
  onlineUsers: string[];
}

function timeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  return Math.floor(hrs / 24) + "d ago";
}

const AVATAR_COLORS = ["#4f8ef7","#7c5cf6","#3ecf8e","#f5a623","#e85454","#06b6d4","#ec4899"];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function UserList({ users, onlineUsers }: UserListProps) {
  const online = users.filter((u) => onlineUsers.includes(u.uid));
  const offline = users.filter((u) => !onlineUsers.includes(u.uid));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500&display=swap');

        .ul-root {
          width: 220px;
          min-width: 220px;
          background: #0b0f1a;
          border-left: 1px solid rgba(255,255,255,0.055);
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: 'DM Sans', sans-serif;
          flex-shrink: 0;
        }

        @media (max-width: 1100px) { .ul-root { display: none; } }

        .ul-header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
          flex-shrink: 0;
        }

        .ul-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #e8eaf0;
          letter-spacing: -0.01em;
        }

        .ul-subtitle {
          font-size: 11px;
          color: #4f5872;
          margin-top: 2px;
        }

        .ul-scroller {
          flex: 1;
          overflow-y: auto;
          padding: 8px 6px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.05) transparent;
        }

        .ul-section {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #4f5872;
          text-transform: uppercase;
          padding: 8px 8px 4px;
        }

        .ul-member {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.12s;
          margin-bottom: 1px;
        }

        .ul-member:hover { background: rgba(255,255,255,0.04); }

        .ul-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .ul-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          overflow: hidden;
        }

        .ul-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .ul-presence {
          position: absolute;
          bottom: -1px;
          right: -1px;
        }

        .ul-info {
          flex: 1;
          min-width: 0;
        }

        .ul-name {
          font-size: 12.5px;
          color: #6b7694;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 400;
        }

        .ul-name.online { color: #8b93a8; }

        .ul-status {
          font-size: 11px;
          color: #4f5872;
          margin-top: 1px;
        }

        .ul-status.online { color: #2a9d6e; }
      `}</style>

      <div className="ul-root">
        <div className="ul-header">
          <div className="ul-title">Members</div>
          <div className="ul-subtitle">{onlineUsers.length} online · {users.length} total</div>
        </div>

        <div className="ul-scroller">
          {online.length > 0 && (
            <>
              <div className="ul-section">Online — {online.length}</div>
              {online.map((user) => (
                <div key={user.uid} className="ul-member">
                  <div className="ul-avatar-wrap">
                    <div className="ul-avatar" style={{ background: user.photoURL ? "transparent" : getAvatarColor(user.displayName || "?") }}>
                      {user.photoURL
                        ? <img src={user.photoURL} alt={user.displayName} />
                        : user.displayName?.charAt(0).toUpperCase()
                      }
                    </div>
                    <span className="ul-presence"><PresenceDot online size="sm" /></span>
                  </div>
                  <div className="ul-info">
                    <div className="ul-name online">{user.displayName}</div>
                    <div className="ul-status online">Online</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {offline.length > 0 && (
            <>
              <div className="ul-section" style={{ marginTop: online.length > 0 ? "10px" : "0" }}>
                Offline — {offline.length}
              </div>
              {offline.map((user) => (
                <div key={user.uid} className="ul-member" style={{ opacity: 0.5 }}>
                  <div className="ul-avatar-wrap">
                    <div className="ul-avatar" style={{ background: user.photoURL ? "transparent" : getAvatarColor(user.displayName || "?") }}>
                      {user.photoURL
                        ? <img src={user.photoURL} alt={user.displayName} />
                        : user.displayName?.charAt(0).toUpperCase()
                      }
                    </div>
                    <span className="ul-presence"><PresenceDot online={false} size="sm" /></span>
                  </div>
                  <div className="ul-info">
                    <div className="ul-name">{user.displayName}</div>
                    <div className="ul-status">
                      {user.lastSeen ? timeAgo(user.lastSeen) : "Offline"}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}