"use client";

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";

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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function fetchAll() {
    const res = await fetch("/api/admin/posts");
    const data = await res.json();
    setPosts(data);
  }

  async function approve(id: number) {
    await fetch(`/api/admin/posts/${id}/approve`, { method: "POST" });
    fetchAll();
  }

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      fetchAll();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in as admin to access this page.</div>;
  if (user.email !== ADMIN_EMAIL) return <div>Access denied.</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      <h1 className="text-3xl font-bold mb-4 text-purple-400">Admin Dashboard</h1>

      {posts.length === 0 ? (
        <div className="text-gray-400">No posts yet.</div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <div
              key={p.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-purple-500 transition"
            >
              <div className="font-semibold text-lg">{p.title}</div>
              <div className="text-sm text-gray-400">
                by {p.author?.name ?? p.author.email} •{" "}
                {new Date(p.createdAt).toLocaleString()}
              </div>
              <div className="mt-3 text-gray-300">{p.content}</div>

              {!p.isApproved && (
                <button
                  onClick={() => approve(p.id)}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
                >
                  Approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
