import { Chip } from "./Chip";
import { useSettings } from "../../state/settings";
import "./ChipsRow.css";

type ChipItem = { key: string; label: string; onClear: () => void };

type Props = {
  chips: ChipItem[];
  onClearAll?: () => void;
  clearAllLabel?: string;
};

export function ChipsRow({ chips, onClearAll, clearAllLabel }: Props) {
  const { t } = useSettings();
  const label = clearAllLabel ?? t("common.clearAll");

  if (chips.length === 0) return null;
  return (
    <div className="chipsRow">
      {chips.map((c) => (
        <Chip key={c.key} label={c.label} onClear={c.onClear} />
      ))}
      {onClearAll && <Chip label={label} onClear={onClearAll} clearAll />}
    </div>
  );
}
