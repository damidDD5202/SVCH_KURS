import type { ReactNode } from "react";
import { useSettings } from "../../state/settings";
import "./Modal.css";

type Props = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, subtitle, onClose, children }: Props) {
  const { t } = useSettings();

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modalHeader">
          <div>
            <h2 id="modal-title" className="modalTitle">
              {title}
            </h2>
            {subtitle && (
              <p className="muted" style={{ marginTop: 4 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button type="button" className="modalClose" onClick={onClose}>
            {t("common.close")}
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
