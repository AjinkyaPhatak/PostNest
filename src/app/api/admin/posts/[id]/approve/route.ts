import { NextResponse } from "next/server";
import { prisma } from "@src/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { secret } = await req.json();
  if (secret !== process.env.ADMIN_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const post = await prisma.post.update({
    where: { id: Number(params.id) },
    data: { approved: true },
  });

  return NextResponse.json(post);
}
