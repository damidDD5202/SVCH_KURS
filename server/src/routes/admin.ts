import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const adminRouter = Router();

const CreateResourceSchema = z.object({
  locationId: z.string().uuid(),
  typeId: z.string().uuid(),
  name: z.string().min(2),
  capacity: z.number().int().min(1),
  pricePerHour: z.number().int().min(0),
  amenities: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

const UpdateResourceSchema = CreateResourceSchema.partial();

adminRouter.get(
  "/admin/resources",
  requireAuth,
  requireRole(["ADMIN"]),
  async (_req, res) => {
    const items = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        location: { select: { id: true, name: true, city: true } },
        type: { select: { id: true, code: true, name: true } },
      },
    });
    res.json({ items });
  },
);

adminRouter.get(
  "/admin/locations",
  requireAuth,
  requireRole(["ADMIN"]),
  async (_req, res) => {
    const items = await prisma.location.findMany({ orderBy: { city: "asc" } });
    res.json({ items });
  },
);

adminRouter.get(
  "/admin/resource-types",
  requireAuth,
  requireRole(["ADMIN"]),
  async (_req, res) => {
    const items = await prisma.resourceType.findMany({ orderBy: { name: "asc" } });
    res.json({ items });
  },
);

adminRouter.post(
  "/admin/resources",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const parsed = CreateResourceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
      return;
    }
    const resource = await prisma.resource.create({
      data: parsed.data,
      include: {
        location: { select: { id: true, name: true, city: true } },
        type: { select: { id: true, code: true, name: true } },
      },
    });
    res.status(201).json({ resource });
  },
);

adminRouter.patch(
  "/admin/resources/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const IdSchema = z.object({ id: z.string().uuid() });
    const idParsed = IdSchema.safeParse(req.params);
    if (!idParsed.success) {
      res.status(400).json({ message: "Invalid id" });
      return;
    }
    const parsed = UpdateResourceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
      return;
    }
    const existing = await prisma.resource.findUnique({ where: { id: idParsed.data.id } });
    if (!existing) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
    const resource = await prisma.resource.update({
      where: { id: idParsed.data.id },
      data: parsed.data,
      include: {
        location: { select: { id: true, name: true, city: true } },
        type: { select: { id: true, code: true, name: true } },
      },
    });
    res.json({ resource });
  },
);

adminRouter.delete(
  "/admin/resources/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const IdSchema = z.object({ id: z.string().uuid() });
    const parsed = IdSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid id" });
      return;
    }
    const existing = await prisma.resource.findUnique({ where: { id: parsed.data.id } });
    if (!existing) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
    await prisma.resource.update({
      where: { id: parsed.data.id },
      data: { isActive: false },
    });
    res.json({ ok: true });
  },
);
