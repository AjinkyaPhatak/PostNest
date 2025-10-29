"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/navbar";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type Post = {
  id: number;
  title: string;
  body: string;
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
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-24">
          <div className="card text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Admin Access Required
            </h2>
            <p className="text-gray-600">
              Please sign in to access the admin dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-24">
          <div className="card text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              Access Denied
            </h2>
            <p className="text-gray-600">
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
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">
            Admin Dashboard ⚙️
          </h1>
          <p className="text-gray-600">Logged in as: {user.email}</p>
        </div>

        {/* Pending Posts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pending Approval ({pendingPosts.length})
          </h2>

          {pendingPosts.length === 0 ? (
            <div className="card text-center">
              <p className="text-gray-600">No posts pending approval</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div key={post.id} className="card">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#ffedd8] flex items-center justify-center text-[#ff4500] font-bold">
                      {(post.author?.name || post.author.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {post.author?.name || post.author.email}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong className="block text-gray-900 mb-2">
                      {post.title}
                    </strong>
                    {post.body}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => approve(post.id)}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-all duration-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => reject(post.id)}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-all duration-200"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Approved Posts ({approvedPosts.length})
          </h2>

          {approvedPosts.length === 0 ? (
            <div className="card text-center">
              <p className="text-gray-600">No approved posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedPosts.map((post) => (
                <div key={post.id} className="card">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#ffedd8] flex items-center justify-center text-[#ff4500] font-bold">
                      {(post.author?.name || post.author.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {post.author?.name || post.author.email}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    <strong className="block text-gray-900 mb-2">
                      {post.title}
                    </strong>
                    {post.body}
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
