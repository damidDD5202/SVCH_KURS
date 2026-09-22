import { Field } from "../ui/Field";
import { useSettings } from "../../state/settings";
import "./SearchBox.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBox({ value, onChange }: Props) {
  const { t } = useSettings();

  return (
    <div className="searchBox">
      <Field
        label={t("resources.search")}
        placeholder={t("resources.searchPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
