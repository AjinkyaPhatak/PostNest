import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, image } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const isAdmin = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: isAdmin ? "ADMIN" : "USER",
        },
      });
    } else if (user.role !== "ADMIN" && isAdmin) {
      // Upgrade existing user to ADMIN if it matches your email
      user = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
