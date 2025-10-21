'use client'

import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch all posts (approved or not)
  async function fetchPosts() {
    const res = await fetch('/api/posts?all=true')
    const data = await res.json()
    setPosts(data)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  async function approvePost(id: number) {
    if (!secret) {
      alert('Please enter your admin secret first.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, secret }),
    })
    setLoading(false)

    if (res.ok) {
      alert('Post approved!')
      fetchPosts()
    } else {
      alert('Invalid secret or error approving post.')
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🛠 Admin Dashboard</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="password"
          placeholder="Enter admin secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          style={{ padding: '0.5rem', width: '300px' }}
        />
      </div>

      <button onClick={fetchPosts} disabled={loading}>
        Refresh Posts
      </button>

      <h2 style={{ marginTop: '2rem' }}>All Posts</h2>
      {posts.length === 0 && <p>No posts yet.</p>}

      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: post.approved ? '#e8ffe8' : '#ffe8e8',
          }}
        >
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <p>
            <b>Status:</b> {post.approved ? '✅ Approved' : '⏳ Pending'}
          </p>
          {!post.approved && (
            <button onClick={() => approvePost(post.id)} disabled={loading}>
              Approve
            </button>
          )}
        </div>
      ))}
    </main>
  )
}
