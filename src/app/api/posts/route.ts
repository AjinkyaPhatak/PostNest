import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch all approved posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { approved: true },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    // Format posts to match your frontend expectations
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      user: post.author?.name || post.author?.email || "Anonymous",
      content: post.content,
      timestamp: post.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST - Create new post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, content } = body;

    if (!email || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: { 
          email, 
          name: name || email.split("@")[0] 
        },
      });
    }

    // Create post (not approved by default)
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: user.id,
        approved: false, // Needs admin approval
      },
      include: { author: true },
    });

    // Return formatted post
    return NextResponse.json({
      id: newPost.id,
      user: newPost.author?.name || newPost.author?.email || "Anonymous",
      content: newPost.content,
      timestamp: newPost.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}