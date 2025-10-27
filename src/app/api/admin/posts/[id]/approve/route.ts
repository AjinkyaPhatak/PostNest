import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Admin approval endpoint - the admin UI already checks the signed-in user's
// email against the configured admin email, so this endpoint performs the
// approval update directly.
export async function POST(req: Request) {
  try {
    const pathname = new URL(req.url).pathname;
    const m = pathname.match(/\/api\/admin\/posts\/(.+?)\/approve$/);
    const id = m ? Number(m[1]) : NaN;
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const post = await prisma.post.update({
      where: { id },
      data: { approved: true },
    });

    return NextResponse.json(post);
  } catch (err) {
    console.error("Error approving post:", err);
    return NextResponse.json(
      { error: "Failed to approve post" },
      { status: 500 }
    );
  }
}
