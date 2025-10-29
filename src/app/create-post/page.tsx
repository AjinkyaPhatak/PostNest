"use client";

import { useEffect, useState } from "react";

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [communities, setCommunities] = useState<any[]>([]);
  const [communityId, setCommunityId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/communities")
      .then((r) => r.json())
      .then((data) => setCommunities(data || []))
      .catch(() => setCommunities([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !content.trim()) return alert("Email and content required");
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: email.split("@")[0],
        email,
        content,
        communityId: communityId ? Number(communityId) : undefined,
      }),
    });
    const data = await res.json();
    alert(data.error ? `Error: ${data.error}` : "Post created");
    setContent("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Create Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full p-3 rounded-md bg-slate-900/50 border border-slate-700/50 text-white"
        />
        <select
          value={communityId ?? ""}
          onChange={(e) => setCommunityId(e.target.value || null)}
          className="w-full p-3 rounded-md bg-slate-900/50 border border-slate-700/50 text-white"
        >
          <option value="">Post to all</option>
          {communities.map((c: any) => (
            <option key={c.id} value={c.id}>
              r/{c.name}
            </option>
          ))}
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full p-4 rounded-md bg-slate-900/50 border border-slate-700/50 text-white min-h-[140px]"
        />
        <div>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
