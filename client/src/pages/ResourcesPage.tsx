import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApi } from "../lib/api";
import { useAuth } from "../state/auth";
import { useSettings } from "../state/settings";
import {
  defaultResourceFilters,
  defaultBookingSlot,
  readPreferences,
  slotFilterActive,
  writePreferences,
  type ResourceFilters,
} from "../lib/preferences";
import type { ResourceItem } from "../lib/resourceUtils";
import { typeCodeLabel } from "../lib/resourceUtils";
import { ResourceCard } from "../components/resources/ResourceCard";
import { SearchBox } from "../components/resources/SearchBox";
import { Sidebar } from "../components/layout/Sidebar";
import { BookingModal } from "../components/bookings/BookingModal";
import { Button } from "../components/ui/Button";
import { SelectField } from "../components/ui/SelectField";
import { Field } from "../components/ui/Field";
import { Alert } from "../components/ui/Alert";
import { ChipsRow } from "../components/ui/ChipsRow";
import { Pill } from "../components/ui/Pill";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import "./ResourcesPage.css";
import { EmptyState } from "../components/ui/EmptyState";
import { useToast } from "../components/ui/Toast";
import { SubscriptionBanner } from "../components/tariffs/SubscriptionBanner";
import { useActiveTariff } from "../hooks/useActiveTariff";

type ResourcesResponse = { items: ResourceItem[] };

const RESOURCE_TYPE_CODES = new Set(["DESK", "MEETING", "EVENT"]);

