import { Card } from "./Card";
import "./SkeletonCard.css";

export function SkeletonCard() {
  return (
    <Card className="skeletonCard">
      <div className="skeletonCover shimmer" />
      <div className="skeletonLine shimmer" style={{ width: "72%", marginTop: 14 }} />
      <div className="skeletonLine shimmer" style={{ width: "52%", marginTop: 10 }} />
      <div className="skeletonLine shimmer" style={{ width: "86%", marginTop: 14, height: 12 }} />
      <div className="skeletonBtns">
        <div className="skeletonBtn shimmer" />
        <div className="skeletonBtn shimmer" />
      </div>
    </Card>
  );
}
