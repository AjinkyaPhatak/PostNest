"use client";

import { useEffect, useState } from "react";
import CommunityList from "@/components/CommunityList";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/communities");
        const data = await res.json();
        if (!mounted) return;
        setCommunities(Array.isArray(data) ? data : []);
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
      <h2 className="text-2xl font-bold text-white">Communities</h2>
      <CommunityList communities={communities} />
    </div>
  );
}
