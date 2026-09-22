import { useEffect, useState } from "react";
import { useApi } from "../lib/api";
import type { TariffItem } from "../components/tariffs/TariffCard";

export function useActiveTariff() {
  const api = useApi();
  const [activeTariff, setActiveTariff] = useState<TariffItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<{ items: Array<{ tariff: TariffItem }> }>("/tariffs/my")
      .then((r) => {
        if (!cancelled) setActiveTariff(r.items[0]?.tariff ?? null);
      })
      .catch(() => {
        if (!cancelled) setActiveTariff(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  return { activeTariff, hasSubscription: activeTariff !== null, loading };
}
