import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
});

export const env = EnvSchema.parse(process.env);

