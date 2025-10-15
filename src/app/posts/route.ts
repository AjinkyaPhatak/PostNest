import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, content, authorEmail } = body;

  // find or create user
  let user = await prisma.user.findUnique({ where: { email: authorEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: { name: "Anonymous", email: authorEmail },
    });
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: user.id,
    },
  });

  return NextResponse.json(post);
}
