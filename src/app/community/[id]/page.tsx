"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { signInWithGoogle } from "@/lib/authClient";

export default function CommunityPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch(`/api/communities?id=${id}`)
      .then((r) => r.json())
      .then((data) => setCommunity(data[0] || null))
      .catch(() => setCommunity(null));

    fetch(`/api/posts?communityId=${id}`)
      .then((r) => r.json())
      .then((data) => setPosts(data || []))
      .catch(() => setPosts([]));
  }, [id]);

  // Listen for auth changes to determine if current user is community admin/master
  useEffect(() => {
    const un = onAuthStateChanged(auth, (u) => setUser(u));
    return () => un();
  }, []);

  useEffect(() => {
    const master = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
    const caller = user?.email?.toLowerCase() ?? null;
    const adminEmail = community?.admin?.email?.toLowerCase() ?? null;
    setIsAdmin(!!(caller && (caller === adminEmail || caller === master)));
  }, [user, community]);

  const handleJoin = async () => {
    let u = user;
    if (!u) {
      try {
        const signed = await signInWithGoogle();
        if (!signed) return; // redirect-based sign-in occurred or user didn't finish sign-in
        u = signed;
        setUser(u);
      } catch (e) {
        console.error("Sign-in required to join", e);
        return;
      }
    }

    if (!u || !u.email) return alert("Could not determine your email");

    try {
      const r = await fetch(`/api/communities/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: u.email }),
      });
      const res = await r.json();
      if (res && (res as any).error) {
        alert(`Error: ${(res as any).error}`);
      } else {
        alert("Requested to join — refresh to see membership");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to join community");
    }
  };

  if (!community)
    return <div className="text-gray-400">Loading community...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="max-w-[65%]">
          <h2 className="text-2xl font-bold text-white">r/{community.name}</h2>
          <p className="text-sm text-gray-400">{community.description}</p>
        </div>

        <div className="w-48">
          <div className="bg-slate-900/40 p-3 rounded-md">
            <div className="text-xs text-gray-400">Community admin</div>
            <div className="font-semibold text-white truncate">
              {community.admin?.name || community.admin?.email || "—"}
            </div>

            {/* Admin controls button placed below admin name */}
            <div className="mt-3 flex flex-col gap-2">
              {isAdmin && (
                <Link
                  href={`/community/${id}/admin`}
                  className="text-sm bg-amber-600 text-white px-3 py-2 rounded-md text-center"
                >
                  Admin Controls
                </Link>
              )}

              <button
                onClick={handleJoin}
                className="bg-blue-600 text-white px-3 py-2 rounded-md"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
