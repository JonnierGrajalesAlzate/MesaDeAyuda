import { useState } from "react";
import alerta from "../../../../../shared/services/alertService.js";
import sinWidgetsIcon from "../../../../../assets/sinWidgets.png";
import ReportWidget from "./ReportWidget.jsx";
import ReportWidgetLibrary from "./ReportWidgetLibrary.jsx";
import { REPORT_WIDGETS } from "./reportDashboardConfig.js";
import useReportDashboard from "./useReportDashboard.js";

function dragPayload(event) {
  const value = event.dataTransfer.getData("text/plain");
  const [source, ...idParts] = value.split(":");
  return { source, widgetId: idParts.join(":") };
}

function DashboardToolbar({
  widgetCount,
  editing,
  onEdit,
  onCancel,
  onSave
}) {
  return (
    <div className="report-dashboard-toolbar">
      <div>
        <span>Panel Soporte LG</span>
        <strong>{widgetCount} widgets visibles</strong>
      </div>
      <div>
        {editing ? (
          <>
            <button type="button" className="report-toolbar-button is-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="button" className="report-toolbar-button is-primary" onClick={onSave}>
              Guardar diseño
            </button>
          </>
        ) : (
          <button type="button" className="report-toolbar-button is-personalize" onClick={onEdit}>
            Personalizar dashboard
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReportDashboard({ data }) {
  const {
    layout,
    sizes,
    editing,
    activeWidgets,
    startEditing,
    cancelEditing,
    saveLayout,
    addWidget,
    removeWidget,
    moveWidget,
    moveWidgetTo,
    resizeWidget,
    restoreDefaults
  } = useReportDashboard();
  const [draggingWidget, setDraggingWidget] = useState("");
  const [dropTargetIndex, setDropTargetIndex] = useState(null);

  const setDashboardDrag = (event, widgetId) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `dashboard:${widgetId}`);
    setDraggingWidget(widgetId);
  };

  const setLibraryDrag = (event, widgetId) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", `library:${widgetId}`);
  };

  const dropAt = (event, targetIndex) => {
    event.preventDefault();
    event.stopPropagation();
    const { source, widgetId } = dragPayload(event);
    if (source === "library") addWidget(widgetId, targetIndex);
    if (source === "dashboard") moveWidgetTo(widgetId, targetIndex);
    setDraggingWidget("");
    setDropTargetIndex(null);
  };

  const dropAtEnd = event => {
    event.preventDefault();
    if (event.target !== event.currentTarget) return;
    const { source, widgetId } = dragPayload(event);
    if (source === "library") addWidget(widgetId);
    if (source === "dashboard") moveWidgetTo(widgetId, layout.length);
    setDraggingWidget("");
    setDropTargetIndex(null);
  };

  const handleSave = () => {
    const saved = saveLayout();
    if (!saved) {
      alerta.fire({
        icon: "error",
        title: "No se pudo guardar el diseño",
        text: "El navegador no permitió almacenar esta configuración.",
        confirmButtonColor: "#0076e3"
      });
      return;
    }
    alerta.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Diseño guardado",
      showConfirmButton: false,
      timer: 1600,
      timerProgressBar: true
    });
  };

  return (
    <section className="report-dashboard-section">
      <DashboardToolbar
        widgetCount={layout.length}
        editing={editing}
        onEdit={startEditing}
        onCancel={cancelEditing}
        onSave={handleSave}
      />

      <div className={`report-dashboard-workspace ${editing ? "is-editing" : ""}`}>
        <div
          className={`report-dashboard-grid ${layout.length ? "" : "is-empty"}`}
          onDragOver={event => {
            if (editing) event.preventDefault();
          }}
          onDrop={dropAtEnd}
        >
          {layout.map((widgetId, index) => (
            <ReportWidget
              key={widgetId}
              widgetId={widgetId}
              widget={REPORT_WIDGETS[widgetId]}
              size={sizes[widgetId] || REPORT_WIDGETS[widgetId].size}
              data={data}
              index={index}
              total={layout.length}
              editing={editing}
              dragging={draggingWidget === widgetId}
              dropTarget={dropTargetIndex === index && draggingWidget !== widgetId}
              onDragStart={setDashboardDrag}
              onDragEnd={() => {
                setDraggingWidget("");
                setDropTargetIndex(null);
              }}
              onDragOver={setDropTargetIndex}
              onDrop={dropAt}
              onMove={moveWidget}
              onRemove={removeWidget}
              onResize={resizeWidget}
            />
          ))}

          {!layout.length && (
            <div className="report-dashboard-empty">
              <img src={sinWidgetsIcon} alt="" aria-hidden="true" />
              <strong>Tu tablero está vacío</strong>
              <p>Agrega o arrastra widgets desde la biblioteca.</p>
            </div>
          )}
        </div>

        {editing && (
          <ReportWidgetLibrary
            activeWidgets={activeWidgets}
            onAdd={addWidget}
            onRemove={removeWidget}
            onRestoreDefaults={restoreDefaults}
            onDragStart={setLibraryDrag}
          />
        )}
      </div>
    </section>
  );
}
