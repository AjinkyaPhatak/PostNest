"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/communities");
        const data = await res.json();
        if (!mounted) return;
        // ensure we always store an array to avoid `.map` errors
        if (Array.isArray(data)) setCommunities(data);
        else setCommunities([]);
      } catch (e) {
        if (!mounted) return;
        setCommunities([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="sidebar-card">
        <Link
          href="/create-post"
          className="block w-full text-center bg-[#ff4500] hover:bg-[#e04300] text-white py-2 rounded font-semibold"
        >
          Create Post
        </Link>
      </div>

      <div className="sidebar-card">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Communities
        </h4>
        <ul className="space-y-2">
          {communities.length === 0 ? (
            <li className="text-sm text-gray-500">No communities</li>
          ) : (
            communities.map((c: any) => (
              <li key={c.id} className="flex items-center justify-between">
                <Link
                  href={`/community/${c.id}`}
                  className="text-sm text-gray-800 hover:text-black block"
                >
                  r/{c.name}
                </Link>
                <span className="text-xs text-gray-500">
                  {c.postsCount ?? ""}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="sidebar-card text-sm text-gray-600">
        <p>Tip: Join communities to post and participate in discussions.</p>
      </div>
    </div>
  );
}
