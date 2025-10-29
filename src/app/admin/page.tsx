"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/navbar";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setIsAdmin(true);
        const res = await fetch("/api/admin/posts");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (id: number) => {
    await fetch(`/api/admin/posts/${id}/approve`, {
      method: "POST",
    });
    setPosts(posts.filter((p) => p.id !== id));
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  if (!user)
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 text-center">
        <h1 className="text-2xl font-bold text-blue-400">
          Admin Access Required
        </h1>
        <p className="text-gray-400">
          Please sign in with your admin Google account.
        </p>
        <a href="/" className="btn btn-primary">
          Go to Home
        </a>
      </div>
    );

  if (!isAdmin)
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied 🚫</h1>
        <p className="text-gray-400">
          You are logged in as {user.email}, which is not an admin account.
        </p>
        <button
          onClick={() => signOut(auth)}
          className="btn btn-primary bg-blue-600 mt-2"
        >
          Sign Out
        </button>
      </div>
    );

  return (
    <div>
      <Navbar />
      <main className="container mt-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-400">
            Admin Dashboard ⚙️
          </h1>
          <button
            onClick={() => signOut(auth)}
            className="btn btn-primary bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="space-y-4">
          {posts.length === 0 && (
            <p className="text-gray-500">No posts pending approval</p>
          )}

          {posts.map((post) => (
            <div key={post.id} className="card">
              <h2 className="font-semibold text-blue-400">
                @{post.author?.name}
              </h2>
              <p className="mt-2 text-gray-300">
                <strong className="block text-white">{post.title}</strong>
                <span className="text-gray-300">{post.body}</span>
              </p>
              <button
                onClick={() => handleApprove(post.id)}
                className="btn btn-primary mt-4"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
