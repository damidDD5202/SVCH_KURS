import { Card } from "./Card";
import "./EmptyState.css";

type Props = {
  title: string;
  description?: React.ReactNode;
};

export function EmptyState({ title, description }: Props) {
  return (
    <Card className="emptyState">
      <div className="emptyTitle">{title}</div>
      {description && (
        <p className="muted" style={{ marginTop: 6 }}>
          {description}
        </p>
      )}
    </Card>
  );
}
