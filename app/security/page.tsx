"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, onValue, push, remove } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { format } from "date-fns";

interface LoginEntry {
  id: string;
  timestamp: number;
  userAgent: string;
  current?: boolean;
}

export default function SecurityPage() {
  const router = useRouter();
  const [logins, setLogins] = useState<LoginEntry[]>([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/login"); return; }
      setUserId(user.uid);

      push(ref(db, "loginHistory/" + user.uid), {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      });

      const histRef = ref(db, "loginHistory/" + user.uid);
      onValue(histRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list: LoginEntry[] = Object.entries(data).map(([id, val]) => ({
            id,
            ...(val as Omit<LoginEntry, "id">),
          }));
          list.sort((a, b) => b.timestamp - a.timestamp);
          if (list[0]) list[0].current = true;
          setLogins(list);
        }
      });
    });
    return () => unsub();
  }, [router]);

  const clearHistory = () => {
    remove(ref(db, "loginHistory/" + userId));
  };

  const getBrowser = (ua: string) => {
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Unknown browser";
  };

  const getOS = (ua: string) => {
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("Android")) return "Android";
    return "Unknown OS";
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">Back</button>
          <h1 className="text-white font-bold text-xl">Security</h1>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Login history</h2>
            <button onClick={clearHistory} className="text-red-400 hover:text-red-300 text-sm">Clear all</button>
          </div>
          <div className="space-y-3">
            {logins.map((login) => (
              <div key={login.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-200 text-sm">{getBrowser(login.userAgent)} on {getOS(login.userAgent)}</p>
                    {login.current && (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">{format(new Date(login.timestamp), "MMM d yyyy, HH:mm")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
