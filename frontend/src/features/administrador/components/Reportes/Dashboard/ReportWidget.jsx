import { useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ReportWidgetContent from "./ReportWidgetContent.jsx";
import useWidgetResize from "./useWidgetResize.js";

function MoveIcon({ direction }) {
  return direction === "previous"
    ? <ChevronLeft aria-hidden="true" />
    : <ChevronRight aria-hidden="true" />;
}

export default function ReportWidget({
  widgetId,
  widget,
  size,
  data,
  index,
  total,
  editing,
  dragging,
  dropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onMove,
  onRemove,
  onResize
}) {
  const widgetRef = useRef(null);
  const handleResizeStart = useWidgetResize(widgetId, size, onResize, widgetRef);

  return (
    <article
      ref={widgetRef}
      className={[
        "report-dashboard-widget",
        `report-widget-size-${size}`,
        editing ? "is-editable" : "",
        dragging ? "is-dragging" : "",
        dropTarget ? "is-drop-target" : ""
      ].filter(Boolean).join(" ")}
      draggable={editing}
      onDragStart={event => onDragStart(event, widgetId)}
      onDragEnd={onDragEnd}
      onDragOver={event => {
        if (editing) {
          event.preventDefault();
          onDragOver(index);
        }
      }}
      onDrop={event => onDrop(event, index)}
    >
      <header className="report-widget-header">
        {editing && (
          <span className="report-widget-grip" title="Arrastra para mover" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        )}
        <div>
          <h2>{widget.title}</h2>
          <p>{widget.description}</p>
        </div>
        {editing && (
          <div className="report-widget-actions">
            <button
              type="button"
              onClick={() => onMove(widgetId, -1)}
              disabled={index === 0}
              aria-label={`Mover ${widget.title} hacia atrás`}
              title="Mover hacia atrás"
            >
              <MoveIcon direction="previous" />
            </button>
            <button
              type="button"
              onClick={() => onMove(widgetId, 1)}
              disabled={index === total - 1}
              aria-label={`Mover ${widget.title} hacia adelante`}
              title="Mover hacia adelante"
            >
              <MoveIcon direction="next" />
            </button>
            <button
              type="button"
              className="is-remove"
              onClick={() => onRemove(widgetId)}
              aria-label={`Quitar ${widget.title} del tablero`}
              title="Quitar del tablero"
            >
              <X aria-hidden="true" />
            </button>
          </div>
        )}
      </header>

      <div className={`report-widget-body report-widget-body-${widget.type}`}>
        <ReportWidgetContent widgetId={widgetId} widget={widget} data={data} />
      </div>

      {editing && (
        <div
          className="report-widget-resize-handle"
          draggable={false}
          onPointerDown={handleResizeStart}
          onDragStart={event => event.preventDefault()}
          role="separator"
          aria-orientation="vertical"
          aria-label={`Cambiar ancho de ${widget.title}`}
          title="Arrastra para cambiar el ancho"
        >
          <span />
        </div>
      )}
    </article>
  );
}
