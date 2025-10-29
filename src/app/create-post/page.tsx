"use client";

import CreatePostForm from "@/components/CreatePostForm";

export default function CreatePostPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Create Post</h2>
      <CreatePostForm />
    </div>
  );
}
