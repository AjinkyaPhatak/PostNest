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
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
        <Link
          href="/create-post"
          className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-md font-semibold"
        >
          Create Post
        </Link>
      </div>

      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Communities
        </h4>
        <ul className="space-y-2">
          {communities.length === 0 ? (
            <li className="text-sm text-gray-500">No communities</li>
          ) : (
            communities.map((c: any) => (
              <li key={c.id}>
                <Link
                  href={`/community/${c.id}`}
                  className="text-sm text-gray-200 hover:text-white block"
                >
                  r/{c.name}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-sm text-gray-400">
        <p>Tip: Join communities to have posts approved by community admins.</p>
      </div>
    </div>
  );
}
