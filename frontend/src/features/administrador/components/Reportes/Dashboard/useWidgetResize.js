const SIZE_TO_SPAN = { small: 1, medium: 2, full: 2 };
const SPAN_TO_SIZE = { 1: "small", 2: "full" };
const GRID_GAP_PX = 14;
const GRID_COLUMNS = 2;

export default function useWidgetResize(widgetId, size, onResize, elementRef) {
  return function handlePointerDown(event) {
    const container = elementRef.current?.parentElement;
    if (!container) return;
    event.preventDefault();

    const containerWidth = container.getBoundingClientRect().width;
    const columnWidth = (containerWidth + GRID_GAP_PX) / GRID_COLUMNS;
    const startSpan = Math.min(GRID_COLUMNS, SIZE_TO_SPAN[size] || 1);
    const drag = { startX: event.clientX, startSpan, lastSpan: startSpan };

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handlePointerMove = moveEvent => {
      const deltaX = moveEvent.clientX - drag.startX;
      const deltaSpan = Math.round(deltaX / columnWidth);
      const nextSpan = Math.min(GRID_COLUMNS, Math.max(1, drag.startSpan + deltaSpan));
      if (nextSpan === drag.lastSpan) return;
      drag.lastSpan = nextSpan;
      onResize(widgetId, SPAN_TO_SIZE[nextSpan]);
    };

    const handlePointerUp = () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };
}
