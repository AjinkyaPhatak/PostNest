"use client";

export default function RightSidebar() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Trending</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>#welcome</li>
          <li>#announcements</li>
          <li>#rules</li>
        </ul>
      </div>

      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">About</h4>
        <p className="text-sm text-gray-400">
          PostNest is a community-first posting app inspired by Reddit.
        </p>
      </div>
    </div>
  );
}
