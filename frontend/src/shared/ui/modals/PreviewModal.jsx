import { ArrowUpRight, X } from "lucide-react";
import ModalBase from "./ModalBase.jsx";

function PreviewModal({ abierto, onClose, titulo, urlAbrir, maxWidth = "max-w-4xl", children }) {
  return (
    <ModalBase abierto={abierto} onClose={onClose} maxWidth={maxWidth}>
      <div className="modal-preview-header">
        <p>{titulo}</p>
        <div className="modal-header-actions">
          {urlAbrir && (
            <a href={urlAbrir} target="_blank" rel="noreferrer" className="modal-icon-button" aria-label="Abrir en nueva pestaña" title="Abrir en nueva pestaña">
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </a>
          )}
          <button type="button" onClick={onClose} aria-label="Cerrar previsualización" title="Cerrar previsualización" className="modal-icon-button">
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="modal-preview-body">
        {children}
      </div>
    </ModalBase>
  );
}

export default PreviewModal;
