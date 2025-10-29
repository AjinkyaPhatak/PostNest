import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, context: any) {
  try {
    const params = context?.params;
    const resolvedParams =
      params && typeof (params as any).then === "function"
        ? await params
        : params;
    const id = resolvedParams?.id;
    const body = await req.json();
    const { masterEmail, targetEmail } = body;

    if (!masterEmail || !targetEmail) {
      return NextResponse.json(
        { error: "masterEmail and targetEmail required" },
        { status: 400 }
      );
    }

    const master = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
    if (masterEmail.trim().toLowerCase() !== master) {
      return NextResponse.json(
        { error: "Only master admin can promote" },
        { status: 403 }
      );
    }

    const communityId = Number(id);
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });
    if (!community)
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );

    // find or create target user
    let user = await prisma.user.findUnique({ where: { email: targetEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: targetEmail, name: targetEmail.split("@")[0] },
      });
    }

    // ensure membership
    const membership = await prisma.communityMembership.findFirst({
      where: { userId: user.id, communityId },
    });
    if (!membership) {
      await prisma.communityMembership.create({
        data: { userId: user.id, communityId },
      });
    }

    // promote: set community.adminId to user.id
    const updated = await prisma.community.update({
      where: { id: communityId },
      data: { adminId: user.id },
      include: { admin: true },
    });

    return NextResponse.json({
      ok: true,
      community: { id: updated.id, admin: updated.admin },
    });
  } catch (err) {
    console.error("Error promoting user:", err);
    return NextResponse.json({ error: "Failed to promote" }, { status: 500 });
  }
}
