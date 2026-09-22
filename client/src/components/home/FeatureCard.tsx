import "./FeatureCard.css";

type Props = {
  title: string;
  description: string;
  index?: number;
};

export function FeatureCard({ title, description, index }: Props) {
  return (
    <article className="featureCard">
      {index != null && <span className="featureIndex">{index}</span>}
      <h3 className="featureTitle">{title}</h3>
      <p className="muted">{description}</p>
    </article>
  );
}
