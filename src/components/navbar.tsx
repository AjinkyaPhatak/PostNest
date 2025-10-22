"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-[#12141b] sticky top-0 z-10">
      <Link href="/" className="text-xl font-bold text-blue-500">
        PostNest
      </Link>
      <div className="space-x-4">
        <Link href="/" className="hover:text-blue-400">Home</Link>
        <Link href="/admin" className="hover:text-blue-400">Admin</Link>
      </div>
    </nav>
  );
}
