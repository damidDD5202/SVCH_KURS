import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import { useAuth } from "../state/auth";
import { useSettings } from "../state/settings";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { UtilizationChart } from "../components/reports/UtilizationChart";
import "./ReportsPage.css";
import { useApi } from "../lib/api";
import { useToast } from "../components/ui/Toast";

async function fetchPdfBlob(url: string, token: string, fallbackError: string) {
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const text = await res.text();
    let message = fallbackError;
    try {
      message = JSON.parse(text).message ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.blob();
}

export function ReportsPage() {
  const { token, user } = useAuth();
  const api = useApi();
  const toast = useToast();
  const { t } = useSettings();
  const isAllowed = user?.role === "MANAGER" || user?.role === "ADMIN";
  const [points, setPoints] = useState<Array<{ label: string; hours: number }>>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!isAllowed) return;
    api
      .get<{ points: Array<{ label: string; hours: number }> }>("/reports/utilization-chart")
      .then((r) => setPoints(r.points))
      .catch(() => {});
  }, [api, isAllowed]);

  async function run(action: "open" | "download", kind: "utilization" | "revenue") {
    if (!token) return;
    const path = kind === "utilization" ? "/reports/utilization.pdf" : "/reports/revenue.pdf";
    const url = `${API_BASE}${path}?${action === "download" ? "download=1" : ""}`;
    const filename = kind === "utilization" ? "otchet-zagruzka.pdf" : "otchet-vyruchka.pdf";
    setBusy(kind + action);
    try {
      if (action === "open") {
        const blob = await fetchPdfBlob(url, token, t("reports.fetchError"));
        const href = URL.createObjectURL(blob);
        window.open(href, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
        toast.show(t("reports.opened"), "success");
      } else {
        const blob = await fetchPdfBlob(`${API_BASE}${path}?download=1`, token, t("reports.fetchError"));
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(href);
        toast.show(t("reports.downloaded"), "success");
      }
    } catch (e: any) {
      toast.show(e?.message ?? t("reports.error"), "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="row">
      <PageHeader title={t("reports.title")} description={t("reports.lead")} />

      {!isAllowed ? (
        <Alert variant="error">{t("reports.noAccess")}</Alert>
      ) : (
        <>
          <Card as="section">
            <h2>{t("reports.chartTitle")}</h2>
            <UtilizationChart points={points} />
          </Card>

          <Card as="section" className="reportActionsCard">
            <h2>{t("reports.utilTitle")}</h2>
            <p className="muted" style={{ marginTop: 6 }}>
              {t("reports.utilLead")}
            </p>
            <div className="reportActions">
              <Button type="button" disabled={!!busy} onClick={() => run("open", "utilization")}>
                {busy === "utilizationopen" ? t("reports.opening") : t("reports.openPdf")}
              </Button>
              <Button type="button" variant="secondary" disabled={!!busy} onClick={() => run("download", "utilization")}>
                {t("reports.download")}
              </Button>
            </div>
          </Card>

          <Card as="section" className="reportActionsCard">
            <h2>{t("reports.financeTitle")}</h2>
            <p className="muted" style={{ marginTop: 6 }}>
              {t("reports.financeLead")}
            </p>
            <div className="reportActions">
              <Button type="button" disabled={!!busy} onClick={() => run("open", "revenue")}>
                {busy === "revenueopen" ? t("reports.opening") : t("reports.openPdf")}
              </Button>
              <Button type="button" variant="secondary" disabled={!!busy} onClick={() => run("download", "revenue")}>
                {t("reports.download")}
              </Button>
            </div>
            <p className="muted" style={{ marginTop: 10 }}>
              {t("reports.role", { role: user?.role ?? "" })}
            </p>
          </Card>
        </>
      )}
    </section>
  );
}
