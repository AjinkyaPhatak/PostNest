"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { auth, provider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-[#ff4500] p-2 rounded-md">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              PostNest
            </span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Home
            </Link>
            <Link
              href="/admin"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
