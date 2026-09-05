import { useId, useState } from "react";
import { X } from "lucide-react";
import filterIcon from "../../../assets/filtro.png";

function FilterIconButton({ open, onClick, contentId }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={contentId}
      aria-label="Mostrar filtros"
      title="Mostrar filtros"
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-transparent bg-transparent p-1 transition hover:border-slate-200 hover:bg-slate-50"
    >
      <img src={filterIcon} alt="" className="h-9 w-9 object-contain" />
    </button>
  );
}

export default function FilterDisclosure({
  children,
  title,
  description,
  actions,
  defaultOpen = false,
  embedded = false,
  className = "",
  contentClassName = "",
  onClose
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  const hasHeader = Boolean(title || description || actions);

  return (
    <section className={`${embedded ? "" : "rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"} ${className}`}>
      {hasHeader && (
        <div className="flex min-h-11 items-center gap-3">
          {title || description ? (
            <div className="min-w-0 flex-1">
              {title && <h2 className="text-lg font-bold text-slate-800">{title}</h2>}
              {description && <p className={`text-sm text-slate-500 ${title ? "mt-0.5" : ""}`}>{description}</p>}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {actions}
          {!open && <FilterIconButton open={open} contentId={contentId} onClick={() => setOpen(true)} />}
        </div>
      )}

      {!hasHeader && !open && (
        <div className="flex min-h-11 items-center justify-end">
          <FilterIconButton open={open} contentId={contentId} onClick={() => setOpen(true)} />
        </div>
      )}

      {open && (
        <div
          id={contentId}
          className={`flex min-w-0 flex-wrap items-start gap-2 ${hasHeader ? "mt-3 border-t border-slate-200 pt-3" : ""}`}
        >
          <div className="flex h-10 w-8 shrink-0 items-center justify-center">
            <img src={filterIcon} alt="" className="h-6 w-6 object-contain" />
          </div>

          <div className={`min-w-0 flex-1 ${contentClassName}`}>
            {children}
          </div>

          <button
            type="button"
            aria-label="Quitar filtro"
            title="Quitar filtro"
            onClick={() => {
              onClose?.();
              setOpen(false);
            }}
            className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded border border-slate-200 bg-white transition hover:border-red-200 hover:bg-red-50"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
