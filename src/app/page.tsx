"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import PostCard from "@/components/PostCard";
import { User, LogOut, Send, Loader2, MessageSquare } from "lucide-react";

type Post = {
  user: string;
  content: string;
  timestamp?: string;
};

export default function HomePage() {
  console.log("🔥 HomePage is rendering!");
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Listen for Firebase auth state changes so the UI updates immediately after sign in/out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const pathname = usePathname();

  // Extracted fetch so we can call it on mount, on auth change, and when the pathname changes back to '/'
  const fetchPosts = useCallback(async (currentUser: any) => {
    setIsLoading(true);
    try {
      const emailQuery = currentUser
        ? `?email=${encodeURIComponent(currentUser.email)}`
        : "";
      const res = await fetch(`/api/posts${emailQuery}`);
      const data = await res.json();
      // If API returns an array, use it. If it returns an error object or anything else, fall back to empty array.
      if (Array.isArray(data)) {
        // shuffle posts for home feed so order is random each load
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setPosts(shuffled);
      } else {
        // log error payloads for debugging
        if (data && (data as any).error)
          console.error("API error fetching posts:", (data as any).error);
        setPosts([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when auth changes
  useEffect(() => {
    fetchPosts(user);
  }, [user, fetchPosts]);

  // Re-fetch when returning to the home pathname (fixes disappearing posts when navigating back from admin)
  useEffect(() => {
    if (pathname === "/") {
      fetchPosts(user);
    }
  }, [pathname, user, fetchPosts]);

  // Handle Google login
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
  };

  // Handle post submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setIsPosting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          content,
        }),
      });

      const newPost = await res.json();
      setPosts([newPost, ...posts]);
      setContent("");
    } catch (err) {
      console.error("Post error:", err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div>
      <main>
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome to PostNest
          </h1>
          <p className="text-gray-400 text-lg">
            Share your thoughts with the world 🪶
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : !user ? (
          /* Login Section */
          <div className="flex flex-col items-center space-y-6 py-12">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center max-w-md w-full shadow-2xl">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Join the Conversation
              </h2>
              <p className="text-gray-400 mb-8">
                Sign in to create posts and connect with others
              </p>
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* User Profile Card */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={user.photoURL || "https://via.placeholder.com/150"}
                      alt="User Avatar"
                      className="w-14 h-14 rounded-full ring-4 ring-blue-500/30"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 border border-slate-600/50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Create Post Form */}
            <div className="mb-12">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                <textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-900/50 text-white placeholder-gray-500 border border-slate-700/50 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 resize-none"
                  disabled={isPosting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isPosting}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Post</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 && !isLoading ? (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                No posts yet. Be the first to share!
              </p>
            </div>
          ) : Array.isArray(posts) ? (
            posts.map((post, idx) => <PostCard key={idx} post={post} />)
          ) : null}
        </div>
      </main>
    </div>
  );
}
