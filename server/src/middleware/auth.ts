import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: "CLIENT" | "MANAGER" | "ADMIN" };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireRole(roles: Array<"CLIENT" | "MANAGER" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
}

