import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, context: any) {
  try {
    // support both Next.js context shapes where params may be an object or a Promise
    const params = context?.params;
    const resolvedParams =
      params && typeof (params as any).then === "function"
        ? await params
        : params;
    const id = resolvedParams?.id;
    const body = await req.json();
    const { email, name } = body;

    if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: name || email.split("@")[0] },
      });
    }

    const communityId = Number(id);
    const existing = await prisma.communityMembership.findFirst({
      where: { userId: user.id, communityId },
    });
    if (!existing) {
      await prisma.communityMembership.create({
        data: { userId: user.id, communityId },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error joining community:", err);
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}
