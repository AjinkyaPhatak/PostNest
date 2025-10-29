const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const communities = await prisma.community.count();
  const users = await prisma.user.count();
  const posts = await prisma.post.count();
  console.log("communities", communities);
  console.log("users", users);
  console.log("posts", posts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
