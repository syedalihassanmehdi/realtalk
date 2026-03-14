"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, onValue, remove } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { format } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";

interface SavedMessage {
  id: string;
  messageId: string;
  text: string;
  username: string;
  roomId: string;
  timestamp: number;
  savedAt: number;
}

export default function SavedPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedMessage[]>([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/login"); return; }
      setUserId(user.uid);
      const savedRef = ref(db, "saved/" + user.uid);
      onValue(savedRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list: SavedMessage[] = Object.values(data);
          list.sort((a, b) => b.savedAt - a.savedAt);
          setSaved(list);
        } else {
          setSaved([]);
        }
      });
    });
    return () => unsub();
  }, [router]);

  const handleDelete = (id: string) => {
    remove(ref(db, "saved/" + userId + "/" + id));
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition">Back</button>
          <h1 className="text-white font-bold text-xl">Saved messages</h1>
        </div>

        {saved.length === 0 && (
          <div className="text-center text-gray-500 mt-20">No saved messages yet. Right-click any message to save it.</div>
        )}

        <div className="space-y-3">
          {saved.map((msg) => (
            <div key={msg.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 text-sm font-medium">{msg.username}</span>
                  <span className="text-gray-500 text-xs">{format(new Date(msg.timestamp), "MMM d, HH:mm")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push("/chat/" + msg.roomId)}
                    className="text-gray-400 hover:text-indigo-400 text-xs transition"
                  >
                    Go to message
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="text-gray-500 hover:text-red-400 text-xs transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="text-gray-200 text-sm">{msg.text}</p>
              <p className="text-gray-600 text-xs mt-2">Saved {format(new Date(msg.savedAt), "MMM d, HH:mm")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
