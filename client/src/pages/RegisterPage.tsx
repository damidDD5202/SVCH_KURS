import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import {
  normalizeRegisterForm,
  REGISTER_LIMITS,
  validateRegisterForm,
  type RegisterFieldErrors,
} from "../lib/authValidation";
import { useAuth } from "../state/auth";
import { useSettings } from "../state/settings";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";

type RegisterResponse = {
  token: string;
  user: { id: string; email: string; fullName: string; role: "CLIENT" | "MANAGER" | "ADMIN" };
};

export function RegisterPage() {
  const { setAuth } = useAuth();
  const { t } = useSettings();
  const nav = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = normalizeRegisterForm({ fullName, email, password });
    const nextErrors = validateRegisterForm(payload);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const data = await apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setAuth({ token: data.token, user: data.user });
      nav("/resources", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? t("auth.registerError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card authCard">
      <h2>{t("auth.registerTitle")}</h2>
      <form className="row" onSubmit={onSubmit} noValidate>
        <Field
          label={t("common.fullName")}
          value={fullName}
          maxLength={REGISTER_LIMITS.fullNameMax}
          autoComplete="name"
          onChange={(e) => {
            setFullName(e.target.value);
            if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          error={fieldErrors.fullName}
        />
        <Field
          label={t("common.email")}
          type="email"
          value={email}
          maxLength={REGISTER_LIMITS.emailMax}
          autoComplete="email"
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={fieldErrors.email}
        />
        <Field
          label={t("common.password")}
          type="password"
          value={password}
          maxLength={REGISTER_LIMITS.passwordMax}
          autoComplete="new-password"
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={fieldErrors.password}
        />
        <Button disabled={loading} type="submit">
          {loading ? t("auth.creating") : t("auth.createAccount")}
        </Button>
      </form>
      {error && <div className="error">{error}</div>}
      <p style={{ marginTop: 12 }}>
        {t("auth.hasAccount")} <Link to="/login">{t("nav.login")}</Link>
      </p>
    </div>
  );
}
