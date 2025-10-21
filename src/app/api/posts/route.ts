import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET all posts (for admin view)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')

  const posts = await prisma.post.findMany({
    where: all ? {} : { approved: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}

// POST a new post
export async function POST(req: Request) {
  const data = await req.json()
  const post = await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
    },
  })
  return NextResponse.json(post)
}
