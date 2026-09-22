import { Modal } from "../ui/Modal";
import { Field } from "../ui/Field";
import { Button } from "../ui/Button";
import type { ResourceItem } from "../../lib/resourceUtils";
import { useSettings } from "../../state/settings";
import "./BookingModal.css";

type Props = {
  resource: ResourceItem;
  startAt: string;
  endAt: string;
  loading: boolean;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function BookingModal({
  resource,
  startAt,
  endAt,
  loading,
  onStartChange,
  onEndChange,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useSettings();

  return (
    <Modal
      title={t("bookings.newTitle")}
      subtitle={`${resource.type.name} • ${resource.location.city}, ${resource.location.name} • ${resource.name}`}
      onClose={onClose}
    >
      <div className="row" style={{ marginTop: 14 }}>
        <Field
          label={t("common.start")}
          type="datetime-local"
          value={startAt}
          onChange={(e) => onStartChange(e.target.value)}
        />
        <Field
          label={t("common.end")}
          type="datetime-local"
          value={endAt}
          onChange={(e) => onEndChange(e.target.value)}
        />
        <div className="bookingModalActions">
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={loading}>
            {loading ? t("bookings.creating") : t("bookings.create")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
