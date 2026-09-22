import type { HTMLAttributes, ReactNode } from "react";
import "./Card.css";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  as?: "div" | "article" | "section" | "aside";
};

export function Card({ children, className = "", as: Tag = "div", ...props }: Props) {
  return (
    <Tag className={`card ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}
