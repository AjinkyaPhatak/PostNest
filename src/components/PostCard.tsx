"use client";

import React from "react";

export default function PostCard({ post }: { post: any }) {
  return (
    <article className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start space-x-4">
        <div className="flex flex-col items-center">
          <button className="text-gray-400 hover:text-orange-400">▲</button>
          <span className="text-sm font-bold text-white">0</span>
          <button className="text-gray-400 hover:text-blue-400">▼</button>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs text-gray-400 mr-2">
                r/{post.community?.name || "all"}
              </span>
              <span className="font-semibold text-white">{post.user}</span>
              {post.timestamp && (
                <span className="text-xs text-gray-500 ml-2">
                  {post.timestamp}
                </span>
              )}
            </div>
          </div>

          <div className="text-gray-300 leading-relaxed">{post.content}</div>

          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400">
            <button>comments</button>
            <button>share</button>
            <button>save</button>
          </div>
        </div>
      </div>
    </article>
  );
}
