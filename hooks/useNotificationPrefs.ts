import { create } from "zustand";

interface NotificationPrefs {
  dnd: boolean;
  mutedRooms: string[];
  toggleDnd: () => void;
  muteRoom: (roomId: string) => void;
  unmuteRoom: (roomId: string) => void;
  isRoomMuted: (roomId: string) => boolean;
}

export const useNotificationPrefs = create<NotificationPrefs>((set, get) => ({
  dnd: false,
  mutedRooms: JSON.parse(localStorage?.getItem("mutedRooms") || "[]"),
  toggleDnd: () => set((s) => ({ dnd: !s.dnd })),
  muteRoom: (roomId) => {
    const updated = [...get().mutedRooms, roomId];
    localStorage.setItem("mutedRooms", JSON.stringify(updated));
    set({ mutedRooms: updated });
  },
  unmuteRoom: (roomId) => {
    const updated = get().mutedRooms.filter((id) => id !== roomId);
    localStorage.setItem("mutedRooms", JSON.stringify(updated));
    set({ mutedRooms: updated });
  },
  isRoomMuted: (roomId) => get().mutedRooms.includes(roomId),
}));
