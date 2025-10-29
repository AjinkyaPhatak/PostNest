import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyIdToken } from "@/lib/firebaseAdmin";

export async function DELETE(request: Request, context: any) {
  try {
    const { params } = context;
    const communityId = Number(params.id);
    const userId = Number(params.userId);

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyIdToken(token);
    const callerEmail = decoded.email;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: { admin: true },
    });
    if (!community)
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );

    const master = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
    const isMaster = callerEmail?.toLowerCase() === master;
    const isAdmin = community.admin && community.admin.email === callerEmail;

    if (!isAdmin && !isMaster)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // remove membership and optionally user (we'll remove membership only)
    await prisma.communityMembership.deleteMany({
      where: { userId, communityId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
