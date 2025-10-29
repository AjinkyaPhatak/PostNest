"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/navbar";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type Post = {
  id: number;
  content: string;
  approved: boolean;
  author: { email: string; name?: string | null };
  createdAt: string;
};

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();

  useEffect(() => {
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

  async function reject(id: number) {
    await fetch(`/api/admin/posts/${id}/reject`, { method: "POST" });
    fetchAll();
  }

  useEffect(() => {
    if (user?.email?.toLowerCase() === ADMIN_EMAIL) {
      fetchAll();
    }
  }, [user, ADMIN_EMAIL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-24">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Admin Access Required
            </h2>
            <p className="text-gray-400">
              Please sign in to access the admin dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-24">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-3">
              Access Denied
            </h2>
            <p className="text-gray-400">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pendingPosts = posts.filter((p) => !p.approved);
  const approvedPosts = posts.filter((p) => p.approved);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Dashboard ⚙️
          </h1>
          <p className="text-gray-400">Logged in as: {user.email}</p>
        </div>

        {/* Pending Posts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Pending Approval ({pendingPosts.length})
          </h2>

          {pendingPosts.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center">
              <p className="text-gray-400">No posts pending approval</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-yellow-700/50 rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {(post.author?.name || post.author.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-400">
                        {post.author?.name || post.author.email}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {post.content}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => approve(post.id)}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => reject(post.id)}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Posts */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Approved Posts ({approvedPosts.length})
          </h2>

          {approvedPosts.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center">
              <p className="text-gray-400">No approved posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-green-700/50 rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {(post.author?.name || post.author.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-400">
                        {post.author?.name || post.author.email}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
