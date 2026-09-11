export const DEFAULT_REPORT_LAYOUT = [
  "insight-closure",
  "insight-area",
  "insight-time",
  "insight-prediction",
  "kpi-open",
  "kpi-process",
  "kpi-waiting",
  "kpi-closed",
  "kpi-reopened",
  "kpi-total",
  "chart-status",
  "chart-priorities",
  "chart-trend",
  "chart-technicians",
  "chart-categories",
  "table-recent"
];

export const REPORT_WIDGETS = {
  "insight-closure": {
    title: "Tasa de cierre",
    description: "Porcentaje de tickets solucionados",
    category: "Indicadores ejecutivos",
    size: "small",
    type: "insight"
  },
  "insight-area": {
    title: "Área con más demanda",
    description: "Área con mayor volumen de solicitudes",
    category: "Indicadores ejecutivos",
    size: "small",
    type: "insight"
  },
  "insight-time": {
    title: "Tiempo promedio",
    description: "Promedio estimado de resolución",
    category: "Indicadores ejecutivos",
    size: "small",
    type: "insight"
  },
  "insight-prediction": {
    title: "Predicción próximo mes",
    description: "Tickets estimados por regresión lineal sobre el histórico mensual",
    category: "Indicadores ejecutivos",
    size: "small",
    type: "insight"
  },
  "kpi-total": {
    title: "Total de tickets",
    description: "Todos los casos del periodo",
    category: "Tarjetas de datos",
    size: "small",
    type: "score"
  },
  "kpi-open": {
    title: "Abiertos",
    description: "Tickets que requieren atención",
    category: "Tarjetas de datos",
    size: "small",
    type: "score"
  },
  "kpi-process": {
    title: "En proceso",
    description: "Casos atendidos actualmente",
    category: "Tarjetas de datos",
    size: "small",
    type: "score"
  },
  "kpi-waiting": {
    title: "En espera",
    description: "Casos pendientes de respuesta",
    category: "Tarjetas de datos",
    size: "small",
    type: "score"
  },
  "kpi-closed": {
    title: "Cerrados",
    description: "Tickets solucionados",
    category: "Tarjetas de datos",
    size: "small",
    type: "score"
  },
  "kpi-reopened": {
    title: "Reabiertos",
    description: "Casos que necesitaron seguimiento",
    category: "Tarjetas de datos",
    size: "small",
    type: "score"
  },
  "chart-trend": {
    title: "Tendencia mensual",
    description: "Comparación entre tickets creados y cerrados.",
    category: "Gráficas",
    size: "medium",
    type: "chart"
  },
  "chart-status": {
    title: "Distribución por estado",
    description: "Participación de cada estado dentro del total consultado.",
    category: "Gráficas",
    size: "medium",
    type: "chart"
  },
  "chart-technicians": {
    title: "Carga por técnico",
    description: "Asignaciones, casos cerrados y pendientes por técnico.",
    category: "Gráficas",
    size: "medium",
    type: "chart"
  },
  "chart-categories": {
    title: "Tickets por categoría",
    description: "Categorías con mayor volumen de solicitudes.",
    category: "Gráficas",
    size: "medium",
    type: "chart"
  },
  "chart-priorities": {
    title: "Distribución por prioridad",
    description: "Proporción de tickets por nivel de atención.",
    category: "Gráficas",
    size: "medium",
    type: "chart"
  },
  "table-recent": {
    title: "Todos los tickets",
    description: "Consulta completa de los casos incluidos en el reporte administrativo.",
    category: "Detalle",
    size: "full",
    type: "table"
  }
};

export const REPORT_WIDGET_CATEGORIES = [
  "Indicadores ejecutivos",
  "Tarjetas de datos",
  "Gráficas",
  "Detalle"
];

export function normalizeReportLayout(layout) {
  if (!Array.isArray(layout)) return [...DEFAULT_REPORT_LAYOUT];

  const uniqueWidgets = [];
  layout.forEach(widgetId => {
    if (REPORT_WIDGETS[widgetId] && !uniqueWidgets.includes(widgetId)) {
      uniqueWidgets.push(widgetId);
    }
  });

  return uniqueWidgets;
}
