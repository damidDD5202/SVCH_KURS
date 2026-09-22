import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../state/auth";
import { useSettings } from "../state/settings";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";

type LoginResponse = {
  token: string;
  user: { id: string; email: string; fullName: string; role: "CLIENT" | "MANAGER" | "ADMIN" };
};

export function LoginPage() {
  const { setAuth } = useAuth();
  const { t } = useSettings();
  const nav = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from ?? "/resources";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuth({ token: data.token, user: data.user });
      nav(from, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card authCard">
      <h2>{t("auth.loginTitle")}</h2>
      <form className="row" onSubmit={onSubmit}>
        <Field label={t("common.email")} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label={t("common.password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button disabled={loading} type="submit">
          {loading ? t("auth.loggingIn") : t("nav.login")}
        </Button>
      </form>
      {error && <div className="error">{error}</div>}
      <p style={{ marginTop: 12 }}>
        {t("auth.noAccount")} <Link to="/register">{t("common.register")}</Link>
      </p>
    </div>
  );
}
