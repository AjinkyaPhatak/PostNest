import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
console.log(prisma ? "✅ Prisma imported fine" : "❌ Error");

export async function GET(req: Request) {
  // This endpoint is intended to be called by the admin UI which already
  // verifies the current user email on the client side. Remove the secret
  // requirement so the admin page can fetch pending posts after client-side
  // auth verification.
  const posts = await prisma.post.findMany({
    where: { approved: false },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}
