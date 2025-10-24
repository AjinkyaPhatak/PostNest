"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) router.push("/");
    else setUser(JSON.parse(storedUser));
  }, [router]);

  if (!user) return null;

  return (
    <div className="p-8 text-white bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-bold">Welcome, {user.displayName}</h1>
      <p className="mt-4">You are logged in as a regular user.</p>
    </div>
  );
}
