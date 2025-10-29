const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Wiping database tables...");

  // Delete in the order of dependencies
  await prisma.vote.deleteMany().catch(() => {});
  await prisma.communityMembership.deleteMany().catch(() => {});
  await prisma.post.deleteMany().catch(() => {});
  await prisma.community.deleteMany().catch(() => {});
  await prisma.account.deleteMany().catch(() => {});
  await prisma.session.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  console.log("Creating demo users...");
  const first = [
    "blue",
    "red",
    "green",
    "fast",
    "slow",
    "quiet",
    "loud",
    "tiny",
    "big",
    "brave",
    "clever",
    "happy",
    "mellow",
    "storm",
    "pixel",
  ];
  const last = ["fox", "lion", "owl", "wolf", "bear", "hawk", "raven"];

  const users = [];
  for (let i = 0; i < 25; i++) {
    const name = `${rand(first)}_${rand(last)}${Math.floor(
      Math.random() * 90 + 10
    )}`;
    const email = `${name}@example.com`;
    const u = await prisma.user.create({ data: { name, email, image: null } });
    users.push(u);
  }

  console.log("Creating communities...");
  const communityNames = [
    "tech",
    "javascript",
    "webdev",
    "design",
    "gaming",
    "movies",
    "books",
    "music",
    "food",
    "travel",
    "photography",
    "fitness",
    "news",
    "science",
  ];

  const communities = [];
  for (const name of communityNames) {
    const description = `A community about ${name}. Share and discuss everything related to ${name}.`;
    const admin = rand(users);
    const c = await prisma.community.create({
      data: { name, description, admin: { connect: { id: admin.id } } },
    });
    communities.push(c);
    // create membership for admin
    await prisma.communityMembership.create({
      data: { userId: admin.id, communityId: c.id },
    });
  }

  console.log("Creating posts for each community...");
  const headlines = [
    "Tips & tricks for beginners",
    "Show off your latest work",
    "Question: how do I fix this error?",
    "I found a cool library that simplifies things",
    "Weekly discussion thread",
    "Share your favorite resources",
    "Small project showcase",
    "What do you think about recent changes?",
    "Looking for collaborators",
    "Quick poll: what's your setup?",
  ];

  for (const c of communities) {
    const postsToCreate = 12; // ~12 * 14 = 168 posts
    for (let i = 0; i < postsToCreate; i++) {
      const author = rand(users);
      const title = `${rand(headlines)} (post ${i + 1})`;
      const body = `This is a sample post in r/${
        c.name
      }.\n\nGenerated for local development. Post index: ${i + 1}`;
      const post = await prisma.post.create({
        data: {
          title,
          body,
          approved: true,
          authorId: author.id,
          communityId: c.id,
        },
      });

      // randomly create votes
      const voteUsers = [];
      for (let v = 0; v < 4; v++) {
        const voter = rand(users);
        if (voteUsers.includes(voter.id) || voter.id === author.id) continue;
        voteUsers.push(voter.id);
        const value = Math.random() > 0.6 ? 1 : -1;
        await prisma.vote.create({
          data: { userId: voter.id, postId: post.id, value },
        });
      }
    }
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
