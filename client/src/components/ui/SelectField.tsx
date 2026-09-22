import type { ReactNode, SelectHTMLAttributes } from "react";
import "./Field.css";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
};

export function SelectField({ label, id, children, ...props }: Props) {
  const selectId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="field">
      <label htmlFor={selectId}>{label}</label>
      <select id={selectId} {...props}>
        {children}
      </select>
    </div>
  );
}
