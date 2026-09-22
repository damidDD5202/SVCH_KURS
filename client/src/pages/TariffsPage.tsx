import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { LoadingBlock } from "../components/ui/LoadingBlock";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { TariffCard, type TariffItem } from "../components/tariffs/TariffCard";
import "./TariffsPage.css";
import { useToast } from "../components/ui/Toast";
import { useApi } from "../lib/api";
import { useSettings } from "../state/settings";

type SubRow = {
  tariffId: string;
  tariff: TariffItem;
};

export function TariffsPage() {
  const api = useApi();
  const toast = useToast();
  const { t } = useSettings();
  const [tariffs, setTariffs] = useState<TariffItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ items: TariffItem[] }>("/tariffs"),
      api.get<{ items: SubRow[] }>("/tariffs/my").catch(() => ({ items: [] })),
    ])
      .then(([all, mine]) => {
        setTariffs(all.items);
        setActiveId(mine.items[0]?.tariffId ?? null);
      })
      .catch((e: any) => setError(e?.message ?? t("common.loadError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function subscribe(tariffId: string) {
    setSubLoading(true);
    try {
      await api.post("/tariffs/subscribe", { tariffId });
      setActiveId(tariffId);
      toast.show(t("tariffs.subscribed"), "success");
    } catch (e: any) {
      toast.show(e?.message ?? t("tariffs.subscribeError"), "error");
    } finally {
      setSubLoading(false);
    }
  }

  async function cancelTariff() {
    setSubLoading(true);
    try {
      await api.post("/tariffs/cancel");
      setActiveId(null);
      toast.show(t("tariffs.cancelled"), "info");
    } catch (e: any) {
      toast.show(e?.message ?? t("tariffs.cancelError"), "error");
    } finally {
      setSubLoading(false);
    }
  }

  const activeTariff = tariffs.find((tariff) => tariff.id === activeId);

  return (
    <section>
      <PageHeader title={t("tariffs.title")} description={t("tariffs.lead")} />
      {loading && <LoadingBlock />}
      {error && <Alert variant="error">{error}</Alert>}
      {activeTariff && (
        <Card as="section" style={{ marginBottom: 16 }}>
          <p>
            {t("tariffs.active", { name: activeTariff.name, price: activeTariff.pricePerDay })}
          </p>
          <Button type="button" variant="secondary" style={{ marginTop: 12 }} onClick={cancelTariff} disabled={subLoading}>
            {subLoading ? t("tariffs.cancelling") : t("tariffs.cancelPlan")}
          </Button>
        </Card>
      )}
      <div className="tariffsGrid">
        {tariffs.map((tariff) => (
          <TariffCard
            key={tariff.id}
            tariff={tariff}
            active={activeId === tariff.id}
            loading={subLoading}
            onSelect={() => subscribe(tariff.id)}
            onCancel={activeId === tariff.id ? cancelTariff : undefined}
          />
        ))}
      </div>
    </section>
  );
}
