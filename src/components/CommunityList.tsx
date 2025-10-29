"use client";

import Link from "next/link";

export default function CommunityList({ communities }: { communities: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.isArray(communities) && communities.length > 0 ? (
        communities.map((c) => (
          <Link
            key={c.id}
            href={`/community/${c.id}`}
            className="block bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:shadow-lg"
          >
            <h3 className="font-semibold text-white">r/{c.name}</h3>
            <p className="text-sm text-gray-400">
              {c.description || "No description"}
            </p>
          </Link>
        ))
      ) : (
        <div className="text-sm text-gray-500">No communities found</div>
      )}
    </div>
  );
}
