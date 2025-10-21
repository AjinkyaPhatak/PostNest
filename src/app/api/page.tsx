// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
  content?: string | null;
  author: { id: number; email: string; name?: string | null };
  createdAt: string;
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");

  async function fetchPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !email) return alert("title and email required");

    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, authorEmail: email }),
    });

    setTitle("");
    setContent("");
    // don't clear email so user can post multiple times
    fetchPosts();
    alert("Post submitted for admin approval");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>PostNest (simple)</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Create post</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: 300, padding: 8, marginBottom: 8 }}
            />
          </div>
          <div>
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: 600, padding: 8, marginBottom: 8 }}
            />
          </div>
          <div>
            <textarea
              placeholder="Content (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: 600, height: 120, padding: 8, marginBottom: 8 }}
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </section>

      <section>
        <h2>Approved posts</h2>
        {posts.length === 0 ? (
          <div>No posts yet.</div>
        ) : (
          posts.map((p) => (
            <div key={p.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: "#666" }}>
                by {p.author?.name ?? p.author.email} • {new Date(p.createdAt).toLocaleString()}
              </div>
              <div style={{ marginTop: 8 }}>{p.content}</div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
