import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyIdToken } from "@/lib/firebaseAdmin";

export async function POST(req: Request, context: any) {
  try {
    const params = context?.params;
    const resolvedParams =
      params && typeof (params as any).then === "function"
        ? await params
        : params;
    const id = resolvedParams?.id;

    // Verify caller via Authorization: Bearer <idToken>
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 }
      );
    }
    const idToken = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = await verifyIdToken(idToken);
    } catch (e) {
      console.error("Failed to verify ID token:", e);
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
    }

    const callerEmail = (decoded?.email || "").trim().toLowerCase();

    const body = await req.json();
    const { targetEmail } = body;
    if (!targetEmail) {
      return NextResponse.json(
        { error: "targetEmail required" },
        { status: 400 }
      );
    }

    const communityId = Number(id);
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

    // Authorized if caller is master OR caller is current community admin
    const isMaster = callerEmail && master && callerEmail === master;
    const isCommunityAdmin =
      callerEmail &&
      community.admin &&
      community.admin.email &&
      callerEmail === community.admin.email.toLowerCase();

    if (!isMaster && !isCommunityAdmin) {
      return NextResponse.json(
        { error: "Not authorized to demote" },
        { status: 403 }
      );
    }

    // find target user
    const target = await prisma.user.findUnique({
      where: { email: targetEmail },
    });
    if (!target)
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );

    // only allow demoting the current community admin
    if (
      !community.admin ||
      community.admin.email.toLowerCase() !== targetEmail.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Target is not the current community admin" },
        { status: 400 }
      );
    }

    // perform demote: set adminId to null
    const updated = await prisma.community.update({
      where: { id: communityId },
      data: { adminId: null },
      include: { admin: true },
    });

    return NextResponse.json({
      ok: true,
      community: { id: updated.id, admin: updated.admin },
    });
  } catch (err) {
    console.error("Error demoting user:", err);
    return NextResponse.json({ error: "Failed to demote" }, { status: 500 });
  }
}
