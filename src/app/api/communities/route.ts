import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const where: any = {};
    if (id) where.id = Number(id);

    const communities = await prisma.community.findMany({
      where,
      include: { admin: true, members: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });

    const formatted = communities.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      admin: c.admin
        ? { id: c.admin.id, name: c.admin.name, email: c.admin.email }
        : null,
      memberCount: c.members ? c.members.length : 0,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching communities:", err);
    // If the DB/migration isn't applied yet, return an empty array so the UI remains usable.
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, adminEmail } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let admin = null;
    if (adminEmail) {
      admin = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (!admin) {
        admin = await prisma.user.create({
          data: { email: adminEmail, name: adminEmail.split("@")[0] },
        });
      }
    }

    const community = await prisma.community.create({
      data: {
        name,
        description,
        adminId: admin ? admin.id : undefined,
      },
      include: { admin: true },
    });

    return NextResponse.json(community);
  } catch (err) {
    console.error("Error creating community:", err);
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 }
    );
  }
}
