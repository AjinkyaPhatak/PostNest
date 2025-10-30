import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyIdToken } from "@/lib/firebaseAdmin";

export async function POST(request: Request, { params }: any) {
  try {
    const postId = Number(params.id);
    if (!postId)
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });

    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token)
      return NextResponse.json(
        { error: "Missing Authorization" },
        { status: 401 }
      );

    let email: string | undefined = undefined;
    let verified: any = null;
    try {
      verified = await verifyIdToken(token);
      email = verified?.email;
    } catch (e) {
      console.error("verifyIdToken failed:", e);
      // Local/dev fallback: accept an x-user-email header when running locally and
      // firebase-admin cannot be initialized (convenience for development only).
      if (process.env.NODE_ENV !== "production") {
        const devEmail = request.headers.get("x-user-email");
        if (devEmail) {
          email = devEmail;
        } else {
          return NextResponse.json(
            {
              error:
                "Token verification failed (dev fallback requires x-user-email header)",
            },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Token verification failed" },
          { status: 401 }
        );
      }
    }
    if (!email)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Ensure a User row exists for this email (create if missing) so votes can be attributed.
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const displayName = verified?.name || email.split("@")[0];
      user = await prisma.user.create({ data: { email, name: displayName } });
    }

    const body = await request.json();
    const { value } = body; // expected 1, -1, or 0 to clear
    if (typeof value !== "number" || ![1, -1, 0].includes(value)) {
      return NextResponse.json(
        { error: "Invalid vote value" },
        { status: 400 }
      );
    }

    const existing = await prisma.vote.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    if (value === 0) {
      if (existing) {
        await prisma.vote.delete({ where: { id: existing.id } });
      }
    } else {
      if (existing) {
        await prisma.vote.update({
          where: { id: existing.id },
          data: { value },
        });
      } else {
        await prisma.vote.create({ data: { userId: user.id, postId, value } });
      }
    }

    // compute new score
    const agg = await prisma.vote.aggregate({
      where: { postId },
      _sum: { value: true },
    });
    const score = agg._sum.value ?? 0;

    return NextResponse.json({ postId, score, userVote: value });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Vote failed" }, { status: 500 });
  }
}
