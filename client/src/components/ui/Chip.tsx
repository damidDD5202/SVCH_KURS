import { useSettings } from "../../state/settings";
import "./Chip.css";

type Props = {
  label: string;
  onClear: () => void;
  clearAll?: boolean;
};

export function Chip({ label, onClear, clearAll }: Props) {
  const { t } = useSettings();

  return (
    <button
      type="button"
      className={clearAll ? "chip chipClearAll" : "chip"}
      onClick={onClear}
      title={t("common.chipClear")}
    >
      {label} <span className="chipX">×</span>
    </button>
  );
}
