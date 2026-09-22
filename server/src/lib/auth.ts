import jwt from "jsonwebtoken";
import { env } from "./env.js";

export type JwtPayload = {
  sub: string;
  role: "CLIENT" | "MANAGER" | "ADMIN";
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token");
  }
  const sub = (decoded as any).sub;
  const role = (decoded as any).role;
  if (typeof sub !== "string") throw new Error("Invalid token payload");
  if (role !== "CLIENT" && role !== "MANAGER" && role !== "ADMIN") {
    throw new Error("Invalid token role");
  }
  return { sub, role };
}

