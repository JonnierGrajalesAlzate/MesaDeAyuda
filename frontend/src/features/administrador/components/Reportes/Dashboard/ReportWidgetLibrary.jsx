import {
  REPORT_WIDGET_CATEGORIES,
  REPORT_WIDGETS
} from "./reportDashboardConfig.js";
import libraryIcon from "../../../../../assets/biblioteca.png";

export default function ReportWidgetLibrary({
  activeWidgets,
  onAdd,
  onRemove,
  onRestoreDefaults,
  onDragStart
}) {
  return (
    <aside className="report-widget-library">
      <div className="report-library-heading">
        <span>
          <img src={libraryIcon} alt="" aria-hidden="true" />
        </span>
        <div>
          <h2>Biblioteca de widgets</h2>
          <p>Arrastra o agrega contenido al Panel.</p>
        </div>
      </div>

      <div className="report-library-content">
        {REPORT_WIDGET_CATEGORIES.map(category => (
          <section key={category} className="report-library-group">
            <h3>{category}</h3>
            <div>
              {Object.entries(REPORT_WIDGETS)
                .filter(([, widget]) => widget.category === category)
                .map(([widgetId, widget]) => {
                  const active = activeWidgets.has(widgetId);
                  return (
                    <label
                      key={widgetId}
                      className={`report-library-check ${active ? "is-active" : ""}`}
                      draggable={!active}
                      onDragStart={event => onDragStart(event, widgetId)}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => (active ? onRemove(widgetId) : onAdd(widgetId))}
                        aria-label={active ? `Quitar ${widget.title} del panel` : `Agregar ${widget.title}`}
                      />
                      <div>
                        <strong>{widget.title}</strong>
                        <small>{widget.description}</small>
                      </div>
                    </label>
                  );
                })}
            </div>
          </section>
        ))}
      </div>

      <button type="button" className="report-restore-button" onClick={onRestoreDefaults}>
        Restaurar diseño predeterminado
      </button>
    </aside>
  );
}
