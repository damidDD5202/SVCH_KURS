import type { InputHTMLAttributes, ReactNode } from "react";
import "./Field.css";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
};

export function Field({ label, hint, error, id, ...props }: Props) {
  const inputId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-invalid={error ? true : undefined} {...props} />
      {error && (
        <span className="fieldError" role="alert">
          {error}
        </span>
      )}
      {hint}
    </div>
  );
}
