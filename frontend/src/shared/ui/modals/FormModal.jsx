import { X } from "lucide-react";
import ModalBase from "./ModalBase.jsx";

function FormModal({ abierto, onClose, eyebrow, titulo, descripcion, onSubmit, maxWidth = "max-w-md", footer, children }) {
  const Contenedor = onSubmit ? "form" : "div";

  return (
    <ModalBase abierto={abierto} onClose={onClose} maxWidth={maxWidth}>
      <Contenedor onSubmit={onSubmit}>
        <header className="modal-header">
          <div className="modal-header-copy">
            {eyebrow && <span className="modal-header-eyebrow">{eyebrow}</span>}
            <h2 className="modal-header-title">{titulo}</h2>
            {descripcion && <p className="modal-header-description">{descripcion}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar formulario" title="Cerrar formulario" className="modal-icon-button">
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </header>

        <div className="modal-body">
          {children}
        </div>

        {footer}
      </Contenedor>
    </ModalBase>
  );
}

export default FormModal;
