import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { useToast } from "../components/ui/Toast";
import { useApi } from "../lib/api";
import { useAuth } from "../state/auth";
import { useSettings } from "../state/settings";
import { clearAllPreferences } from "../lib/preferences";

type MeUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt?: string;
};

export function ProfilePage() {
  const api = useApi();
  const { user, setAuth, token } = useAuth();
  const { t } = useSettings();
  const toast = useToast();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ user: MeUser }>("/auth/me")
      .then((r) => {
        setFullName(r.user.fullName);
        setEmail(r.user.email);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !user) return;
    setLoading(true);
    setError(null);
    try {
      const r = await api.patch<{ user: MeUser }>("/auth/profile", { fullName, email });
      setAuth({ token, user: { ...user, fullName: r.user.fullName, email: r.user.email } });
      toast.show(t("profile.saved"), "success");
    } catch (err: any) {
      setError(err?.message ?? t("profile.saveError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <PageHeader title={t("profile.title")} description={t("profile.lead")} />
      <Card as="article">
        <form className="row" onSubmit={onSave}>
          <Field label={t("common.fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Field label={t("common.email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" disabled={loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </form>
        {error && <Alert variant="error">{error}</Alert>}
      </Card>

      <Card as="section" style={{ marginTop: 16 }}>
        <h2>{t("profile.settingsTitle")}</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          {t("profile.settingsLead")}
        </p>
        <Button
          type="button"
          variant="secondary"
          style={{ marginTop: 12 }}
          onClick={() => {
            clearAllPreferences();
            toast.show(t("profile.settingsReset"), "info");
            window.location.reload();
          }}
        >
          {t("profile.resetSettings")}
        </Button>
      </Card>
    </section>
  );
}
