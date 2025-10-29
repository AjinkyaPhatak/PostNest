"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signInWithGoogle, handleRedirectResult } from "@/lib/authClient";
import PostCard from "@/components/PostCard";
import { User, LogOut, Send, Loader2, MessageSquare } from "lucide-react";

type Post = {
  user: string;
  title: string;
  body?: string;
  timestamp?: string;
  score?: number;
};

export default function HomePage() {
  console.log("🔥 HomePage is rendering!");
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Listen for Firebase auth state changes so the UI updates immediately after sign in/out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    // If the app was redirected back from a redirect-based sign-in, resolve the result.
    (async () => {
      try {
        const redirectedUser = await handleRedirectResult();
        if (redirectedUser) setUser(redirectedUser);
      } catch (err) {
        console.error("Error handling redirect sign-in result:", err);
      }
    })();

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

  // Handle Google login (popup with redirect fallback)
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Login error:", err);
      alert(
        "Sign in failed — check the browser console for details and ensure your Firebase config/authorized domains are set up."
      );
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
  };

  // Handle post submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setIsPosting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          title,
          body: content,
        }),
      });

      const newPost = await res.json();
      setPosts([newPost, ...posts]);
      setTitle("");
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
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Welcome to PostNest
          </h1>
          <p className="text-gray-700 text-lg">
            Share your thoughts with the world 🪶
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
          </div>
        ) : !user ? (
          /* Login Section */
          <div className="flex flex-col items-center space-y-6 py-12">
            <div className="card text-center max-w-md w-full">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#ffedd8]">
                <User className="w-10 h-10 text-[#ff4500]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Join the Conversation
              </h2>
              <p className="text-gray-600 mb-8">
                Sign in to create posts and connect with others
              </p>
              <button
                onClick={handleLogin}
                className="w-full btn-primary py-3 px-6 rounded transition-all duration-200"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* User Profile Card */}
            <div className="card mb-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={user.photoURL || "https://via.placeholder.com/150"}
                      alt="User Avatar"
                      className="w-14 h-14 rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded bg-white text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Create Post Form */}
            <div className="mb-12">
              <div className="card">
                <input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ff4500]"
                  disabled={isPosting}
                />

                <textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#ff4500] resize-none"
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
                    className="btn-primary disabled:opacity-60"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="ml-2">Posting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span className="ml-2">Post</span>
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
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
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
