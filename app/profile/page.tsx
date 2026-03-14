"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useChatStore } from "@/stores/chatStore";

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useChatStore();
  const [name, setName] = useState(currentUser?.displayName || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url && auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: data.url });
        setCurrentUser({ ...currentUser!, photoURL: data.url });
        setMessage("Avatar updated!");
      }
    } catch {
      setMessage("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !auth.currentUser) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      setCurrentUser({ ...currentUser!, displayName: name });
      setMessage("Profile saved!");
    } catch {
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const avatar = currentUser?.photoURL;
  const initials = currentUser?.displayName?.charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition">
            Back
          </button>
          <h1 className="text-white font-bold text-xl">Your profile</h1>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white text-sm transition"
            >
              {uploading ? "..." : "+"}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <p className="text-gray-400 text-sm mt-2">Click + to change avatar</p>
        </div>

        {message && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-4 text-sm text-center">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Display name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              value={currentUser?.email || ""}
              disabled
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-500"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-3 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-lg px-4 py-3 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
