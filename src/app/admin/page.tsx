"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";

export default function AdminDashboard() {
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [secret, setSecret] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);

  const fetchPosts = async () => {
    const res = await fetch(`/api/admin/posts?secret=${secret}`);
    if (res.ok) {
      const data = await res.json();
      setPendingPosts(data);
    }
  };

  const handleApprove = async (id: number) => {
    await fetch(`/api/admin/posts/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    setPendingPosts(pendingPosts.filter((p) => p.id !== id));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchPosts();
    setIsAuthed(true);
  };

  return (
    <div>
      <Navbar />
      <main className="container mt-8">
        {!isAuthed ? (
          <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-blue-400">Admin Login</h1>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter admin secret"
              className="input"
            />
            <button type="submit" className="btn btn-primary w-full">
              Enter Dashboard
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-blue-400">Pending Posts ⚙️</h1>
            <div className="space-y-4">
              {pendingPosts.length === 0 && <p className="text-gray-500">No posts pending approval</p>}
              {pendingPosts.map((post) => (
                <div key={post.id} className="card">
                  <h2 className="font-semibold text-blue-400">@{post.author?.name}</h2>
                  <p className="mt-2 text-gray-300">{post.content}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => handleApprove(post.id)} className="btn btn-primary">
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
