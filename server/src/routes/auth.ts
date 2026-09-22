import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { firstZodMessage, RegisterSchema } from "../lib/authValidation.js";
import { prisma } from "../lib/prisma.js";
import { signAccessToken } from "../lib/auth.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/auth/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodMessage(parsed.error), issues: parsed.error.issues });
    return;
  }

  const { email, password, fullName } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: "Этот email уже зарегистрирован" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName, role: "CLIENT" },
    select: { id: true, email: true, fullName: true, role: true },
  });

  const token = signAccessToken({ sub: user.id, role: user.role });
  res.status(201).json({ token, user });
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/auth/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = signAccessToken({ sub: user.id, role: user.role });
  res.json({
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
  });
});

authRouter.get("/auth/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ user });
});

const ProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

authRouter.patch("/auth/profile", requireAuth, async (req, res) => {
  const parsed = ProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }
  const data = parsed.data;
  if (data.email) {
    const clash = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id: req.auth!.userId } },
    });
    if (clash) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }
  }
  const user = await prisma.user.update({
    where: { id: req.auth!.userId },
    data,
    select: { id: true, email: true, fullName: true, role: true },
  });
  res.json({ user });
});

