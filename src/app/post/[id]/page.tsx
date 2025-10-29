"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((data) => setPost(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  const cast = async (val: number) => {
    const user = auth.currentUser;
    if (!user) return alert("Sign in to vote");
    const token = await user.getIdToken();
    try {
      const res = await fetch(`/api/posts/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "vote failed");
      setPost((p: any) => ({ ...p, score: data.score }));
    } catch (e) {
      console.error(e);
      alert("Failed to cast vote");
    }
  };

  if (loading) return <div className="p-6">Loading post...</div>;
  if (!post) return <div className="p-6">Post not found</div>;

  return (
    <div className="post-detail-container">
      <div className="post-detail">
        <div className="post-vote">
          <button onClick={() => cast(1)} aria-label="upvote">
            ▲
          </button>
          <div className="score">{post.score ?? 0}</div>
          <button onClick={() => cast(-1)} aria-label="downvote">
            ▼
          </button>
        </div>

        <div className="post-content">
          <div className="post-meta">
            <Link
              href={`/community/${post.community?.id}`}
              className="community-pill"
            >
              r/{post.community?.name}
            </Link>
            <div className="author-box">
              <div className="author-avatar">
                {(post.user || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                Posted by <strong className="text-gray-900">{post.user}</strong>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="post-header">
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
          </div>

          <div className="post-body">{post.body}</div>

          <div className="post-actions">
            <button className="hover:text-gray-800">Comments</button>
            <button className="hover:text-gray-800">Share</button>
            <button className="hover:text-gray-800">Save</button>
            <div className="ml-auto text-sm text-gray-500">
              {post.score ?? 0} points
            </div>
          </div>

          <div className="comments-area">
            <h3 className="text-lg font-semibold mb-2">Comments</h3>
            <p className="text-sm text-gray-500">
              Comments UI not implemented yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
