"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/communities")
      .then((r) => r.json())
      .then((data) => setCommunities(data || []))
      .catch(() => setCommunities([]));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Communities</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communities.map((c: any) => (
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
        ))}
      </div>
    </div>
  );
}
