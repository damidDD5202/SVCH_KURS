import type { ResourceItem } from "../../lib/resourceUtils";
import { photoForResource, typeCodeLabel } from "../../lib/resourceUtils";
import { useSettings } from "../../state/settings";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Pill } from "../ui/Pill";
import "./ResourceCard.css";

type Props = {
  item: ResourceItem;
  isFavorite: boolean;
  onBook: () => void;
  onToggleFavorite: () => void;
  showRemoveFavorite?: boolean;
  bookingEnabled?: boolean;
};

export function ResourceCard({
  item,
  isFavorite,
  onBook,
  onToggleFavorite,
  showRemoveFavorite,
  bookingEnabled = true,
}: Props) {
  const { t } = useSettings();

  return (
    <Card className="resourceCard" as="article">
      <div className="resourceCover">
        <img src={photoForResource(item.type.code, item.name)} alt={item.name} loading="lazy" />
        <div className="resourceCoverOverlay">
          <Pill>{typeCodeLabel(item.type.code)}</Pill>
          <Pill>{item.location.city}</Pill>
        </div>
      </div>
      <div className="resourceTop">
        <div>
          <h3 className="resourceName">{item.name}</h3>
          <p className="muted">
            {item.type.name} • {item.location.city}, {item.location.name}
          </p>
        </div>
        <div className="resourcePriceBlock">
          <div className="resourcePrice">
            {item.pricePerHour} {t("common.currencyHour")}
          </div>
          <p className="muted">{t("resources.seats", { count: item.capacity })}</p>
        </div>
      </div>
      <p className="resourceAmenities">{item.amenities.join(" • ")}</p>
      <div className="resourceActions">
        <Button type="button" onClick={onBook} variant={bookingEnabled ? "primary" : "secondary"}>
          {bookingEnabled ? t("resources.book") : t("resources.needTariffBtn")}
        </Button>
        <Button variant="secondary" type="button" onClick={onToggleFavorite}>
          {showRemoveFavorite || isFavorite ? t("resources.removeFav") : t("resources.addFav")}
        </Button>
      </div>
    </Card>
  );
}
