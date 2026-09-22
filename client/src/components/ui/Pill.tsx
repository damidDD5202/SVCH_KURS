import type { ReactNode } from "react";
import "./Pill.css";

export function Pill({ children }: { children: ReactNode }) {
  return <span className="pill">{children}</span>;
}
