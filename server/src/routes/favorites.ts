import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const favoritesRouter = Router();

favoritesRouter.get("/favorites", requireAuth, async (req, res) => {
  const userId = req.auth!.userId;
  const items = await prisma.favorite.findMany({
    where: { userId, resource: { isActive: true } },
    orderBy: { createdAt: "desc" },
    include: {
      resource: {
        include: {
          location: { select: { id: true, name: true, city: true, address: true } },
          type: { select: { code: true, name: true } },
        },
      },
    },
  });
  res.json({ items });
});

const ToggleSchema = z.object({ resourceId: z.string().uuid() });

favoritesRouter.post("/favorites/toggle", requireAuth, async (req, res) => {
  const parsed = ToggleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const userId = req.auth!.userId;
  const { resourceId } = parsed.data;

  const existing = await prisma.favorite.findUnique({
    where: { userId_resourceId: { userId, resourceId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    res.json({ isFavorite: false });
    return;
  }

  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, isActive: true },
  });
  if (!resource) {
    res.status(404).json({ message: "Ресурс не найден или деактивирован" });
    return;
  }

  await prisma.favorite.create({ data: { userId, resourceId } });
  res.json({ isFavorite: true });
});

