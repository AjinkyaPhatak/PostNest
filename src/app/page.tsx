'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })
    setTitle('')
    setContent('')
    alert('Post submitted for approval!')
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🪶 PostNest</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '1rem', width: '300px' }}
        />
        <textarea
          placeholder="Write something..."
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '1rem', width: '300px', height: '100px' }}
        />
        <button type="submit">Submit Post</button>
      </form>

      <h2>Approved Posts</h2>
      <div>
        {posts.length === 0 && <p>No posts yet.</p>}
        {posts.map(post => (
          <div key={post.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>{new Date(post.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </main>
  )
}
