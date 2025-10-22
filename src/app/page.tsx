"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/navbar";


export default function HomePage() {
  const [posts, setPosts] = useState<{ user: string; content: string }[]>([]);
  const [user, setUser] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user || !content) return;

  const email = `${user.toLowerCase().replace(/\s/g, "")}@postnest.com`;

  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: user, email, content }),
  });

  const newPost = await res.json();
  setPosts([newPost, ...posts]);
  setContent("");

  useEffect(() => {
  fetch("/api/posts")
    .then((res) => res.json())
    .then(setPosts);
}, []);
};


  return (
    <div>
      <Navbar />
      <main className="container space-y-8 mt-6">
        <h1 className="text-3xl font-bold">Welcome to PostNest 🪶</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Your name"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="input"
          />
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input min-h-[100px]"
          />
          <button type="submit" className="btn btn-primary w-full">
            Post
          </button>
        </form>

        <div className="space-y-4">
          {posts.map((post, idx) => (
            <div key={idx} className="card">
              <h2 className="font-semibold text-blue-400">@{post.user}</h2>
              <p className="mt-2 text-gray-300">{post.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
