import { translate } from "./i18n";

export const REGISTER_LIMITS = {
  fullNameMin: 2,
  fullNameMax: 120,
  emailMax: 254,
  passwordMin: 8,
  passwordMax: 128,
} as const;

export type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
};

export type RegisterFieldErrors = Partial<Record<keyof RegisterFormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hasLetter(value: string) {
  return /[a-zA-Zа-яА-ЯёЁ]/.test(value);
}

function hasDigit(value: string) {
  return /\d/.test(value);
}

export function validateRegisterForm(values: RegisterFormValues): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};
  const fullName = values.fullName.trim();
  const email = values.email.trim();
  const { password } = values;

  if (!fullName) {
    errors.fullName = translate("auth.errFullNameRequired");
  } else if (fullName.length < REGISTER_LIMITS.fullNameMin) {
    errors.fullName = translate("auth.errFullNameMin", { min: REGISTER_LIMITS.fullNameMin });
  } else if (fullName.length > REGISTER_LIMITS.fullNameMax) {
    errors.fullName = translate("auth.errFullNameMax", { max: REGISTER_LIMITS.fullNameMax });
  }

  if (!email) {
    errors.email = translate("auth.errEmailRequired");
  } else if (email.length > REGISTER_LIMITS.emailMax) {
    errors.email = translate("auth.errEmailMax", { max: REGISTER_LIMITS.emailMax });
  } else if (!EMAIL_RE.test(email)) {
    errors.email = translate("auth.errEmailInvalid");
  }

  if (!password) {
    errors.password = translate("auth.errPasswordRequired");
  } else if (password.length < REGISTER_LIMITS.passwordMin) {
    errors.password = translate("auth.errPasswordMin", { min: REGISTER_LIMITS.passwordMin });
  } else if (password.length > REGISTER_LIMITS.passwordMax) {
    errors.password = translate("auth.errPasswordMax", { max: REGISTER_LIMITS.passwordMax });
  } else if (!hasLetter(password) || !hasDigit(password)) {
    errors.password = translate("auth.errPasswordComplex");
  }

  return errors;
}

export function normalizeRegisterForm(values: RegisterFormValues): RegisterFormValues {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    password: values.password,
  };
}
