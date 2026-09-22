import { Card } from "./Card";
import { useSettings } from "../../state/settings";
import "./LoadingBlock.css";

export function LoadingBlock({ label }: { label?: string }) {
  const { t } = useSettings();

  return (
    <Card className="loadingBlock" aria-busy="true">
      {label ?? t("common.loading")}
    </Card>
  );
}
