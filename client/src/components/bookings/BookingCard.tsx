import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Pill } from "../ui/Pill";
import { canCancelBooking, getBookingDisplayStatus } from "../../lib/bookingUtils";
import { useSettings } from "../../state/settings";
import "./BookingCard.css";

export type BookingItem = {
  id: string;
  startAt: string;
  endAt: string;
  status: "CONFIRMED" | "CANCELLED";
  resource: {
    id: string;
    name: string;
    location: { city: string; name: string };
    type: { name: string };
  };
  payment?: { amount: number } | null;
};

type Props = {
  booking: BookingItem;
  onCancel?: (id: string) => void;
};

export function BookingCard({ booking, onCancel }: Props) {
  const { t } = useSettings();
  const displayStatus = getBookingDisplayStatus(booking);
  const statusLabel =
    displayStatus === "cancelled"
      ? t("bookingStatus.cancelled")
      : displayStatus === "completed"
        ? t("bookingStatus.completed")
        : t("bookingStatus.confirmed");
  const cancellable = canCancelBooking(booking) && !!onCancel;

  return (
    <Card
      as="article"
      className={
        displayStatus === "completed"
          ? "bookingCardPast"
          : displayStatus === "cancelled"
            ? "bookingCardCancelled"
            : ""
      }
    >
      <div className="bookingCardHeader">
        <h3 className="bookingCardTitle">
          {booking.resource.type.name} • {booking.resource.name}
        </h3>
        <Pill>
          <span className={`bookingStatus bookingStatus--${displayStatus}`}>{statusLabel}</span>
        </Pill>
      </div>
      <p className="muted" style={{ marginTop: 6 }}>
        {booking.resource.location.city}, {booking.resource.location.name}
      </p>
      <dl className="bookingCardMeta">
        <div>
          <dt>{t("bookings.from")} </dt>
          <dd>{new Date(booking.startAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>{t("bookings.to")} </dt>
          <dd>{new Date(booking.endAt).toLocaleString()}</dd>
        </div>
      </dl>
      <div className="bookingCardActions">
        {cancellable && (
          <Button type="button" onClick={() => onCancel(booking.id)}>
            {t("bookings.cancel")}
          </Button>
        )}
        {booking.payment && (
          <span className="muted">{t("bookings.payment", { amount: booking.payment.amount })}</span>
        )}
      </div>
    </Card>
  );
}
