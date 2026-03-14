"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, set, remove, update } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { getSocket } from "@/lib/socket";
import { useChatStore, Message, Room, Reaction } from "@/stores/chatStore";
import { onValue as onValueOnce } from "firebase/database";
import ChatWindow from "@/components/ChatWindow";
import RoomList from "@/components/RoomList";
import UserList from "@/components/UserList";
import UserSearch from "@/components/UserSearch";
import { useNotifications } from "@/hooks/useNotifications";
import { v4 as uuidv4 } from "uuid";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [newRoomName, setNewRoomName] = useState("");
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [dmUsername, setDmUsername] = useState("");
  const [showDm, setShowDm] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [reactions, setReactions] = useState<Record<string, Record<string, Reaction>>>({});

  const {
    currentUser, currentRoom, rooms, messages, typingUsers, onlineUsers,
    unreadCounts, setCurrentUser, setCurrentRoom, setRooms, setMessages,
    addMessage, setOnlineUsers, addTypingUser, removeTypingUser,
    incrementUnread, clearUnread, updateMessage, deleteMessage,
  } = useChatStore();
  const { sendNotification } = useNotifications(currentUser?.uid || "");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/login"); return; }
      const userData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL || "",
        lastSeen: Date.now(),
      };
      setCurrentUser(userData);
      set(ref(db, "users/" + user.uid), userData);
    });
    return () => unsub();
  }, [router, setCurrentUser]);

  useEffect(() => {
    const roomsRef = ref(db, "rooms");
    const unsub = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomList: Room[] = Object.values(data);
        setRooms(roomList);
        const found = roomList.find((r) => r.id === roomId);
        if (found) setCurrentRoom(found);
      } else {
        const defaultRoom: Room = { id: "general", name: "general", type: "group", members: [] };
        set(ref(db, "rooms/general"), defaultRoom);
        setRooms([defaultRoom]);
        setCurrentRoom(defaultRoom);
      }
    });
    return () => unsub();
  }, [roomId, setRooms, setCurrentRoom]);

  useEffect(() => {
    if (!roomId) return;
    const msgsRef = ref(db, "messages/" + roomId);
    const unsub = onValue(msgsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgList: Message[] = Object.values(data);
        msgList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgList);
      } else {
        setMessages([]);
      }
    });
    return () => unsub();
  }, [roomId, setMessages]);

  useEffect(() => {
    if (!roomId) return;
    const reactionsRef = ref(db, "reactions/" + roomId);
    const unsub = onValue(reactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setReactions(data);
      else setReactions({});
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    if (currentRoom) {
      clearUnread(currentRoom.id);
      messages.forEach((msg) => {
        if (!msg.readBy?.includes(currentUser?.uid || "")) {
          update(ref(db, "messages/" + currentRoom.id + "/" + msg.id), {
            readBy: [...(msg.readBy || []), currentUser?.uid || ""],
          });
        }
      });
    }
  }, [currentRoom?.id, messages.length]);

  useEffect(() => {
    if (!currentUser) return;
    const allRoomsRef = ref(db, "rooms");
    const unsub = onValue(allRoomsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const roomList: Room[] = Object.values(data);
      roomList.forEach((room) => {
        if (room.id === roomId) return;
        const msgsRef = ref(db, "messages/" + room.id);
        onValue(msgsRef, (snap) => {
          const msgs = snap.val();
          if (!msgs) return;
          const msgList: Message[] = Object.values(msgs);
          const unread = msgList.filter(
            (m) => !m.readBy?.includes(currentUser.uid)
          ).length;
          if (unread > 0) {
            useChatStore.getState().unreadCounts[room.id] !== unread &&
            useChatStore.setState((state) => ({
              unreadCounts: { ...state.unreadCounts, [room.id]: unread },
            }));
          }
        }, { onlyOnce: true });
      });
    }, { onlyOnce: true });
    return () => unsub();
  }, [currentUser, roomId]);

  useEffect(() => {
    if (!currentUser) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.off("message");
    socket.off("typing-start");
    socket.off("typing-stop");
    socket.off("presence-update");
    socket.off("message-deleted");
    socket.off("message-edited");

    socket.emit("user-join", { userId: currentUser.uid, username: currentUser.displayName });
    socket.emit("join-room", { roomId, userId: currentUser.uid });

    socket.on("message", (message: Message) => {
      addMessage(message);
      set(ref(db, "messages/" + message.roomId + "/" + message.id), message);
      if (message.roomId !== roomId) {
        incrementUnread(message.roomId);
        sendNotification(
          message.username,
          message.text || "Sent an attachment",
          "/chat/" + message.roomId
        );
      }
    });

    socket.on("message-deleted", ({ messageId }: { messageId: string }) => {
      deleteMessage(messageId);
    });

    socket.on("message-edited", ({ messageId, text }: { messageId: string; text: string }) => {
      updateMessage(messageId, { text, edited: true });
    });

    socket.on("typing-start", ({ userId, username }: { userId: string; username: string }) => {
      if (userId !== currentUser.uid) addTypingUser({ userId, username });
    });

    socket.on("typing-stop", ({ userId }: { userId: string }) => {
      removeTypingUser(userId);
    });

    socket.on("presence-update", ({ userId, status }: { userId: string; status: string }) => {
      if (status === "online") setOnlineUsers([...onlineUsers, userId]);
      else setOnlineUsers(onlineUsers.filter((id) => id !== userId));
    });

    return () => {
      socket.off("message");
      socket.off("typing-start");
      socket.off("typing-stop");
      socket.off("presence-update");
      socket.off("message-deleted");
      socket.off("message-edited");
    };
  }, [currentUser, roomId]);

  const handleSendMessage = (text: string, replyTo?: Message) => {
    if (!currentUser || !currentRoom) return;
    const socket = getSocket();
    const message: Message = {
      id: uuidv4(),
      roomId: currentRoom.id,
      userId: currentUser.uid,
      username: currentUser.displayName,
      avatar: currentUser.photoURL,
      text,
      timestamp: Date.now(),
      readBy: [currentUser.uid],
      replyTo: replyTo ? { id: replyTo.id, username: replyTo.username, text: replyTo.text } : undefined,
    };
    socket.emit("send-message", message);
    update(ref(db, "rooms/" + currentRoom.id), {
      lastMessage: text,
      lastMessageTime: Date.now(),
    });
  };

  const handleSendGif = (gifUrl: string) => {
    if (!currentUser || !currentRoom) return;
    const socket = getSocket();
    const message: Message = {
      id: uuidv4(),
      roomId: currentRoom.id,
      userId: currentUser.uid,
      username: currentUser.displayName,
      avatar: currentUser.photoURL,
      fileUrl: gifUrl,
      fileType: "image/gif",
      fileName: "GIF",
      timestamp: Date.now(),
      readBy: [currentUser.uid],
    };
    socket.emit("send-message", message);
  };

  const handleSendPoll = (question: string, options: string[]) => {
    if (!currentUser || !currentRoom) return;
    const socket = getSocket();
    const message: Message = {
      id: uuidv4(),
      roomId: currentRoom.id,
      userId: currentUser.uid,
      username: currentUser.displayName,
      avatar: currentUser.photoURL,
      text: "Created a poll: " + question,
      poll: { question, options, votes: {} },
      timestamp: Date.now(),
      readBy: [currentUser.uid],
    };
    socket.emit("send-message", message);
  };

  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);

  const handlePinMessage = async (messageId: string) => {
    if (!currentRoom) return;
    const msg = messages.find((m) => m.id === messageId);
    if (msg) {
      setPinnedMessage(msg);
      await set(ref(db, "rooms/" + currentRoom.id + "/pinnedMessage"), {
        id: msg.id,
        text: msg.text,
        username: msg.username,
        timestamp: msg.timestamp,
        userId: msg.userId,
        roomId: msg.roomId,
      });
    }
  };

  const handleUnpin = async () => {
    if (!currentRoom) return;
    setPinnedMessage(null);
    await set(ref(db, "rooms/" + currentRoom.id + "/pinnedMessage"), null);
  };

  const handleSaveMessage = async (message: Message) => {
    if (!currentUser) return;
    const saveRef = ref(db, "saved/" + currentUser.uid + "/" + message.id);
    await set(saveRef, {
      id: message.id,
      messageId: message.id,
      text: message.text,
      username: message.username,
      roomId: message.roomId,
      timestamp: message.timestamp,
      savedAt: Date.now(),
    });
  };

  const handleSendVoice = async (blob: Blob) => {
    if (!currentUser || !currentRoom) return;
    const file = new File([blob], "voice-" + Date.now() + ".webm", { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      const socket = getSocket();
      const message: Message = {
        id: uuidv4(),
        roomId: currentRoom.id,
        userId: currentUser.uid,
        username: currentUser.displayName,
        avatar: currentUser.photoURL,
        fileUrl: data.url,
        fileType: "audio/webm",
        fileName: "Voice message",
        timestamp: Date.now(),
        readBy: [currentUser.uid],
      };
      socket.emit("send-message", message);
    }
  };

  const handleSendFile = async (file: File) => {
    if (!currentUser || !currentRoom) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      const socket = getSocket();
      const message: Message = {
        id: uuidv4(),
        roomId: currentRoom.id,
        userId: currentUser.uid,
        username: currentUser.displayName,
        fileUrl: data.url,
        fileType: file.type,
        fileName: file.name,
        timestamp: Date.now(),
      };
      socket.emit("send-message", message);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!currentRoom) return;
    const socket = getSocket();
    await remove(ref(db, "messages/" + currentRoom.id + "/" + messageId));
    deleteMessage(messageId);
    socket.emit("message-deleted", { roomId: currentRoom.id, messageId });
  };

  const handleEdit = async (messageId: string, newText: string) => {
    if (!currentRoom) return;
    const socket = getSocket();
    await update(ref(db, "messages/" + currentRoom.id + "/" + messageId), { text: newText, edited: true });
    updateMessage(messageId, { text: newText, edited: true });
    socket.emit("message-edited", { roomId: currentRoom.id, messageId, text: newText });
  };

  const handleTypingStart = () => {
    if (!currentUser || !currentRoom) return;
    getSocket().emit("typing-start", { roomId: currentRoom.id, userId: currentUser.uid, username: currentUser.displayName });
  };

  const handleTypingStop = () => {
    if (!currentUser || !currentRoom) return;
    getSocket().emit("typing-stop", { roomId: currentRoom.id, userId: currentUser.uid });
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    const reactionRef = ref(db, "reactions/" + roomId + "/" + messageId + "/" + emoji);
    const current = reactions[messageId]?.[emoji];
    if (current?.userIds.includes(currentUser.uid)) {
      const newUserIds = current.userIds.filter((id) => id !== currentUser.uid);
      if (newUserIds.length === 0) set(reactionRef, null);
      else set(reactionRef, { emoji, count: newUserIds.length, userIds: newUserIds });
    } else {
      const newUserIds = [...(current?.userIds || []), currentUser.uid];
      set(reactionRef, { emoji, count: newUserIds.length, userIds: newUserIds });
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    const newRoom: Room = {
      id: newRoomName.toLowerCase().replace(/\s+/g, "-"),
      name: newRoomName.toLowerCase().replace(/\s+/g, "-"),
      type: "group",
      members: [],
    };
    await set(ref(db, "rooms/" + newRoom.id), newRoom);
    setShowNewRoom(false);
    setNewRoomName("");
    router.push("/chat/" + newRoom.id);
  };

  const handleCreateDm = async () => {
    if (!dmUsername.trim() || !currentUser) return;
    const dmId = [currentUser.uid, dmUsername].sort().join("_dm_");
    const dmRoom: Room = {
      id: dmId,
      name: dmUsername,
      type: "private",
      members: [currentUser.uid, dmUsername],
    };
    await set(ref(db, "rooms/" + dmId), dmRoom);
    setShowDm(false);
    setDmUsername("");
    router.push("/chat/" + dmId);
  };

  const handleSelectUserForDm = async (user: { uid: string; displayName: string }) => {
    if (!currentUser) return;
    const dmId = [currentUser.uid, user.uid].sort().join("_dm_");
    const dmRoom: Room = {
      id: dmId,
      name: user.displayName,
      type: "private",
      members: [currentUser.uid, user.uid],
    };
    await set(ref(db, "rooms/" + dmId), dmRoom);
    setShowUserSearch(false);
    router.push("/chat/" + dmId);
  };

  if (!currentUser) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#080c14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          border: "2px solid rgba(79,142,247,0.2)",
          borderTop: "2px solid #4f8ef7",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: "#4f5872", fontSize: "14px" }}>Authenticating…</span>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#080c14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          border: "2px solid rgba(79,142,247,0.2)",
          borderTop: "2px solid #4f8ef7",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: "#4f5872", fontSize: "14px" }}>Loading room…</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@300;400;500&display=swap');

        .rt-chat-shell {
          display: flex;
          height: 100vh;
          background: #080c14;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Modal overlay ── */
        .rt-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
          animation: rt-overlay-in 0.15s ease both;
        }

        @keyframes rt-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .rt-modal {
          background: #111827;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 1.75rem;
          width: 100%;
          max-width: 380px;
          animation: rt-modal-in 0.2s ease both;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
        }

        @keyframes rt-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .rt-modal-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(79,142,247,0.1);
          border: 1px solid rgba(79,142,247,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .rt-modal-icon svg {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: #4f8ef7;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .rt-modal h3 {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #e8eaf0;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .rt-modal p {
          font-size: 13px;
          color: #4f5872;
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }

        .rt-modal-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          color: #e8eaf0;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
          box-sizing: border-box;
          margin-bottom: 1rem;
        }

        .rt-modal-input::placeholder {
          color: #2e3450;
        }

        .rt-modal-input:focus {
          border-color: rgba(79,142,247,0.5);
          background: rgba(79,142,247,0.04);
        }

        .rt-modal-actions {
          display: flex;
          gap: 8px;
        }

        .rt-modal-btn-cancel {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: #6b7694;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .rt-modal-btn-cancel:hover {
          background: rgba(255,255,255,0.07);
          color: #8b93a8;
        }

        .rt-modal-btn-confirm {
          flex: 1;
          background: linear-gradient(135deg, #4f8ef7, #3d6fd4);
          border: none;
          border-radius: 10px;
          padding: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
        }

        .rt-modal-btn-confirm:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `}</style>

      <div className="rt-chat-shell">
        <RoomList
          rooms={rooms}
          currentRoomId={currentRoom.id}
          onlineUsers={onlineUsers}
          currentUser={currentUser}
          unreadCounts={unreadCounts}
          onSelectRoom={(room) => router.push("/chat/" + room.id)}
          onCreateRoom={() => setShowNewRoom(true)}
          onNewDm={() => setShowUserSearch(true)}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <ChatWindow
            room={currentRoom}
            messages={messages}
            currentUser={currentUser}
            typingUsers={typingUsers}
            reactions={reactions}
            onSendMessage={(text, replyTo) => handleSendMessage(text, replyTo)}
            onSendFile={handleSendFile}
            onSendVoice={handleSendVoice}
            onSendGif={handleSendGif}
            onSendPoll={handleSendPoll}
            onPinMessage={handlePinMessage}
            pinnedMessage={pinnedMessage}
            onUnpin={handleUnpin}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            onReact={handleReact}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
        <UserList
          users={Array.from(new Set(rooms.flatMap((r) => r.members || []))).map((uid) => ({ uid, displayName: uid }))}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Create Channel Modal */}
      {showNewRoom && (
        <div className="rt-overlay">
          <div className="rt-modal">
            <div className="rt-modal-icon">
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            </div>
            <h3>New channel</h3>
            <p>Give your channel a name. Use lowercase letters, numbers, and hyphens.</p>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
              placeholder="e.g. design-feedback"
              className="rt-modal-input"
              autoFocus
            />
            <div className="rt-modal-actions">
              <button onClick={() => setShowNewRoom(false)} className="rt-modal-btn-cancel">Cancel</button>
              <button onClick={handleCreateRoom} className="rt-modal-btn-confirm">Create channel</button>
            </div>
          </div>
        </div>
      )}

      {/* User Search */}
      {showUserSearch && (
        <UserSearch
          currentUserId={currentUser.uid}
          onSelectUser={handleSelectUserForDm}
          onClose={() => setShowUserSearch(false)}
        />
      )}

      {/* Direct Message Modal */}
      {showDm && (
        <div className="rt-overlay">
          <div className="rt-modal">
            <div className="rt-modal-icon">
              <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            </div>
            <h3>New direct message</h3>
            <p>Enter a user ID to start a private conversation.</p>
            <input
              type="text"
              value={dmUsername}
              onChange={(e) => setDmUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateDm()}
              placeholder="User ID"
              className="rt-modal-input"
              autoFocus
            />
            <div className="rt-modal-actions">
              <button onClick={() => setShowDm(false)} className="rt-modal-btn-cancel">Cancel</button>
              <button onClick={handleCreateDm} className="rt-modal-btn-confirm">Start chat</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}