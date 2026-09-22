import { useEffect, useState } from "react";
import { Card } from "./Card";
import { useSettings } from "../../state/settings";
import "./ReminderBanner.css";

const LS_REMINDER = "coworking.reminder.dismissed.v1";

type Props = {
  bookingStartAt?: string | null;
};

export function ReminderBanner({ bookingStartAt }: Props) {
  const { t } = useSettings();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(LS_REMINDER) === "1");
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (dismissed || !bookingStartAt) return;
    const start = new Date(bookingStartAt).getTime();
    const diffH = (start - Date.now()) / (1000 * 60 * 60);
    if (diffH > 0 && diffH <= 48) {
      setText(
        t("bookings.reminder", {
          hours: Math.ceil(diffH),
          datetime: new Date(bookingStartAt).toLocaleString(),
        }),
      );
    }
  }, [bookingStartAt, dismissed, t]);

  if (dismissed || !text) return null;

  return (
    <Card className="reminderBanner" as="aside">
      <p>{text}</p>
      <button
        type="button"
        className="btn btnSecondary"
        style={{ marginTop: 8 }}
        onClick={() => {
          localStorage.setItem(LS_REMINDER, "1");
          setDismissed(true);
        }}
      >
        {t("bookings.hideReminder")}
      </button>
    </Card>
  );
}
