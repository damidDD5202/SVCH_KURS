import { Link } from "react-router-dom";
import "./ShowcaseCard.css";

type ShowcaseCardProps = {
  src: string;
  alt: string;
  caption: string;
  to: string;
};

export function ShowcaseCard({ src, alt, caption, to }: ShowcaseCardProps) {
  return (
    <Link to={to} className="showcaseCardLink">
      <figure className="showcaseCard">
        <img className="showcaseImg" src={src} alt={alt} loading="lazy" />
        <figcaption className="showcaseCaption">{caption}</figcaption>
      </figure>
    </Link>
  );
}