export function ResourcesPage() {
  const api = useApi();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useSettings();
  const { token, user } = useAuth();
  const toast = useToast();
  const { activeTariff, hasSubscription, loading: subLoading } = useActiveTariff();
  const canBook = user?.role !== "CLIENT" || hasSubscription;
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  const [filters, setFilters] = useState<ResourceFilters>(() => readPreferences());
  const { search, city, typeCode, sort, slotStart, slotEnd } = filters;
  const availabilityFilter = slotFilterActive(filters);

  useEffect(() => {
    const urlType = searchParams.get("typeCode");
    if (!urlType || !RESOURCE_TYPE_CODES.has(urlType)) return;
    setFilters((prev) => {
      if (prev.typeCode === urlType) return prev;
      const next = { ...prev, typeCode: urlType };
      writePreferences(next);
      return next;
    });
  }, [searchParams]);

  const setFilter = <K extends keyof ResourceFilters>(key: K, value: ResourceFilters[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      writePreferences(next);
      return next;
    });
  };

  const [bookingResource, setBookingResource] = useState<ResourceItem | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (city) p.set("city", city);
    if (typeCode) p.set("typeCode", typeCode);
    if (sort) p.set("sort", sort);
    if (availabilityFilter) {
      p.set("startAt", new Date(slotStart).toISOString());
      p.set("endAt", new Date(slotEnd).toISOString());
    }
    const qs = p.toString();
    return qs ? `?${qs}` : "";
  }, [availabilityFilter, city, slotEnd, slotStart, sort, typeCode]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<ResourcesResponse>(`/resources${query}`)
      .then((r) => {
        if (!cancelled) setItems(r.items);
      })
      .catch((e: any) => {
        if (!cancelled) setError(e?.message ?? t("common.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api, query, reloadKey, t]);

  useEffect(() => {
    if (!token) return;
    api
      .get<{ items: Array<{ resourceId: string }> }>("/favorites")
      .then((r) => setFavoriteIds(new Set(r.items.map((x) => x.resourceId))))
      .catch(() => {});
  }, [api, token]);

  async function toggleFavorite(resourceId: string) {
    if (!token) return;
    try {
      const r = await api.post<{ isFavorite: boolean }>("/favorites/toggle", { resourceId });
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (r.isFavorite) next.add(resourceId);
        else next.delete(resourceId);
        return next;
      });
      toast.show(r.isFavorite ? t("resources.favAdded") : t("resources.favRemoved"), "success");
    } catch (e: any) {
      setError(e?.message ?? t("resources.favError"));
    }
  }

  function openBooking(resource: ResourceItem) {
    if (!canBook) {
      toast.show(t("resources.needTariff"), "error");
      nav("/tariffs");
      return;
    }
    if (!availabilityFilter) {
      const slot = defaultBookingSlot();
      setFilters((prev) => {
        const next = { ...prev, ...slot };
        writePreferences(next);
        return next;
      });
    }
    setBookingResource(resource);
  }

  async function createBooking() {
    if (!bookingResource) return;
    if (!slotStart || !slotEnd || new Date(slotEnd) <= new Date(slotStart)) {
      setError(t("resources.badInterval"));
      return;
    }
    setBookingLoading(true);
    setError(null);
    try {
      await api.post("/bookings", {
        resourceId: bookingResource.id,
        startAt: new Date(slotStart).toISOString(),
        endAt: new Date(slotEnd).toISOString(),
      });
      toast.show(t("resources.bookingCreated"), "success");
      setBookingResource(null);
      setReloadKey((k) => k + 1);
    } catch (e: any) {
      setError(e?.message ?? t("resources.bookingError"));
    } finally {
      setBookingLoading(false);
    }
  }

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = `${it.name} ${it.type.code} ${it.type.name} ${it.location.city} ${it.location.name} ${it.amenities.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onClear: () => void }> = [];
    if (search.trim()) {
      chips.push({
        key: "search",
        label: t("resources.chipSearch", { value: search.trim() }),
        onClear: () => setFilter("search", ""),
      });
    }
    if (city.trim()) {
      chips.push({
        key: "city",
        label: t("resources.chipCity", { value: city.trim() }),
        onClear: () => setFilter("city", ""),
      });
    }
    if (typeCode) {
      chips.push({
        key: "type",
        label: t("resources.chipType", { value: typeCodeLabel(typeCode) }),
        onClear: () => setFilter("typeCode", ""),
      });
    }
    if (sort) {
      const label =
        sort === "priceAsc"
          ? t("resources.chipSortPriceAsc")
          : sort === "priceDesc"
            ? t("resources.chipSortPriceDesc")
            : sort === "capacityDesc"
              ? t("resources.chipSortCapacity")
              : t("resources.chipSort", { value: sort });
      chips.push({ key: "sort", label, onClear: () => setFilter("sort", "") });
    }
    if (availabilityFilter) {
      chips.push({
        key: "slot",
        label: t("resources.chipSlot", {
          value: `${new Date(slotStart).toLocaleString()} — ${new Date(slotEnd).toLocaleTimeString()}`,
        }),
        onClear: () => {
          setFilters((prev) => {
            const next = { ...prev, slotStart: "", slotEnd: "" };
            writePreferences(next);
            return next;
          });
        },
      });
    }
    return chips;
  }, [availabilityFilter, city, search, slotEnd, slotStart, sort, t, typeCode]);

  function resetFilters() {
    const next = defaultResourceFilters();
    setFilters(next);
    writePreferences(next);
  }

  return (
    <div className="resourcesLayout">
      <Sidebar title={t("resources.filters")}>
        <div className="row" style={{ marginTop: 12 }}>
          <p className="filterHint">{t("resources.filterHint")}</p>
          <Field
            label={t("common.start")}
            type="datetime-local"
            value={slotStart}
            onChange={(e) => setFilter("slotStart", e.target.value)}
          />
          <Field
            label={t("common.end")}
            type="datetime-local"
            value={slotEnd}
            onChange={(e) => setFilter("slotEnd", e.target.value)}
          />
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              const slot = defaultBookingSlot();
              setFilters((prev) => {
                const next = { ...prev, ...slot };
                writePreferences(next);
                return next;
              });
            }}
          >
            {t("resources.nextHour")}
          </Button>
          <Field
            label={t("resources.city")}
            placeholder={t("resources.cityPlaceholder")}
            value={city}
            onChange={(e) => setFilter("city", e.target.value)}
          />
          <SelectField label={t("resources.type")} value={typeCode} onChange={(e) => setFilter("typeCode", e.target.value)}>
            <option value="">{t("resourceType.all")}</option>
            <option value="DESK">{t("resourceType.desks")}</option>
            <option value="MEETING">{t("resourceType.meetings")}</option>
            <option value="EVENT">{t("resourceType.events")}</option>
          </SelectField>
          <SelectField label={t("resources.sort")} value={sort} onChange={(e) => setFilter("sort", e.target.value)}>
            <option value="">{t("resources.sortDefault")}</option>
            <option value="priceAsc">{t("resources.sortPriceAsc")}</option>
            <option value="priceDesc">{t("resources.sortPriceDesc")}</option>
            <option value="capacityDesc">{t("resources.sortCapacityDesc")}</option>
          </SelectField>
          <Button variant="secondary" type="button" onClick={resetFilters}>
            {t("resources.resetFilters")}
          </Button>
        </div>
      </Sidebar>

      <section className="resourcesMain">
        <header className="heroCard">
          <div>
            <h1 className="heroTitle">{t("resources.title")}</h1>
            <p className="muted" style={{ marginTop: 6 }}>
              {t("resources.lead")}
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Pill>
                {availabilityFilter
                  ? t("resources.freeCount", { count: items.length })
                  : t("resources.totalCount", { count: items.length })}
              </Pill>
              <Pill>{t("resources.favCount", { count: favoriteIds.size })}</Pill>
            </div>
          </div>
          <SearchBox value={search} onChange={(v) => setFilter("search", v)} />
        </header>

        <ChipsRow chips={activeChips} onClearAll={resetFilters} />

        {user?.role === "CLIENT" && <SubscriptionBanner activeTariff={activeTariff} loading={subLoading} />}

        {loading && (
          <div className="resourcesGrid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={`sk-${i}`} />
            ))}
          </div>
        )}
        {error && <Alert variant="error">{error}</Alert>}

        <div className="resourcesGrid">
          {!loading &&
            visibleItems.map((it) => (
              <ResourceCard
                key={it.id}
                item={it}
                isFavorite={favoriteIds.has(it.id)}
                bookingEnabled={canBook}
                onBook={() => openBooking(it)}
                onToggleFavorite={() => toggleFavorite(it.id)}
              />
            ))}
        </div>

        {!loading && visibleItems.length === 0 && (
          <EmptyState
            title={t("resources.emptyTitle")}
            description={availabilityFilter ? t("resources.emptySlot") : t("resources.emptyDefault")}
          />
        )}
      </section>

      {bookingResource && (
        <BookingModal
          resource={bookingResource}
          startAt={slotStart}
          endAt={slotEnd}
          loading={bookingLoading}
          onStartChange={(v) => setFilter("slotStart", v)}
          onEndChange={(v) => setFilter("slotEnd", v)}
          onClose={() => setBookingResource(null)}
          onSubmit={createBooking}
        />
      )}
    </div>
  );
}
