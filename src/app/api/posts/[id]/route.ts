import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: any) {
  try {
    const postId = Number(params.id);
    if (!postId)
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        community: true,
        votes: { include: { user: true } },
      },
    });

    if (!post)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const score = post.votes?.reduce((s, v) => s + v.value, 0) ?? 0;

    return NextResponse.json({
      id: post.id,
      title: post.title,
      body: post.body,
      user: post.author?.name || post.author?.email || "Anonymous",
      community: post.community
        ? { id: post.community.id, name: post.community.name }
        : null,
      createdAt: post.createdAt,
      score,
    });
  } catch (error) {
    console.error("Error fetching post detail:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
