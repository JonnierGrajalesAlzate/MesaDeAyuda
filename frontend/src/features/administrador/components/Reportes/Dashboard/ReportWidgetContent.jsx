import { Building2, TrendingUp } from "lucide-react";
import abiertoIcon from "../../../../../assets/abierto.png";
import cerradoIcon from "../../../../../assets/cerrado.png";
import enEsperaIcon from "../../../../../assets/enEspera.png";
import procesoIcon from "../../../../../assets/proceso.png";
import reabiertoIcon from "../../../../../assets/reabierto.png";
import tasaCierreIcon from "../../../../../assets/tasaCierre.png";
import tiempoIcon from "../../../../../assets/tiempo.png";
import totalTicketsIcon from "../../../../../assets/totalTickets.png";
import DonutBreakdown from "../../../../../shared/ui/Charts/DonutBreakdown.jsx";
import GroupedHorizontalBars from "../../../../../shared/ui/Charts/GroupedHorizontalBars.jsx";
import MonthlyComparisonChart from "../../../../../shared/ui/Charts/MonthlyComparisonChart.jsx";
import RankedBars from "../../../../../shared/ui/Charts/RankedBars.jsx";
import RecentTicketsTable from "../RecentTicketsTable.jsx";
import { REPORT_COLORS } from "../reportConfig.js";

const SCORE_WIDGETS = {
  "kpi-total": { field: "total", color: "#1e222b", icon: totalTicketsIcon },
  "kpi-open": { field: "abiertos", estadoId: 1, icon: abiertoIcon },
  "kpi-process": { field: "proceso", estadoId: 3, icon: procesoIcon },
  "kpi-waiting": { field: "espera", estadoId: 4, icon: enEsperaIcon },
  "kpi-closed": { field: "cerrados", estadoId: 2, icon: cerradoIcon },
  "kpi-reopened": { field: "reabiertos", estadoId: 5, icon: reabiertoIcon }
};

const ESTADO_CERRADO_ID = 2;

function prediccionInsight(prediccion) {
  if (!prediccion) {
    return {
      value: "Sin datos",
      helper: "se necesitan al menos 2 meses con tickets para estimar una tendencia",
      icon: null,
      color: "#94a3b8"
    };
  }
  const tendenciaTexto = prediccion.pendiente > 0
    ? "más tickets que el mes anterior (tendencia al alza)"
    : prediccion.pendiente < 0
      ? "menos tickets que el mes anterior (tendencia a la baja)"
      : "el mismo volumen que el mes anterior (tendencia estable)";
  return {
    value: `${prediccion.tickets_estimados} tickets`,
    helper: `estimados para ${prediccion.proximo_periodo}: ${tendenciaTexto}`,
    icon: null,
    color: prediccion.pendiente > 0 ? "#eb3131" : prediccion.pendiente < 0 ? "#00a87f" : "#0076e3"
  };
}

function InsightContent({ widgetId, data }) {
  const total = Number(data.kpis.total || 0);
  const colorCerrado = data.estados.find(estado => estado.estado_id === ESTADO_CERRADO_ID)?.color || "#00a87f";
  const insights = {
    "insight-closure": {
      value: `${total ? Math.round(Number(data.kpis.cerrados || 0) / total * 100) : 0}%`,
      helper: "de los tickets registrados están cerrados",
      icon: tasaCierreIcon,
      color: colorCerrado
    },
    "insight-area": {
      value: data.areas[0]?.area || "Sin datos",
      helper: "concentra el mayor volumen de solicitudes",
      icon: null,
      color: "#0076e3"
    },
    "insight-time": {
      value: `${data.kpis.promedio_resolucion ?? 0} h`,
      helper: "promedio estimado de resolución",
      icon: tiempoIcon,
      color: "#1e222b"
    },
    "insight-prediction": prediccionInsight(data.prediccion)
  };
  const insight = insights[widgetId];

  return (
    <div className="report-widget-insight" style={{ "--widget-accent": insight.color }}>
      <div>
        <strong title={insight.value}>{insight.value}</strong>
        <p>{insight.helper}</p>
      </div>
      {insight.icon
        ? <img src={insight.icon} alt="" />
        : widgetId === "insight-prediction"
          ? <TrendingUp width={72} height={72} strokeWidth={1.5} aria-hidden="true" />
          : <Building2 width={72} height={72} strokeWidth={1.5} aria-hidden="true" />}
    </div>
  );
}

function ScoreContent({ widgetId, data }) {
  const score = SCORE_WIDGETS[widgetId];
  const value = Number(data.kpis[score.field] || 0);
  const color = score.color || data.estados.find(estado => estado.estado_id === score.estadoId)?.color || "#0076e3";

  return (
    <div className="report-widget-score" style={{ "--widget-accent": color }}>
      <strong>{value.toLocaleString("es-CO")}</strong>
      <span>{value === 1 ? "ticket" : "tickets"}</span>
      <img className="report-widget-score-icon" src={score.icon} alt="" />
    </div>
  );
}

function chartItems(data) {
  return {
    statuses: data.estados.map((status, index) => ({
      label: status.estado,
      value: status.total,
      color: status.color || REPORT_COLORS[index % REPORT_COLORS.length]
    })),
    priorities: data.prioridades.map((priority, index) => ({
      label: priority.prioridad,
      value: priority.total,
      color: priority.prioridad_color || REPORT_COLORS[index % REPORT_COLORS.length]
    }))
  };
}

function ChartContent({ widgetId, data }) {
  const { statuses, priorities } = chartItems(data);

  if (widgetId === "chart-trend") {
    return <MonthlyComparisonChart data={data.tendencia} />;
  }
  if (widgetId === "chart-status") {
    return <DonutBreakdown items={statuses} centerLabel="Tickets" />;
  }
  if (widgetId === "chart-technicians") {
    return (
      <GroupedHorizontalBars
        items={data.tecnicos}
        nameKey="tecnico"
        series={[
          { key: "cerrados", label: "Cerrados", color: "#00d4a1" },
          { key: "pendientes", label: "Pendientes", color: "#0076e3" }
        ]}
      />
    );
  }
  if (widgetId === "chart-categories") {
    return (
      <RankedBars
        items={data.categorias}
        nameKey="categoria"
        valueKey="total"
        color="#00c9ff"
      />
    );
  }
  return <DonutBreakdown items={priorities} centerLabel="Tickets" />;
}

export default function ReportWidgetContent({ widgetId, widget, data }) {
  if (widget.type === "insight") {
    return <InsightContent widgetId={widgetId} data={data} />;
  }
  if (widget.type === "score") {
    return <ScoreContent widgetId={widgetId} data={data} />;
  }
  if (widget.type === "table") {
    return <RecentTicketsTable tickets={data.recientes} embedded />;
  }
  return <ChartContent widgetId={widgetId} data={data} />;
}
