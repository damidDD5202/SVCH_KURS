import "./StatCard.css";

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="statCard">
      <div className="statValue">{value}</div>
      <div className="statLabel">{label}</div>
    </div>
  );
}
