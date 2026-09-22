import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import type { TariffItem } from "./TariffCard";
import { useSettings } from "../../state/settings";
import "./SubscriptionBanner.css";

type Props = {
  activeTariff: TariffItem | null;
  loading?: boolean;
};

export function SubscriptionBanner({ activeTariff, loading }: Props) {
  const { t } = useSettings();

  if (loading) return null;

  if (activeTariff) {
    return (
      <aside className="subscriptionBanner subscriptionBannerActive" aria-live="polite">
        <p className="subscriptionBannerText">
          {t("tariffs.subActive", { name: activeTariff.name })}
        </p>
        <Link to="/tariffs">
          <Button variant="secondary" type="button">
            {t("tariffs.manage")}
          </Button>
        </Link>
      </aside>
    );
  }

  return (
    <aside className="subscriptionBanner" role="alert">
      <p className="subscriptionBannerText">{t("tariffs.subRequired")}</p>
      <Link to="/tariffs">
        <Button type="button">{t("tariffs.choose")}</Button>
      </Link>
    </aside>
  );
}
