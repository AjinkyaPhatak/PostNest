import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: any) {
  try {
    const { params } = context;
    const communityId = Number(params.id);
    const memberships = await prisma.communityMembership.findMany({
      where: { communityId },
      include: { user: true },
    });

    const formatted = memberships.map((m) => ({
      id: m.id,
      userId: m.userId,
      user: { id: m.user.id, name: m.user.name, email: m.user.email },
      joinedAt: m.joinedAt,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 200 });
  }
}
