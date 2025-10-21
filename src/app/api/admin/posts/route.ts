// src/app/api/admin/posts/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function checkAdmin(req: Request) {
  const secret = req.headers.get("x-admin-secret") || process.env.ADMIN_SECRET;
  return secret === process.env.ADMIN_SECRET;
}

export async function GET(req: Request) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}
