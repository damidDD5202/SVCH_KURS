import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useSettings } from "../../state/settings";
import "../resources/ResourceCard.css";
import "./TariffCard.css";

export type TariffItem = {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
};

type Props = {
  tariff: TariffItem;
  active?: boolean;
  onSelect?: () => void;
  onCancel?: () => void;
  loading?: boolean;
};

export function TariffCard({ tariff, active, onSelect, onCancel, loading }: Props) {
  const { t } = useSettings();

  return (
    <Card as="article" className={active ? "tariffCard tariffCardActive" : "tariffCard"}>
      <h3>{tariff.name}</h3>
      <p className="muted" style={{ marginTop: 6 }}>
        {tariff.description}
      </p>
      <p className="resourcePrice" style={{ marginTop: 10 }}>
        {tariff.pricePerDay} {t("common.currencyDay")}
      </p>
      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {onSelect && (
          <Button type="button" onClick={onSelect} disabled={loading || active}>
            {active ? t("tariffs.activeBadge") : t("tariffs.choose")}
          </Button>
        )}
        {active && onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {t("bookings.cancel")}
          </Button>
        )}
      </div>
    </Card>
  );
}
