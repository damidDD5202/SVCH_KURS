import "./PageHeader.css";

type Props = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: Props) {
  return (
    <header className="pageHeader">
      <h1>{title}</h1>
      {description && <p className="muted">{description}</p>}
    </header>
  );
}
