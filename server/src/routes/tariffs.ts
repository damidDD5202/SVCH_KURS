import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const tariffsRouter = Router();

tariffsRouter.get("/tariffs", async (_req, res) => {
  const items = await prisma.tariff.findMany({
    where: { isActive: true },
    orderBy: { pricePerDay: "asc" },
  });
  res.json({ items });
});

tariffsRouter.get("/tariffs/my", requireAuth, async (req, res) => {
  const userId = req.auth!.userId;
  const items = await prisma.userSubscription.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
    include: { tariff: true },
  });
  res.json({ items });
});

const SubscribeSchema = z.object({ tariffId: z.string().uuid() });

tariffsRouter.post("/tariffs/subscribe", requireAuth, async (req, res) => {
  const parsed = SubscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }
  const userId = req.auth!.userId;
  const tariff = await prisma.tariff.findFirst({
    where: { id: parsed.data.tariffId, isActive: true },
  });
  if (!tariff) {
    res.status(404).json({ message: "Tariff not found" });
    return;
  }
  await prisma.userSubscription.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false, endsAt: new Date() },
  });
  const subscription = await prisma.userSubscription.create({
    data: { userId, tariffId: tariff.id },
    include: { tariff: true },
  });
  res.status(201).json({ subscription });
});

tariffsRouter.post("/tariffs/cancel", requireAuth, async (req, res) => {
  const userId = req.auth!.userId;
  const updated = await prisma.userSubscription.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false, endsAt: new Date() },
  });
  if (updated.count === 0) {
    res.status(404).json({ message: "Нет активного тарифа" });
    return;
  }
  res.json({ ok: true });
});
