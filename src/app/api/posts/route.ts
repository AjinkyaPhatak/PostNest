import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET - Fetch approved posts + user's own unapproved posts
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email"); // optional, passed from frontend

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { approved: true },
          ...(email ? [{ author: { email } }] : []), // include user's own posts
        ],
      },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      user: post.author?.name || post.author?.email || "Anonymous",
      content: post.content,
      approved: post.approved,
      timestamp: post.createdAt.toISOString(),
      isOwnPost: post.author?.email === email,
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

/**
 * POST - Create a new post (requires admin approval)
 */
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
          name: name || email.split("@")[0],
        },
      });
    }

    // Create unapproved post
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: user.id,
        approved: false,
      },
      include: { author: true },
    });

    return NextResponse.json({
      id: newPost.id,
      user: newPost.author?.name || newPost.author?.email || "Anonymous",
      content: newPost.content,
      approved: newPost.approved,
      timestamp: newPost.createdAt.toISOString(),
      isOwnPost: true,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
