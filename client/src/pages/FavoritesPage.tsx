import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ResourceCard } from "../components/resources/ResourceCard";
import { PageHeader } from "../components/ui/PageHeader";
import { LoadingBlock } from "../components/ui/LoadingBlock";
import "./ResourcesPage.css";
import { Alert } from "../components/ui/Alert";
import { EmptyState } from "../components/ui/EmptyState";
import { useToast } from "../components/ui/Toast";
import { SubscriptionBanner } from "../components/tariffs/SubscriptionBanner";
import { useActiveTariff } from "../hooks/useActiveTariff";
import type { ResourceItem } from "../lib/resourceUtils";
import { useApi } from "../lib/api";
import { useAuth } from "../state/auth";
import { useSettings } from "../state/settings";

type FavoriteRow = {
  resourceId: string;
  resource: ResourceItem;
};

export function FavoritesPage() {
  const api = useApi();
  const nav = useNavigate();
  const toast = useToast();
  const { t } = useSettings();
  const { user } = useAuth();
  const { activeTariff, hasSubscription, loading: subLoading } = useActiveTariff();
  const canBook = user?.role !== "CLIENT" || hasSubscription;
  const [items, setItems] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    api
      .get<{ items: FavoriteRow[] }>("/favorites")
      .then((r) => setItems(r.items))
      .catch((e: any) => setError(e?.message ?? t("common.loadError")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleFavorite(resourceId: string) {
    try {
      const r = await api.post<{ isFavorite: boolean }>("/favorites/toggle", { resourceId });
      if (!r.isFavorite) {
        setItems((prev) => prev.filter((x) => x.resourceId !== resourceId));
        toast.show(t("resources.favRemoved"), "info");
      }
    } catch (e: any) {
      toast.show(e?.message ?? t("common.error"), "error");
    }
  }

  return (
    <section>
      <PageHeader title={t("favorites.title")} description={t("favorites.lead")} />
      {user?.role === "CLIENT" && <SubscriptionBanner activeTariff={activeTariff} loading={subLoading} />}
      {loading && <LoadingBlock />}
      {error && <Alert variant="error">{error}</Alert>}
      {!loading && items.length === 0 && (
        <EmptyState
          title={t("favorites.emptyTitle")}
          description={
            <>
              {t("favorites.emptyDescStart")} <Link to="/resources">{t("nav.resources")}</Link>
              {t("favorites.emptyDescEnd")}
            </>
          }
        />
      )}
      <div className="resourcesGrid">
        {items.map((row) => (
          <ResourceCard
            key={row.resourceId}
            item={row.resource}
            isFavorite
            showRemoveFavorite
            bookingEnabled={canBook}
            onBook={() => {
              if (!canBook) {
                toast.show(t("resources.needTariff"), "error");
                nav("/tariffs");
                return;
              }
              nav("/resources");
            }}
            onToggleFavorite={() => toggleFavorite(row.resourceId)}
          />
        ))}
      </div>
    </section>
  );
}
