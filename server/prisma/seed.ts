// prisma/seed.ts — 20 интерактивных историй
import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma";
import { STORIES } from "./seed-stories";

async function main() {
  console.log("Начинаем сидирование...");

  try {
    await prisma.playthrough.deleteMany();
    await prisma.choice.deleteMany();
    await prisma.node.deleteMany();
    await prisma.story.deleteMany();
    await prisma.user.deleteMany();
    console.log("Данные очищены.");
  } catch (e) {
    console.error("Ошибка при очистке:", e);
  }

  const hash = (p: string) => bcrypt.hash(p, 10);
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { username: "alice_user", email: "alice@example.com", password: await hash("12345678Qq!"), role: UserRole.USER },
  });
  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { username: "bob_user", email: "bob@example.com", password: await hash("12345678Qq!"), role: UserRole.USER },
  });
  const authorJohn = await prisma.user.upsert({
    where: { email: "john.author@example.com" },
    update: {},
    create: { username: "author_john", email: "john.author@example.com", password: await hash("12345678Qq!"), role: UserRole.AUTHOR },
  });
  const authorEmma = await prisma.user.upsert({
    where: { email: "emma.author@example.com" },
    update: {},
    create: { username: "author_emma", email: "emma.author@example.com", password: await hash("12345678Qq!"), role: UserRole.AUTHOR },
  });
  const mike = await prisma.user.upsert({
    where: { email: "mike@example.com" },
    update: {},
    create: { username: "mike_hybrid", email: "mike@example.com", password: await hash("12345678Qq!"), role: UserRole.USER },
  });

  const authorIds = { authorJohn: authorJohn.id, authorEmma: authorEmma.id };

  console.log("Создаём истории...");
  for (const { story: s, nodes, choices } of STORIES) {
    const story = await prisma.story.create({
      data: {
        title: s.title,
        cover: s.cover,
        genre: s.genre,
        authorName: s.authorName,
        description: s.description,
        isPublished: s.isPublished,
        authorId: authorIds[s.authorIdKey],
      },
    });
    const created = await Promise.all(
      nodes.map((n) => prisma.node.create({ data: { ...n, storyId: story.id } })),
    );
    await prisma.choice.createMany({
      data: choices.map((c) => ({
        choiceText: c.choiceText,
        fromNodeId: created[c.from].id,
        toNodeId: created[c.to].id,
      })),
    });
  }

  console.log("Создаём прохождения...");
  const stories = await prisma.story.findMany({ where: { isPublished: true }, include: { nodes: true } });
  const fantasy = stories.find((s) => s.title === "Путешествие в Забытые Земли");
  const cyberpunk = stories.find((s) => s.title === "Киберпанк: Нейрошпион");
  const mansion = stories.find((s) => s.title === "Тайна Старого Особняка");
  if (fantasy?.nodes.length) {
    const endN = fantasy.nodes.find((n) => n.title === "Победа!");
    if (endN) {
      await prisma.playthrough.create({
        data: { isCompleted: true, variables: { сила: 15, ловкость: 10 }, userId: alice.id, storyId: fantasy.id, currentNodeId: endN.id, completedAt: new Date() },
      });
    }
  }
  if (cyberpunk?.nodes.length && cyberpunk.nodes[1]) {
    await prisma.playthrough.create({
      data: { isCompleted: false, variables: { хакерские_навыки: 12 }, userId: bob.id, storyId: cyberpunk.id, currentNodeId: cyberpunk.nodes[1].id },
    });
  }
  if (mansion?.nodes.length) {
    const startM = mansion.nodes.find((n) => n.isStart);
    if (startM) {
      await prisma.playthrough.create({
        data: { isCompleted: false, variables: { внимательность: 12 }, userId: mike.id, storyId: mansion.id, currentNodeId: startM.id },
      });
    }
  }

  console.log("Сидирование завершено.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
