const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user || !content) return;

  const email = `${user.toLowerCase().replace(/\s/g, "")}@postnest.com`;

  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: user, email, content }),
  });

  const newPost = await res.json();
  setPosts([newPost, ...posts]);
  setContent("");
};
