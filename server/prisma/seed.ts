// prisma/seed.ts
import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma";

async function main() {
  console.log("Начинаем сидирование...");

  console.log("Очищаем существующие данные...");

  try {
    // Удаляем в обратном порядке зависимостей
    await prisma.playthrough.deleteMany();
    await prisma.choice.deleteMany();
    await prisma.node.deleteMany();
    await prisma.story.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ Данные успешно очищены");
  } catch (error) {
    console.error("❌ Ошибка при очистке данных:", error);
    // Если таблиц еще нет - это нормально, продолжаем
    console.log("Продолжаем создание данных...");
  }

  // 1. Создаем пользователей
  console.log("Создаем пользователей...");

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      username: "alice_user",
      email: "alice@example.com",
      password: await bcrypt.hash("12345678Qq!", 10),
      role: UserRole.USER,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      username: "bob_user",
      email: "bob@example.com",
      password: await bcrypt.hash("12345678Qq!", 10),
      role: UserRole.USER,
    },
  });

  const authorJohn = await prisma.user.upsert({
    where: { email: "john.author@example.com" },
    update: {},
    create: {
      username: "author_john",
      email: "john.author@example.com",
      password: await bcrypt.hash("12345678Qq!", 10),
      role: UserRole.AUTHOR,
    },
  });

  const authorEmma = await prisma.user.upsert({
    where: { email: "emma.author@example.com" },
    update: {},
    create: {
      username: "author_emma",
      email: "emma.author@example.com",
      password: await bcrypt.hash("12345678Qq!", 10),
      role: UserRole.AUTHOR,
    },
  });

  const mike = await prisma.user.upsert({
    where: { email: "mike@example.com" },
    update: {},
    create: {
      username: "mike_hybrid",
      email: "mike@example.com",
      password: await bcrypt.hash("12345678Qq!", 10),
      role: UserRole.USER,
    },
  });

  console.log("Пользователи созданы:", {
    alice: alice.username,
    bob: bob.username,
    authorJohn: authorJohn.username,
    authorEmma: authorEmma.username,
    mike: mike.username,
  });

  // 2. Создаем истории (просто создаем, без upsert с составным ключом)
  console.log("Создаем истории...");

  // Первая история - фэнтези от Джона
  const fantasyStory = await prisma.story.create({
    data: {
      title: "Путешествие в Забытые Земли",
      cover: "covers/journey_to_Forgotten_Lands.jpg",
      genre: "Фэнтези",
      authorName: "Джон Сторителлер",
      description: "Эпическое фэнтезийное приключение в мире магии и драконов.",
      isPublished: true,
      authorId: authorJohn.id,
    },
  });

  // Вторая история - киберпанк от Эммы
  const cyberpunkStory = await prisma.story.create({
    data: {
      title: "Киберпанк: Нейрошпион",
      cover:  "covers/Cyberpunk_Neurospy.png",
      genre: "Научная фантастика",
      authorName: "Эмма Техно",
      description: "Киберпанк история о хакере в неоновом городе будущего.",
      isPublished: true,
      authorId: authorEmma.id,
    },
  });

  // Третья история - черновик
  const horrorStory = await prisma.story.create({
    data: {
      title: "Тайна Старого Особняка",
      cover: "covers/the_Mystery_of_the_Old_Mansion.jpg",
      genre: "Хоррор",
      authorName: "Джон Сторителлер",
      description: "Страшная история с привидениями в заброшенном особняке.",
      isPublished: false,
      authorId: authorJohn.id,
    },
  });

  console.log("Истории созданы:", {
    fantasy: fantasyStory.title,
    cyberpunk: cyberpunkStory.title,
    horror: horrorStory.title,
  });

  // 3. Создаем узлы для фэнтези истории
  console.log("Создаем узлы для фэнтези истории...");

  const fantasyNodes = await Promise.all([
    prisma.node.create({
      data: {
        picture: "forest_entrance.jpg",
        title: "Вход в Забытый Лес",
        content:
          "Вы стоите на краю древнего леса. Тропинка ведет вглубь чащи. Воздух наполнен магией.",
        isStart: true,
        isEnd: false,
        // Верхний левый узел
        position_x: 0,
        position_y: 0,
        storyId: fantasyStory.id,
      },
    }),
    prisma.node.create({
      data: {
        picture: "river_crossing.jpg",
        title: "Таинственная Река",
        content:
          "Вы вышли к быстрой реке. Мост выглядит старым и ненадежным. На другом берегу виднеется пещера.",
        isStart: false,
        isEnd: false,
        // Узел справа от входа в лес
        position_x: 320,
        position_y: 0,
        storyId: fantasyStory.id,
      },
    }),
    prisma.node.create({
      data: {
        picture: "dragon_cave.jpg",
        title: "Логово Дракона",
        content:
          "В пещере вы находите спящего дракона. Рядом с ним блестит сокровище.",
        isStart: false,
        isEnd: false,
        // Центр композиции
        position_x: 640,
        position_y: 0,
        storyId: fantasyStory.id,
      },
    }),
    prisma.node.create({
      data: {
        picture: "victory.jpg",
        title: "Победа!",
        content:
          "Вы победили дракона и забрали сокровище! Лес снова в безопасности.",
        isStart: false,
        isEnd: true,
        // Финал «Победа» — чуть выше и правее
        position_x: 960,
        position_y: -160,
        storyId: fantasyStory.id,
      },
    }),
    prisma.node.create({
      data: {
        picture: "defeat.jpg",
        title: "Поражение",
        content:
          "Дракон оказался слишком сильным. Ваше приключение закончилось здесь...",
        isStart: false,
        isEnd: true,
        // Финал «Поражение» — чуть ниже и правее
        position_x: 960,
        position_y: 160,
        storyId: fantasyStory.id,
      },
    }),
  ]);

  // 4. Создаем узлы для киберпанк истории
  console.log("Создаем узлы для киберпанк истории...");

  const cyberpunkNodes = await Promise.all([
    prisma.node.create({
      data: {
        picture: "neon_city.jpg",
        title: "Неоновые Улицы",
        content:
          "Ночь 2077 года. Дождь стучит по неоновым вывескам. У вас есть задание.",
        isStart: true,
        isEnd: false,
        // Старт киберпанк-истории — внизу слева
        position_x: 0,
        position_y: 360,
        storyId: cyberpunkStory.id,
      },
    }),
    prisma.node.create({
      data: {
        picture: "corp_building.jpg",
        title: 'Корпорация "НейроТек"',
        content:
          "Вы проникаете в штаб-квартиру корпорации. Охранные системы активны.",
        isStart: false,
        isEnd: false,
        // Следующий шаг по горизонтали
        position_x: 320,
        position_y: 360,
        storyId: cyberpunkStory.id,
      },
    }),
    prisma.node.create({
      data: {
        picture: "server_room.jpg",
        title: "Серверная",
        content: "Вы нашли главный сервер. Данные защищены крипто-щитом.",
        isStart: false,
        isEnd: false,
        position_x: 640,
        position_y: 360,
        storyId: cyberpunkStory.id,
      },
    }),
    prisma.node.create({
      data: {
        picture: "escape.jpg",
        title: "Побег",
        content:
          "Задание выполнено! Вы скрываетесь с данными, пока не сработала тревога.",
        isStart: false,
        isEnd: true,
        // Финал киберпанк-истории
        position_x: 960,
        position_y: 360,
        storyId: cyberpunkStory.id,
      },
    }),
  ]);

  console.log(
    `Создано узлов: фэнтези - ${fantasyNodes.length}, киберпанк - ${cyberpunkNodes.length}`,
  );

  // 5. Создаем выборы для фэнтези истории
  console.log("Создаем выборы для фэнтези истории...");

  await prisma.choice.createMany({
    data: [
      {
        choiceText: "Войти в лес",
        fromNodeId: fantasyNodes[0].id,
        toNodeId: fantasyNodes[1].id,
      },
      {
        choiceText: "Осмотреться вокруг",
        fromNodeId: fantasyNodes[0].id,
        toNodeId: fantasyNodes[1].id,
      },
      {
        choiceText: "Перейти по мосту",
        fromNodeId: fantasyNodes[1].id,
        toNodeId: fantasyNodes[2].id,
      },
      {
        choiceText: "Атаковать дракона",
        fromNodeId: fantasyNodes[2].id,
        toNodeId: fantasyNodes[3].id,
      },
      {
        choiceText: "Попытаться украсть сокровище",
        fromNodeId: fantasyNodes[2].id,
        toNodeId: fantasyNodes[4].id,
      },
    ],
  });

  // 6. Создаем выборы для киберпанк истории
  console.log("Создаем выборы для киберпанк истории...");

  await prisma.choice.createMany({
    data: [
      {
        choiceText: "Отправиться на задание",
        fromNodeId: cyberpunkNodes[0].id,
        toNodeId: cyberpunkNodes[1].id,
      },
      {
        choiceText: "Взломать систему безопасности",
        fromNodeId: cyberpunkNodes[1].id,
        toNodeId: cyberpunkNodes[2].id,
      },
      {
        choiceText: "Скачать данные и бежать",
        fromNodeId: cyberpunkNodes[2].id,
        toNodeId: cyberpunkNodes[3].id,
      },
    ],
  });

  // 7. Создаем прохождения
  console.log("Создаем прохождения...");

  // Alice завершает фэнтези историю
  const aliceFantasyPlaythrough = await prisma.playthrough.create({
    data: {
      isCompleted: true,
      variables: {
        сила: 15,
        ловкость: 10,
        интеллект: 8,
        предметы: ["меч", "зелье лечения"],
        золото: 100,
      },
      userId: alice.id,
      storyId: fantasyStory.id,
      currentNodeId: fantasyNodes[3].id, // Победа
      completedAt: new Date(),
    },
  });

  // Bob начинает киберпанк историю
  const bobCyberpunkPlaythrough = await prisma.playthrough.create({
    data: {
      isCompleted: false,
      variables: {
        хакерские_навыки: 12,
        стелс: 8,
        киберимпланты: ["нейроинтерфейс", "тепловое зрение"],
        кредиты: 5000,
      },
      userId: bob.id,
      storyId: cyberpunkStory.id,
      currentNodeId: cyberpunkNodes[1].id, // Корпорация
    },
  });

  // Alice начинает киберпанк историю
  const aliceCyberpunkPlaythrough = await prisma.playthrough.create({
    data: {
      isCompleted: false,
      variables: {
        хакерские_навыки: 10,
        стелс: 15,
        киберимпланты: ["нейроинтерфейс"],
        кредиты: 3000,
      },
      userId: alice.id,
      storyId: cyberpunkStory.id,
      currentNodeId: cyberpunkNodes[0].id, // Начало
    },
  });

  // Mike начинает хоррор историю
  const mikeHorrorPlaythrough = await prisma.playthrough.create({
    data: {
      isCompleted: false,
      variables: {
        смелость: 7,
        внимательность: 12,
        фонарик: true,
        записи: ["старая газета"],
      },
      userId: mike.id,
      storyId: horrorStory.id,
      currentNodeId: fantasyNodes[0].id, // Временно используем узел из другой истории
    },
  });

  console.log("Прохождения созданы:", {
    aliceFantasy: aliceFantasyPlaythrough.id,
    bobCyberpunk: bobCyberpunkPlaythrough.id,
    aliceCyberpunk: aliceCyberpunkPlaythrough.id,
    mikeHorror: mikeHorrorPlaythrough.id,
  });

  console.log("✅ Сидирование успешно завершено!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Ошибка при сидировании:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
