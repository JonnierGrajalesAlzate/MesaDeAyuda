import { useEffect, useRef, useState } from "react";
import { ArrowRightLeft, EllipsisVertical, NotebookPen, PanelRightClose, PanelRightOpen } from "lucide-react";

function MenuOption({ icon: IconComponent, label, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
    >
      <IconComponent className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
      <span>{label}</span>
    </button>
  );
}

/**
 * Agrupa las acciones secundarias del ticket (reasignar, mostrar/ocultar
 * detalles). El cambio de estado (iniciar/cerrar/reabrir) vive en el select
 * junto al estado del encabezado, ver TicketStatusSelect.
 */
export default function TicketActionsMenu({
  ticket,
  canToggleDetails,
  detailsVisible,
  onToggleDetails,
  canReassign,
  onReassign,
  canDocument,
  onDocument
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuContainerRef = useRef(null);
  const hasActions = canReassign || canToggleDetails || canDocument;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOutside = event => {
      if (!menuContainerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [menuOpen]);

  if (!hasActions) return null;

  const execute = action => {
    setMenuOpen(false);
    action();
  };

  return (
    <div ref={menuContainerRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen(current => !current)}
        aria-label={`Más acciones para el ticket ${ticket.id}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className={`grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0076e3] ${menuOpen ? "bg-slate-100" : ""}`}
      >
        <EllipsisVertical className="h-5 w-5 text-slate-500" strokeWidth={2} aria-hidden="true" />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-[min(78vw,260px)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(30,34,43,0.2)]"
        >
          {canDocument && <MenuOption icon={NotebookPen} label="Documentar" onClick={() => execute(onDocument)} />}
          {canReassign && <MenuOption icon={ArrowRightLeft} label="Reasignar ticket" onClick={() => execute(onReassign)} />}
          {canToggleDetails && (
            <MenuOption
              icon={detailsVisible ? PanelRightClose : PanelRightOpen}
              label={detailsVisible ? "Ocultar detalles" : "Mostrar detalles"}
              onClick={() => execute(onToggleDetails)}
            />
          )}
        </div>
      )}
    </div>
  );
}
