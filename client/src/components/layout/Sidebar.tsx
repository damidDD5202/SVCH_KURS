import type { ReactNode } from "react";
import { Card } from "../ui/Card";
import "./Sidebar.css";

type Props = {
  title: string;
  children: ReactNode;
};

export function Sidebar({ title, children }: Props) {
  return (
    <aside className="resourcesSidebar">
      <Card className="sidebarCard" as="section">
        <h2 className="sidebarTitle">{title}</h2>
        {children}
      </Card>
    </aside>
  );
}
