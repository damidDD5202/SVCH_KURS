import { z } from "zod";

export const REGISTER_LIMITS = {
  fullNameMin: 2,
  fullNameMax: 120,
  emailMax: 254,
  passwordMin: 8,
  passwordMax: 128,
} as const;

function hasLetter(value: string) {
  return /[a-zA-Zа-яА-ЯёЁ]/.test(value);
}

function hasDigit(value: string) {
  return /\d/.test(value);
}

export const RegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Укажите email")
    .email("Некорректный email")
    .max(REGISTER_LIMITS.emailMax, `Email не длиннее ${REGISTER_LIMITS.emailMax} символов`),
  password: z
    .string()
    .min(
      REGISTER_LIMITS.passwordMin,
      `Пароль должен содержать не менее ${REGISTER_LIMITS.passwordMin} символов`,
    )
    .max(REGISTER_LIMITS.passwordMax, `Пароль не длиннее ${REGISTER_LIMITS.passwordMax} символов`)
    .refine(hasLetter, "Пароль должен содержать буквы")
    .refine(hasDigit, "Пароль должен содержать цифры"),
  fullName: z
    .string()
    .trim()
    .min(
      REGISTER_LIMITS.fullNameMin,
      `ФИО должно содержать не менее ${REGISTER_LIMITS.fullNameMin} символов`,
    )
    .max(REGISTER_LIMITS.fullNameMax, `ФИО не длиннее ${REGISTER_LIMITS.fullNameMax} символов`),
});

export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Некорректные данные";
}
