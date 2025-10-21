// src/app/api/admin/posts/[id]/approve/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function checkAdmin(req: Request) {
  const secret = req.headers.get("x-admin-secret") || process.env.ADMIN_SECRET;
  return secret === process.env.ADMIN_SECRET;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const postId = Number(params.id);
  if (!postId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { isApproved: true },
    include: { author: true },
  });

  return NextResponse.json(updated);
}
