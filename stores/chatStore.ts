import { create } from "zustand";

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  avatar?: string;
  text?: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  timestamp: number;
  readBy?: string[];
  reactions?: Record<string, Reaction>;
  edited?: boolean;
  deleted?: boolean;
  poll?: {
    question: string;
    options: string[];
    votes: Record<string, string>;
  };
  pinned?: boolean;
  replyTo?: {
    id: string;
    username: string;
    text?: string;
  };
}

export interface Room {
  id: string;
  name: string;
  type: "group" | "private";
  members: string[];
  lastMessage?: string;
  lastMessageTime?: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface TypingUser {
  userId: string;
  username: string;
}

interface ChatStore {
  currentUser: User | null;
  currentRoom: Room | null;
  rooms: Room[];
  messages: Message[];
  onlineUsers: string[];
  typingUsers: TypingUser[];
  unreadCounts: Record<string, number>;
  setCurrentUser: (user: User | null) => void;
  setCurrentRoom: (room: Room | null) => void;
  setRooms: (rooms: Room[]) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  setOnlineUsers: (users: string[]) => void;
  addTypingUser: (user: TypingUser) => void;
  removeTypingUser: (userId: string) => void;
  incrementUnread: (roomId: string) => void;
  clearUnread: (roomId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  currentUser: null,
  currentRoom: null,
  rooms: [],
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  unreadCounts: {},
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setRooms: (rooms) => set({ rooms }),
  addMessage: (message) =>
    set((state) => ({
      messages: state.messages.find((m) => m.id === message.id)
        ? state.messages
        : [...state.messages, message],
    })),
  setMessages: (messages) => set({ messages }),
  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, ...updates } : m
      ),
    })),
  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addTypingUser: (user) =>
    set((state) => ({
      typingUsers: state.typingUsers.find((u) => u.userId === user.userId)
        ? state.typingUsers
        : [...state.typingUsers, user],
    })),
  removeTypingUser: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((u) => u.userId !== userId),
    })),
  incrementUnread: (roomId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [roomId]: (state.unreadCounts[roomId] || 0) + 1,
      },
    })),
  clearUnread: (roomId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [roomId]: 0 },
    })),
}));
