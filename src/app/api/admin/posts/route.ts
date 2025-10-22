import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
console.log(prisma ? "✅ Prisma imported fine" : "❌ Error");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.ADMIN_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const posts = await prisma.post.findMany({
    where: { approved: false },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}
