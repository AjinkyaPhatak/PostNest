"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function RightSidebar() {
  const pathname = usePathname();
  const [communityAdmin, setCommunityAdmin] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const match = pathname?.match(/^\/community\/(\d+)/);
    if (!match) {
      setCommunityAdmin(null);
      return;
    }

    const id = match[1];
    (async () => {
      try {
        const res = await fetch(`/api/communities?id=${id}`);
        const data = await res.json();
        if (!mounted) return;
        // API returns an array; take first item
        const c = Array.isArray(data) ? data[0] : null;
        if (c && c.admin)
          setCommunityAdmin(c.admin.name || c.admin.email || null);
        else setCommunityAdmin(null);
      } catch (e) {
        if (!mounted) return;
        setCommunityAdmin(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  return (
    <div className="space-y-4">
      {communityAdmin ? (
        <div className="sidebar-card">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Community Admin
          </h4>
          <p className="text-sm text-gray-800">{communityAdmin}</p>
        </div>
      ) : (
        <>
          <div className="sidebar-card">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Trending
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>#welcome</li>
              <li>#announcements</li>
              <li>#rules</li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">About</h4>
            <p className="text-sm text-gray-600">
              PostNest is a community-first posting app inspired by Reddit.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
