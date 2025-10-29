"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";

export default function UserPage({ params }: { params: { id: string } }) {
  const email = decodeURIComponent(params.id);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/posts?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => setPosts(data || []))
      .catch(() => setPosts([]));
  }, [email]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">User: {email}</h2>
      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
