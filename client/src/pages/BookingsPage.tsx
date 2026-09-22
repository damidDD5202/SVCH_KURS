import { useEffect, useMemo, useState } from "react";
import { BookingCard, type BookingItem } from "../components/bookings/BookingCard";
import { PageHeader } from "../components/ui/PageHeader";
import { LoadingBlock } from "../components/ui/LoadingBlock";
import { Alert } from "../components/ui/Alert";
import { Table } from "../components/ui/Table";
import { ReminderBanner } from "../components/ui/ReminderBanner";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { canCancelBooking, getBookingDisplayStatus } from "../lib/bookingUtils";
import { useApi } from "../lib/api";
import { useSettings } from "../state/settings";
import "../components/bookings/BookingCard.css";
import "./BookingsPage.css";

type MyBookingsResponse = { items: BookingItem[] };

export function BookingsPage() {
  const api = useApi();
  const toast = useToast();
  const { t } = useSettings();
  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");

  function load() {
    setLoading(true);
    setError(null);
    api
      .get<MyBookingsResponse>("/bookings/my")
      .then((r) => setItems(r.items))
      .catch((e: any) => setError(e?.message ?? t("common.loadError")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextBooking = useMemo(() => {
    const upcoming = items
      .filter((b) => b.status === "CONFIRMED" && new Date(b.startAt).getTime() > Date.now())
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    return upcoming[0] ?? null;
  }, [items]);

  async function cancel(id: string) {
    try {
      await api.post(`/bookings/${id}/cancel`, {});
      toast.show(t("bookings.cancelled"), "info");
      load();
    } catch (e: any) {
      setError(e?.message ?? t("bookings.cancelError"));
    }
  }

  function statusLabel(booking: BookingItem) {
    const displayStatus = getBookingDisplayStatus(booking);
    if (displayStatus === "cancelled") return t("bookingStatus.cancelled");
    if (displayStatus === "completed") return t("bookingStatus.completed");
    return t("bookingStatus.confirmed");
  }

  return (
    <section className="row">
      <PageHeader title={t("bookings.title")} description={t("bookings.lead")} />
      <ReminderBanner bookingStartAt={nextBooking?.startAt} />
      <div className="bookingsToolbar">
        <Button type="button" variant={view === "cards" ? "primary" : "secondary"} onClick={() => setView("cards")}>
          {t("bookings.cards")}
        </Button>
        <Button type="button" variant={view === "table" ? "primary" : "secondary"} onClick={() => setView("table")}>
          {t("bookings.table")}
        </Button>
      </div>
      {loading && <LoadingBlock />}
      {error && <Alert variant="error">{error}</Alert>}
      {view === "cards" &&
        items.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            onCancel={canCancelBooking(b) ? cancel : undefined}
          />
        ))}
      {view === "table" && !loading && (
        <Table
          rows={items}
          rowKey={(b) => b.id}
          emptyMessage={t("common.noData")}
          columns={[
            { key: "res", header: t("bookings.colResource"), render: (b) => b.resource.name },
            { key: "when", header: t("bookings.colStart"), render: (b) => new Date(b.startAt).toLocaleString() },
            {
              key: "status",
              header: t("bookings.colStatus"),
              render: (b) => (
                <span className={`bookingStatus bookingStatus--${getBookingDisplayStatus(b)}`}>
                  {statusLabel(b)}
                </span>
              ),
            },
            {
              key: "act",
              header: "",
              render: (b) =>
                canCancelBooking(b) ? (
                  <Button type="button" variant="secondary" onClick={() => cancel(b.id)}>
                    {t("bookings.cancel")}
                  </Button>
                ) : (
                  "—"
                ),
            },
          ]}
        />
      )}
    </section>
  );
}
