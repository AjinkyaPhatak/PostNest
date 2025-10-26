"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, provider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

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

  const handleCreatePost = () => {
    // Navigate to the API route as requested. This will show the API response in the browser.
    router.push("/api/posts");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              PostNest
            </span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              href="/admin"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Admin
            </Link>

            {/* Conditionally show Sign In or Create Post */}
            {!user ? (
              <button
                onClick={handleLogin}
                className="ml-2 bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition"
              >
                Sign in with Google
              </button>
            ) : (
              <button
                onClick={handleCreatePost}
                className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Create Post
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
