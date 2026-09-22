import { useSettings } from "../../state/settings";
import "./UtilizationChart.css";

type Point = { label: string; hours: number };

type Props = {
  points: Point[];
};

export function UtilizationChart({ points }: Props) {
  const { t } = useSettings();

  if (points.length === 0) {
    return <p className="muted">{t("reports.noChartData")}</p>;
  }
  const max = Math.max(...points.map((p) => p.hours), 1);

  return (
    <div className="barChart" role="img" aria-label={t("reports.chartAria")}>
      {points.map((p) => (
        <div key={p.label} className="barChartRow">
          <div className="barChartLabel" title={p.label}>
            {p.label}
          </div>
          <div className="barChartTrack">
            <div
              className="barChartFill"
              style={{ width: `${Math.round((p.hours / max) * 100)}%` }}
              title={t("reports.hours", { hours: p.hours.toFixed(1) })}
            />
          </div>
          <div className="barChartValue">{t("reports.hours", { hours: p.hours.toFixed(1) })}</div>
        </div>
      ))}
    </div>
  );
}
