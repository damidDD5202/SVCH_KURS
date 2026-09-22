import { prisma } from "./prisma.js";

export async function getActiveSubscription(userId: string) {
  return prisma.userSubscription.findFirst({
    where: { userId, isActive: true },
    include: { tariff: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function requireActiveSubscription(userId: string) {
  const subscription = await getActiveSubscription(userId);
  if (!subscription) {
    return {
      ok: false as const,
      message: "Для бронирования нужен активный тариф. Подключите подписку на странице «Тарифы».",
    };
  }
  return { ok: true as const, subscription };
}
