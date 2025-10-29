"use client";

import { useEffect, useState } from "react";
import { auth, provider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";

export default function CreatePostForm() {
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState("");
  const [communities, setCommunities] = useState<any[]>([]);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const un = onAuthStateChanged(auth, (u) => setUser(u));
    return () => un();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/communities");
        const data = await res.json();
        if (!mounted) return;
        setCommunities(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setCommunities([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const ensureSignedIn = async () => {
    if (auth.currentUser) return auth.currentUser;
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (e) {
      console.error("Sign in failed", e);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = await ensureSignedIn();
    if (!u) return alert("You must sign in to post");
    if (!content.trim()) return;

    setIsPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: u.displayName || (u.email ?? "").split("@")[0] || "user",
          email: u.email ?? "",
          content,
          communityId: communityId ? Number(communityId) : undefined,
        }),
      });
      const data = await res.json();
      if (data && (data as any).error) {
        alert(`Error: ${(data as any).error}`);
      } else {
        alert("Post created");
        setContent("");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={communityId ?? ""}
          onChange={(e) => setCommunityId(e.target.value || null)}
          className="w-full p-3 rounded-md bg-slate-900/50 border border-slate-700/50 text-white"
        >
          <option value="">Post to all</option>
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              r/{c.name}
            </option>
          ))}
        </select>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            user
              ? `Posting as ${user.displayName || user.email}`
              : "Sign in to post"
          }
          className="w-full p-4 rounded-md bg-slate-900/50 border border-slate-700/50 text-white min-h-[140px]"
        />

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {user ? `Signed in as ${user.email}` : "Not signed in"}
          </div>
          <div>
            <button
              type="submit"
              disabled={isPosting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md disabled:opacity-60"
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
