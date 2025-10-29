const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const communities = await prisma.community.count();
  const posts = await prisma.post.count();
  const votes = await prisma.vote.count();
  const memberships = await prisma.communityMembership.count();

  console.log("users:", users);
  console.log("communities:", communities);
  console.log("posts:", posts);
  console.log("votes:", votes);
  console.log("memberships:", memberships);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
