// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
  content?: string | null;
  isApproved: boolean;
  author: { email: string; name?: string | null };
  createdAt: string;
};

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const adminSecret = typeof window !== "undefined" ? (window as any).ADMIN_SECRET : "";

  async function fetchAll() {
    const res = await fetch("/api/admin/posts", {
      headers: { "x-admin-secret": adminSecret || "" },
    });
    const data = await res.json();
    setPosts(data);
  }

  useEffect(() => {
    // Put your ADMIN_SECRET value on the window for quick testing:
    // In dev console: window.ADMIN_SECRET = "your-secret"
    fetchAll();
  }, []);

  async function approve(id: number) {
    await fetch(`/api/admin/posts/${id}/approve`, {
      method: "POST",
      headers: { "x-admin-secret": adminSecret || "" },
    });
    fetchAll();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin - Post approvals</h1>
      <p>
        For dev: open browser console and run <code>window.ADMIN_SECRET = "your-secret"</code> (match .env). Then refresh.
      </p>

      {posts.length === 0 ? (
        <div>No posts</div>
      ) : (
        posts.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>
              {p.title} {p.isApproved ? "(approved)" : "(pending)"}
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>
              by {p.author?.name ?? p.author.email} • {new Date(p.createdAt).toLocaleString()}
            </div>
            <div style={{ marginTop: 8 }}>{p.content}</div>
            {!p.isApproved && (
              <button style={{ marginTop: 8 }} onClick={() => approve(p.id)}>
                Approve
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
