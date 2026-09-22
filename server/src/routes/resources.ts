import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const resourcesRouter = Router();

resourcesRouter.get("/resources", async (req, res) => {
  const QuerySchema = z.object({
    city: z.string().optional(),
    locationId: z.string().uuid().optional(),
    typeCode: z.string().optional(),
    minCapacity: z.coerce.number().int().min(1).optional(),
    maxPricePerHour: z.coerce.number().int().min(0).optional(),
    sort: z.enum(["priceAsc", "priceDesc", "capacityDesc"]).optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
  });

  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid query", issues: parsed.error.issues });
    return;
  }

  const q = parsed.data;

  if (Boolean(q.startAt) !== Boolean(q.endAt)) {
    res.status(400).json({ message: "Укажите начало и окончание интервала" });
    return;
  }

  let slotStart: Date | null = null;
  let slotEnd: Date | null = null;
  if (q.startAt && q.endAt) {
    slotStart = new Date(q.startAt);
    slotEnd = new Date(q.endAt);
    if (isNaN(slotStart.getTime()) || isNaN(slotEnd.getTime()) || slotEnd <= slotStart) {
      res.status(400).json({ message: "Некорректный интервал времени" });
      return;
    }
  }

  const where: any = { isActive: true };
  if (q.locationId) where.locationId = q.locationId;
  if (q.minCapacity) where.capacity = { ...(where.capacity ?? {}), gte: q.minCapacity };
  if (q.maxPricePerHour !== undefined) where.pricePerHour = { lte: q.maxPricePerHour };
  if (q.typeCode) where.type = { code: q.typeCode };
  if (q.city) where.location = { city: q.city };

  if (slotStart && slotEnd) {
    where.NOT = {
      bookings: {
        some: {
          status: "CONFIRMED",
          AND: [{ startAt: { lt: slotEnd } }, { endAt: { gt: slotStart } }],
        },
      },
    };
  }

  const orderBy =
    q.sort === "priceAsc"
      ? { pricePerHour: "asc" as const }
      : q.sort === "priceDesc"
        ? { pricePerHour: "desc" as const }
        : q.sort === "capacityDesc"
          ? { capacity: "desc" as const }
          : { createdAt: "desc" as const };

  const items = await prisma.resource.findMany({
    where,
    orderBy,
    include: {
      location: { select: { id: true, name: true, city: true, address: true } },
      type: { select: { code: true, name: true } },
    },
  });

  res.json({ items });
});

