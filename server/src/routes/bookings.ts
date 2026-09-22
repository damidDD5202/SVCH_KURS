import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireActiveSubscription } from "../lib/subscription.js";
import { requireAuth } from "../middleware/auth.js";

export const bookingsRouter = Router();

bookingsRouter.get("/bookings/my", requireAuth, async (req, res) => {
  const userId = req.auth!.userId;
  const items = await prisma.booking.findMany({
    where: { userId },
    orderBy: { startAt: "desc" },
    include: {
      resource: {
        include: {
          location: { select: { id: true, name: true, city: true, address: true } },
          type: { select: { code: true, name: true } },
        },
      },
      payment: true,
    },
  });
  res.json({ items });
});

const CreateBookingSchema = z.object({
  resourceId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

bookingsRouter.post("/bookings", requireAuth, async (req, res) => {
  const parsed = CreateBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const userId = req.auth!.userId;
  const { resourceId } = parsed.data;
  const startAt = new Date(parsed.data.startAt);
  const endAt = new Date(parsed.data.endAt);

  if (req.auth!.role === "CLIENT") {
    const subscriptionCheck = await requireActiveSubscription(userId);
    if (!subscriptionCheck.ok) {
      res.status(403).json({ message: subscriptionCheck.message });
      return;
    }
  }

  if (!(startAt instanceof Date) || isNaN(startAt.getTime()) || !(endAt instanceof Date) || isNaN(endAt.getTime())) {
    res.status(400).json({ message: "Invalid dates" });
    return;
  }
  if (endAt <= startAt) {
    res.status(400).json({ message: "endAt must be greater than startAt" });
    return;
  }

  const resource = await prisma.resource.findFirst({ where: { id: resourceId, isActive: true } });
  if (!resource) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  // Conflict check: overlap with any CONFIRMED booking for the same resource
  const conflict = await prisma.booking.findFirst({
    where: {
      resourceId,
      status: "CONFIRMED",
      AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
    },
    select: { id: true },
  });
  if (conflict) {
    res.status(409).json({ message: "На это время место уже занято" });
    return;
  }

  const booking = await prisma.booking.create({
    data: { userId, resourceId, startAt, endAt, status: "CONFIRMED" },
    include: {
      resource: {
        include: {
          location: { select: { id: true, name: true, city: true, address: true } },
          type: { select: { code: true, name: true } },
        },
      },
    },
  });

  res.status(201).json({ booking });
});

bookingsRouter.post("/bookings/:id/cancel", requireAuth, async (req, res) => {
  const IdSchema = z.object({ id: z.string().uuid() });
  const parsed = IdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const userId = req.auth!.userId;

  const existing = await prisma.booking.findUnique({ where: { id: parsed.data.id } });
  if (!existing) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  if (existing.userId !== userId && req.auth!.role !== "ADMIN" && req.auth!.role !== "MANAGER") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  if (existing.status !== "CONFIRMED") {
    res.status(400).json({ message: "Бронирование уже отменено" });
    return;
  }
  if (existing.endAt.getTime() < Date.now()) {
    res.status(400).json({ message: "Нельзя отменить завершённое бронирование" });
    return;
  }

  const updated = await prisma.booking.update({
    where: { id: parsed.data.id },
    data: { status: "CANCELLED" },
  });
  res.json({ booking: updated });
});

