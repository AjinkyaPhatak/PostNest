"use client";

import React, { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";

export default function PostCard({ post }: { post: any }) {
  const [score, setScore] = useState<number>(post.score ?? 0);
  const [userVote, setUserVote] = useState<number>(post.userVote ?? 0);

  const cast = async (val: number) => {
    const user = auth.currentUser;
    if (!user) return alert("Sign in to vote");
    const token = await user.getIdToken();
    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-email": user.email || "",
        },
        body: JSON.stringify({ value: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "vote failed");
      setScore(data.score ?? score);
      setUserVote(data.userVote ?? val);
    } catch (e) {
      console.error(e);
      alert("Failed to cast vote");
    }
  };

  return (
    <article className="reddit-card">
      <div className="flex">
        {/* Vote column */}
        <div className="vote-col flex flex-col items-center px-3 py-2 text-gray-400">
          <button
            onClick={() => cast(userVote === 1 ? 0 : 1)}
            className={`vote-btn ${
              userVote === 1 ? "text-orange-500" : "text-gray-400"
            }`}
            aria-label="upvote"
          >
            ▲
          </button>
          <span className="vote-count text-sm font-semibold text-gray-900 bg-white rounded px-2 py-0.5 mt-1">
            {score}
          </span>
          <button
            onClick={() => cast(userVote === -1 ? 0 : -1)}
            className={`vote-btn ${
              userVote === -1 ? "text-purple-600" : "text-gray-400"
            }`}
            aria-label="downvote"
          >
            ▼
          </button>
        </div>

        {/* Post body */}
        <div className="flex-1 p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="community-pill">
              r/{post.community?.name || "all"}
            </span>
            <span className="text-sm text-gray-400">Posted by</span>
            <span className="text-sm font-semibold">{post.user}</span>
            {post.timestamp && (
              <span className="text-xs text-gray-400 ml-2">
                {post.timestamp}
              </span>
            )}
          </div>

          <h3 className="post-title text-lg font-semibold text-gray-900 mb-2">
            <Link href={`/post/${post.id}`}>{post.title}</Link>
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href={`/post/${post.id}`} className="hover:text-gray-700">
              Comments
            </Link>
            <button className="hover:text-gray-700">Share</button>
            <button className="hover:text-gray-700">Save</button>
          </div>
        </div>
      </div>
    </article>
  );
}
