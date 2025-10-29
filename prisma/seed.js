const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Clearing existing data...");

  // Delete in order to satisfy foreign key constraints
  await prisma.communityMembership.deleteMany();
  await prisma.post.deleteMany();
  await prisma.community.deleteMany();
  await prisma.user.deleteMany();

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
    "neo",
    "meta",
    "nova",
    "astro",
    "orbit",
    "luna",
    "sol",
    "terra",
    "ember",
    "sage",
    "zephyr",
    "cobalt",
    "echo",
    "fable",
    "gale",
  ];
  const last = [
    "fox",
    "lion",
    "owl",
    "wolf",
    "bear",
    "hawk",
    "raven",
    "sparrow",
    "otter",
    "pony",
    "hound",
    "lynx",
    "shard",
    "stone",
    "field",
    "grove",
    "pine",
    "brook",
  ];

  const users = [];
  for (let i = 0; i < 30; i++) {
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
  ];

  const communities = [];
  for (const name of communityNames) {
    const description = `A community about ${name}. Share and discuss everything related to ${name}.`;
    // assign a random admin
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

  console.log("Creating posts...");
  const sentences = [
    "Hello everyone — excited to be here!",
    "Does anyone have resources to learn more about this topic?",
    "I wrote a short tutorial and would love feedback.",
    "What do you think about the recent changes?",
    "Here is a small project I made over the weekend.",
    "Tips and tricks for beginners.",
    "This is my favorite tool — highly recommend.",
    "Looking for collaborators on a small app.",
    "Share your favorite articles.",
    "Question: how do I fix this error?",
    "I found a cool library that simplifies things.",
    "Community meetup ideas?",
    "Share screenshots of your setup.",
    "Anyone tried the new beta?",
    "Show off your latest work!",
  ];

  const totalPostsPerCommunity = 25; // ~300 posts across communities
  for (const c of communities) {
    for (let i = 0; i < totalPostsPerCommunity; i++) {
      const author = rand(users);
      const content = `${rand(sentences)}\n\n(Post ${i + 1} in r/${c.name})`;
      await prisma.post.create({
        data: {
          content,
          approved: true,
          authorId: author.id,
          communityId: c.id,
        },
      });
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
