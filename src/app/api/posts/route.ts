import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET - Fetch approved posts + user's own unapproved posts
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email"); // optional, passed from frontend
    const communityId = searchParams.get("communityId");

    const whereClause: any = {
      OR: [
        { approved: true },
        ...(email ? [{ author: { email } }] : []), // include user's own posts
      ],
    };

    if (communityId) {
      whereClause.AND = [{ communityId: Number(communityId) }];
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: { author: true, community: true },
      orderBy: { createdAt: "desc" },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      user: post.author?.name || post.author?.email || "Anonymous",
      content: post.content,
      approved: post.approved,
      timestamp: post.createdAt.toISOString(),
      isOwnPost: post.author?.email === email,
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    // Return an empty array on error so frontend mapping doesn't break.
    return NextResponse.json([], { status: 200 });
  }
}

/**
 * POST - Create a new post (requires admin approval)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, content, communityId } = body;

    if (!email || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Determine if this author is the configured master admin
    const adminEmail =
      process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
    const isMasterAdmin = email.trim().toLowerCase() === adminEmail;

    // Find or create user; set role to ADMIN if the email matches master admin
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          role: isMasterAdmin ? "ADMIN" : "USER",
        },
      });
    } else if (!user.role && isMasterAdmin) {
      // in case role missing (older records), upgrade
      user = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
    } else if (user.role !== "ADMIN" && isMasterAdmin) {
      // upgrade existing user to ADMIN if it matches admin email
      user = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
    }

    // Determine community-based approval: auto-approve when posted by master admin
    // or when posted by the community admin for the given community
    let approved = false;
    let community = null;
    if (communityId) {
      community = await prisma.community.findUnique({
        where: { id: Number(communityId) },
      });
      if (community) {
        if (isMasterAdmin) approved = true;
        else if (community.adminId && community.adminId === user.id)
          approved = true;
      }
    } else {
      // No community: master admin posts are auto-approved
      if (isMasterAdmin) approved = true;
    }

    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: user.id,
        communityId: community ? community.id : null,
        approved,
      },
      include: { author: true, community: true },
    });

    return NextResponse.json({
      id: newPost.id,
      user: newPost.author?.name || newPost.author?.email || "Anonymous",
      content: newPost.content,
      approved: newPost.approved,
      timestamp: newPost.createdAt.toISOString(),
      isOwnPost: true,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
