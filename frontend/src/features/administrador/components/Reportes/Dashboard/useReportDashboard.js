import { useMemo, useRef, useState } from "react";
import {
  DEFAULT_REPORT_LAYOUT,
  normalizeReportLayout,
  REPORT_WIDGETS
} from "./reportDashboardConfig.js";

const STORAGE_KEY = "soportelg:admin-report-dashboard:v4";
const VALID_SIZES = new Set(["small", "medium", "full"]);

function defaultSizes() {
  return Object.fromEntries(Object.entries(REPORT_WIDGETS).map(([id, widget]) => [id, widget.size]));
}

function sanitizeSizes(rawSizes) {
  const sizes = defaultSizes();
  if (rawSizes && typeof rawSizes === "object") {
    Object.keys(sizes).forEach(id => {
      if (VALID_SIZES.has(rawSizes[id])) sizes[id] = rawSizes[id];
    });
  }
  return sizes;
}

function readSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      layout: normalizeReportLayout(saved?.layout),
      sizes: sanitizeSizes(saved?.sizes)
    };
  } catch {
    return { layout: [...DEFAULT_REPORT_LAYOUT], sizes: defaultSizes() };
  }
}

export function readSavedReportLayout() {
  return readSavedState().layout;
}

export default function useReportDashboard() {
  const [state, setState] = useState(readSavedState);
  const { layout, sizes } = state;
  const [editing, setEditing] = useState(false);
  const snapshot = useRef(state);
  const activeWidgets = useMemo(() => new Set(layout), [layout]);

  const startEditing = () => {
    snapshot.current = state;
    setEditing(true);
  };

  const cancelEditing = () => {
    setState(snapshot.current);
    setEditing(false);
  };

  const saveLayout = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      snapshot.current = state;
      setEditing(false);
      return true;
    } catch {
      return false;
    }
  };

  const addWidget = (widgetId, targetIndex = layout.length) => {
    if (!REPORT_WIDGETS[widgetId] || activeWidgets.has(widgetId)) return;
    setState(current => {
      if (current.layout.includes(widgetId)) return current;
      const nextLayout = [...current.layout];
      nextLayout.splice(Math.max(0, targetIndex), 0, widgetId);
      return { ...current, layout: nextLayout };
    });
  };

  const removeWidget = widgetId => {
    setState(current => ({ ...current, layout: current.layout.filter(id => id !== widgetId) }));
  };

  const moveWidget = (widgetId, direction) => {
    setState(current => {
      const currentIndex = current.layout.indexOf(widgetId);
      const targetIndex = currentIndex + direction;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= current.layout.length) return current;
      const nextLayout = [...current.layout];
      [nextLayout[currentIndex], nextLayout[targetIndex]] = [nextLayout[targetIndex], nextLayout[currentIndex]];
      return { ...current, layout: nextLayout };
    });
  };

  const moveWidgetTo = (widgetId, targetIndex) => {
    setState(current => {
      const currentIndex = current.layout.indexOf(widgetId);
      if (currentIndex < 0) return current;
      const filtered = current.layout.filter(id => id !== widgetId);
      const insertionIndex = Math.max(0, Math.min(targetIndex, filtered.length));
      filtered.splice(insertionIndex, 0, widgetId);
      return { ...current, layout: filtered };
    });
  };

  const resizeWidget = (widgetId, size) => {
    if (!VALID_SIZES.has(size)) return;
    setState(current => {
      if (current.sizes[widgetId] === size) return current;
      return { ...current, sizes: { ...current.sizes, [widgetId]: size } };
    });
  };

  const restoreDefaults = () => {
    setState({ layout: [...DEFAULT_REPORT_LAYOUT], sizes: defaultSizes() });
  };

  return {
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
  };
}
