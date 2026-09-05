function ResponsiveTable({
  children,
  ariaLabel = "Tabla con desplazamiento horizontal",
  caption,
  minWidth = 760,
  tableClassName = ""
}) {
  return <>
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500 sm:hidden">
        <span>Desliza horizontalmente para ver todas las columnas</span>
        <span aria-hidden="true" className="ml-3 shrink-0 text-lg">↔</span>
      </div>

      <div
        className="responsive-table-scroll w-full max-w-full overflow-x-auto"
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <table className={`w-full text-sm ${tableClassName}`} style={{ minWidth }}>
          {caption && <caption className="sr-only">{caption}</caption>}
          {children}
        </table>
      </div>
    </>;
}

export default ResponsiveTable;
