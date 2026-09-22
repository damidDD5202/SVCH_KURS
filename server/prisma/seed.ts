import "dotenv/config";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]!;
}

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  await prisma.userSubscription.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.resourceType.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tariff.deleteMany();

  const [admin, manager, client] = await Promise.all([
    prisma.user.create({
      data: { email: "admin@cowork.local", fullName: "Администратор", passwordHash, role: "ADMIN" },
    }),
    prisma.user.create({
      data: { email: "manager@cowork.local", fullName: "Менеджер", passwordHash, role: "MANAGER" },
    }),
    prisma.user.create({
      data: { email: "client@cowork.local", fullName: "Клиент", passwordHash, role: "CLIENT" },
    }),
  ]);

  await prisma.tariff.createMany({
    data: [
      { name: "Дневной тариф", description: "Подписка на 1 день — обязательна для бронирования ресурсов", pricePerDay: 30, isActive: true },
      { name: "Недельный тариф", description: "Подписка на 7 дней — обязательна для бронирования ресурсов", pricePerDay: 25, isActive: true },
      { name: "Месячный тариф", description: "Подписка на 30 дней — обязательна для бронирования ресурсов", pricePerDay: 20, isActive: true },
    ],
  });

  const locations = await prisma.location.createManyAndReturn({
    data: [
      { name: "Центр коворкинга", city: "Могилев", address: "пр-т Мира, 43" },
      { name: "Городской коворкинг", city: "Могилев", address: "ул. Ленинская, 10" },
      { name: "Технопарк", city: "Минск", address: "пр-т Независимости, 1" },
    ],
  });

  const types = await prisma.resourceType.createManyAndReturn({
    data: [
      { code: "DESK", name: "Рабочее место" },
      { code: "MEETING", name: "Переговорная" },
      { code: "EVENT", name: "Зал мероприятий" },
    ],
  });

  const amenitiesPool = ["Wi‑Fi", "Проектор", "Маркерная доска", "Кофе", "Розетки", "Кондиционер"];

  const resources: Prisma.ResourceCreateManyInput[] = [];
  for (const loc of locations) {
    for (let i = 1; i <= 40; i += 1) {
      const type = i % 10 === 0 ? pick(types.filter((t) => t.code !== "DESK")) : pick(types);
      resources.push({
        locationId: loc.id,
        typeId: type.id,
        name:
          type.code === "DESK"
            ? `Рабочее место №${i}`
            : type.code === "MEETING"
              ? `Переговорная №${i}`
              : `Зал мероприятий №${i}`,
        capacity: type.code === "DESK" ? 1 : type.code === "MEETING" ? randInt(2, 10) : randInt(10, 40),
        pricePerHour: type.code === "DESK" ? randInt(3, 8) : type.code === "MEETING" ? randInt(10, 25) : randInt(30, 60),
        amenities: Array.from(new Set([pick(amenitiesPool), pick(amenitiesPool), pick(amenitiesPool)])),
        isActive: true,
      });
    }
  }

  const createdResources = await prisma.resource.createManyAndReturn({ data: resources });

  const now = new Date();
  const bookingPlans = [
    { userId: client.id, count: 5 },
    { userId: manager.id, count: 15 },
    { userId: admin.id, count: 5 },
  ];

  const bookingData: Prisma.BookingCreateManyInput[] = [];
  for (const plan of bookingPlans) {
    for (let i = 0; i < plan.count; i += 1) {
      const resource = pick(createdResources);
      const start = new Date(now.getTime() + randInt(-14, 14) * 24 * 60 * 60 * 1000);
      start.setHours(randInt(8, 18), 0, 0, 0);
      const durationHours = randInt(1, 4);
      const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
      bookingData.push({
        userId: plan.userId,
        resourceId: resource.id,
        startAt: start,
        endAt: end,
        status: "CONFIRMED" as const,
      });
    }
  }

  const bookings = await prisma.booking.createManyAndReturn({ data: bookingData });

  await prisma.payment.createMany({
    data: bookings.map((b) => ({
      userId: b.userId,
      bookingId: b.id,
      amount: randInt(5, 120),
      status: "PAID",
    })),
  });

  const favs = new Set<string>();
  while (favs.size < 6) {
    favs.add(pick(createdResources).id);
  }
  await prisma.favorite.createMany({
    data: Array.from(favs).map((rid) => ({ userId: client.id, resourceId: rid })),
    skipDuplicates: true,
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete:", {
    users: 3,
    locations: locations.length,
    resourceTypes: types.length,
    resources: createdResources.length,
    bookings: bookings.length,
  });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

