import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const cls =
    variant === "secondary"
      ? "btn btnSecondary"
      : variant === "ghost"
        ? "linkBtn"
        : "btn";
  return <button className={`${cls} ${className}`.trim()} {...props} />;
}
