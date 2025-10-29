"use client";

import { signInWithGoogle } from "@/lib/authClient";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const user = await signInWithGoogle();

      if (!user) {
        // If signInWithGoogle triggered a redirect, the app will reload — nothing more to do here.
        return;
      }

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      // surface a simple UI message so user knows something went wrong
      alert(
        "Sign in failed — check the browser console for details and ensure your Firebase config/authorized domains are set up."
      );
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition"
    >
      Sign in with Google
    </button>
  );
}
