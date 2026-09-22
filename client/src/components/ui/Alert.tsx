import "./Alert.css";

type Variant = "error" | "success";

type Props = {
  variant: Variant;
  children: React.ReactNode;
};

export function Alert({ variant, children }: Props) {
  const role = variant === "error" ? "alert" : "status";
  return (
    <div className={variant === "error" ? "error" : "success"} role={role}>
      {children}
    </div>
  );
}
