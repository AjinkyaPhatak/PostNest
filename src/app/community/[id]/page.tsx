"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { use } from "react";
import PostCard from "@/components/PostCard";

export default function CommunityPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);

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

  const handleJoin = async () => {
    // naive join flow: prompt for email (or use auth in real app)
    const email = prompt("Enter your email to join this community");
    if (!email) return;
    await fetch(`/api/communities/${id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    alert("Requested to join — refresh to see membership");
  };

  if (!community)
    return <div className="text-gray-400">Loading community...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">r/{community.name}</h2>
          <p className="text-sm text-gray-400">{community.description}</p>
        </div>
        <div>
          <button
            onClick={handleJoin}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Join
          </button>
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
