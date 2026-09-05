import { useEffect } from "react";
import { createPortal } from "react-dom";

function ModalBase({ abierto, onClose, children, maxWidth = "max-w-3xl", dialogClassName = "" }) {
  useEffect(() => {
    if (!abierto) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeWithEscape = event => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [abierto, onClose]);

  if (!abierto) return null;

  return createPortal(
    <div
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="modal-overlay"
    >
      <div role="dialog" aria-modal="true" className={`modal-panel ${maxWidth} ${dialogClassName}`}>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default ModalBase;
