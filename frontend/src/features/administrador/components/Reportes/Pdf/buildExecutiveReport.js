import { DEFAULT_REPORT_LAYOUT, normalizeReportLayout } from "../Dashboard/reportDashboardConfig.js";
import logoCargando from "../../../../../assets/logo2.png?inline";

const COLORS = {
  blue: "#0076e3",
  cyan: "#00c9ff",
  mint: "#00d4a1",
  ink: "#1e222b",
  silver: "#c3cfdb"
};

const KPI_ITEMS = [
  ["kpi-total", "total", "Total", null],
  ["kpi-open", "abiertos", "Abiertos", 1],
  ["kpi-process", "proceso", "En proceso", 3],
  ["kpi-waiting", "espera", "En espera", 4],
  ["kpi-reopened", "reabiertos", "Reabiertos", 5],
  ["kpi-closed", "cerrados", "Cerrados", 2]
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeColor(value, fallback = COLORS.silver) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : fallback;
}

function estadoColor(data, estadoId, fallback) {
  const found = data.estados.find(estado => Number(estado.estado_id) === estadoId);
  return safeColor(found?.color, fallback);
}

function hexToRgba(hex, alpha) {
  const clean = safeColor(hex).replace("#", "");
  const value = parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits }).format(number(value));
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? escapeHtml(value)
    : new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function truncate(value, length = 38) {
  const text = String(value || "Sin información");
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function findLabel(collection, id, idKey, labelKey) {
  return collection.find(item => String(item[idKey]) === String(id))?.[labelKey] || id;
}

function activeFilterEntries(data, filters) {
  const definitions = [
    ["Estado", "estado", data.estados, "estado_id", "estado"],
    ["Técnico", "tecnico", data.tecnicos, "tecnico_id", "tecnico"],
    ["Categoría", "categoria", data.categorias, "categoria_id", "categoria"],
    ["Área", "area", data.areas, "area_id", "area"],
    ["Prioridad", "prioridad", data.prioridades, "prioridad_id", "prioridad"]
  ];
  return definitions
    .map(([label, key, collection, idKey, labelKey]) => {
      const values = Array.isArray(filters[key]) ? filters[key] : filters[key] ? [filters[key]] : [];
      if (!values.length) return null;
      return [label, values.map(value => findLabel(collection, value, idKey, labelKey)).join(", ")];
    })
    .filter(Boolean);
}

function heroDateRange(filters) {
  if (!filters.inicio && !filters.fin) return "Histórico completo";
  if (filters.inicio && filters.fin) {
    const start = new Date(`${filters.inicio}T00:00:00`);
    const end = new Date(`${filters.fin}T00:00:00`);
    const sameYear = start.getFullYear() === end.getFullYear();
    const startLabel = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: sameYear ? undefined : "numeric" }).format(start);
    const endLabel = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(end);
    return `${startLabel} – ${endLabel}`;
  }
  return filters.inicio
    ? `Desde ${formatDate(`${filters.inicio}T00:00:00`)}`
    : `Hasta ${formatDate(`${filters.fin}T00:00:00`)}`;
}

function statFontSize(value) {
  const length = String(value).length;
  if (length > 40) return "12px";
  if (length > 26) return "14px";
  if (length > 16) return "16px";
  return "19px";
}

function heroHeader({ title, subtitle, stats = [] }) {
  const statsMarkup = stats.length ? `
    <div class="hero-stats">
      ${stats.map(([label, value]) => `<div class="hero-stat"><small>${escapeHtml(label)}</small><strong style="font-size:${statFontSize(value)}">${escapeHtml(value)}</strong></div>`).join("")}
    </div>
  ` : "";
  return `
    <header class="hero-banner">
      <div class="hero-top">
        <img class="hero-logo" src="${logoCargando}" alt="" />
        <div class="hero-heading">
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(subtitle)}</p>
        </div>
      </div>
      ${statsMarkup}
    </header>
  `;
}

function summaryMarkup(data, layout, catalogData) {
  const items = KPI_ITEMS.map(([widgetId, key, label, estadoId]) => [
    widgetId,
    label,
    formatNumber(data.kpis[key]),
    estadoId ? estadoColor(catalogData, estadoId, COLORS.blue) : COLORS.ink
  ]);
  const byId = new Map(items.map(item => [item[0], item]));
  const ordered = layout.map(widgetId => byId.get(widgetId)).filter(Boolean);
  if (!ordered.length) return '<div class="kpi-empty">No hay indicadores seleccionados.</div>';
  return ordered.map(([, label, value, color]) => `
    <div class="kpi-card" style="--accent:${color}">
      <small>${escapeHtml(label)}</small>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");
}

function statusMarkup(statuses, total) {
  if (!statuses.length) return '<div class="empty">No hay datos de estados para el período.</div>';
  const maximum = Math.max(...statuses.map(item => number(item.total)), 1);
  return statuses.map(status => {
    const value = number(status.total);
    const color = safeColor(status.color, COLORS.blue);
    const width = Math.max(value ? value / maximum * 100 : 0, value ? 4 : 0);
    const share = total ? Math.round(value / total * 100) : 0;
    return `
      <div class="bar-row">
        <div class="bar-heading"><span>${escapeHtml(status.estado)}</span><strong>${formatNumber(value)} · ${share}%</strong></div>
        <div class="bar-track"><span style="width:${width}%;background:${color}"></span></div>
      </div>
    `;
  }).join("");
}

function rankedMarkup(items, nameKey, valueKey, color, emptyMessage) {
  const ranked = items.slice(0, 5);
  if (!ranked.length) return `<div class="empty">${escapeHtml(emptyMessage)}</div>`;
  const maximum = Math.max(...ranked.map(item => number(item[valueKey])), 1);
  return ranked.map((item, index) => {
    const value = number(item[valueKey]);
    const width = Math.max(value ? value / maximum * 100 : 0, value ? 4 : 0);
    return `
      <div class="rank-row">
        <span class="rank-index">${index + 1}</span>
        <div class="rank-content">
          <div><span>${escapeHtml(truncate(item[nameKey], 28))}</span><strong>${formatNumber(value)}</strong></div>
          <div class="rank-track"><span style="width:${width}%;background:${color}"></span></div>
        </div>
      </div>
    `;
  }).join("");
}

function trendMarkup(trend) {
  if (!trend.length) return '<div class="empty chart-empty">No hay tendencia disponible para el período.</div>';

  const width = 840;
  const height = 235;
  const left = 46;
  const right = 18;
  const top = 18;
  const bottom = 48;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maximum = Math.max(...trend.flatMap(item => [number(item.creados), number(item.cerrados)]), 1);
  const groupWidth = plotWidth / trend.length;
  const barWidth = Math.min(groupWidth * 0.28, 20);
  const gridLines = Array.from({ length: 5 }, (_, index) => {
    const value = maximum * (4 - index) / 4;
    const y = top + plotHeight * index / 4;
    return `<line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="#dbe5ef" stroke-width="1" />
      <text x="${left - 8}" y="${y + 3}" text-anchor="end" class="axis-label">${formatNumber(value)}</text>`;
  }).join("");

  const bars = trend.map((item, index) => {
    const created = number(item.creados);
    const closed = number(item.cerrados);
    const center = left + groupWidth * index + groupWidth / 2;
    const createdHeight = created / maximum * plotHeight;
    const closedHeight = closed / maximum * plotHeight;
    const label = truncate(item.periodo, 12);
    return `
      <rect x="${center - barWidth - 2}" y="${top + plotHeight - createdHeight}" width="${barWidth}" height="${createdHeight}" rx="3" fill="${COLORS.blue}" />
      <rect x="${center + 2}" y="${top + plotHeight - closedHeight}" width="${barWidth}" height="${closedHeight}" rx="3" fill="${COLORS.mint}" />
      <text x="${center}" y="${height - 21}" text-anchor="middle" class="period-label">${escapeHtml(label)}</text>
    `;
  }).join("");

  return `
    <svg class="trend-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Tickets creados y cerrados por mes">
      ${gridLines}
      ${bars}
      <line x1="${left}" y1="${top + plotHeight}" x2="${width - right}" y2="${top + plotHeight}" stroke="#9bacbd" stroke-width="1" />
    </svg>
    <div class="legend"><span><i style="background:${COLORS.blue}"></i>Creados</span><span><i style="background:${COLORS.mint}"></i>Cerrados</span></div>
  `;
}

function recommendationsMarkup(data) {
  const recommendations = [];
  if (data.categorias[0]) {
    recommendations.push(`<strong>Prevención:</strong> reforzar conocimiento sobre ${escapeHtml(data.categorias[0].categoria)}, la categoría con mayor volumen.`);
  }
  if (!recommendations.length) recommendations.push("Mantener el seguimiento periódico de los indicadores y los acuerdos de servicio.");

  return recommendations.slice(0, 3).map((recommendation, index) => `
    <div class="recommendation"><span>${index + 1}</span><p>${recommendation}</p></div>
  `).join("");
}

function ticketsMarkup(tickets) {
  if (!tickets.length) return '<tr><td colspan="7" class="table-empty">No hay tickets para los filtros aplicados.</td></tr>';
  return tickets.map(ticket => {
    const statusColor = safeColor(ticket.color, COLORS.blue);
    const priorityColor = safeColor(ticket.prioridad_color, COLORS.silver);
    return `
      <tr>
        <td class="ticket-id">#${escapeHtml(ticket.id)}</td>
        <td class="ticket-title">${escapeHtml(truncate(ticket.titulo, 48))}</td>
        <td>${escapeHtml(truncate(ticket.usuario, 28))}</td>
        <td>${escapeHtml(truncate(ticket.tecnico || "Sin asignar", 28))}</td>
        <td><span class="pill" style="--pill:${statusColor};--pill-bg:${hexToRgba(statusColor, 0.12)}">${escapeHtml(ticket.estado)}</span></td>
        <td><span class="pill" style="--pill:${priorityColor};--pill-bg:${hexToRgba(priorityColor, 0.12)}">${escapeHtml(ticket.prioridad)}</span></td>
        <td>${formatDate(ticket.fecha_creacion)}</td>
      </tr>
    `;
  }).join("");
}

function pageFooter(page, totalPages) {
  return `<footer class="page-footer"><span>Londoño Gómez</span><span>Página ${page} de ${totalPages}</span></footer>`;
}

function chartWidgetsMarkup(data, layout, total) {
  const charts = {
    "chart-trend": () => `<article class="panel pdf-chart-wide"><h3>Tendencia mensual</h3><p class="panel-description">Comparación entre tickets creados y cerrados.</p>${trendMarkup(data.tendencia)}</article>`,
    "chart-status": () => `<article class="panel"><h3>Distribución por estado</h3><p class="panel-description">Participación sobre el total consultado.</p>${statusMarkup(data.estados, total)}</article>`,
    "chart-technicians": () => `<article class="panel"><h3>Carga por técnico</h3><p class="panel-description">Top 5 por tickets asignados.</p>${rankedMarkup(data.tecnicos, "tecnico", "asignados", COLORS.blue, "Sin asignaciones registradas.")}</article>`,
    "chart-categories": () => `<article class="panel"><h3>Categorías más frecuentes</h3><p class="panel-description">Top 5 por volumen de solicitudes.</p>${rankedMarkup(data.categorias, "categoria", "total", COLORS.cyan, "Sin categorías registradas.")}</article>`,
    "chart-priorities": () => `<article class="panel"><h3>Prioridades</h3><p class="panel-description">Distribución por nivel de atención.</p>${rankedMarkup(data.prioridades, "prioridad", "total", COLORS.mint, "Sin prioridades registradas.")}</article>`
  };
  return layout.filter(widgetId => charts[widgetId]).map(widgetId => charts[widgetId]()).join("");
}

const FIRST_TICKET_PAGE_ROWS = 6;
const TICKET_PAGE_ROWS = 11;

function splitTickets(tickets) {
  if (!tickets.length) return [[]];
  const pages = [tickets.slice(0, FIRST_TICKET_PAGE_ROWS)];
  for (let index = FIRST_TICKET_PAGE_ROWS; index < tickets.length; index += TICKET_PAGE_ROWS) {
    pages.push(tickets.slice(index, index + TICKET_PAGE_ROWS));
  }
  return pages;
}

function ticketPagesMarkup(data, totalPages, startPage) {
  return splitTickets(data.recientes).map((tickets, index) => {
    const page = index + startPage;
    const firstPage = index === 0;
    const firstRecord = firstPage ? 1 : FIRST_TICKET_PAGE_ROWS + 1 + (index - 1) * TICKET_PAGE_ROWS;
    const lastRecord = firstRecord + tickets.length - 1;

    return `
      <section class="sheet">
        ${heroHeader({
          title: firstPage ? "Seguimiento" : "Todos los tickets",
          subtitle: firstPage
            ? "Recomendaciones automáticas y casos incluidos en la consulta filtrada."
            : `Continuación del listado · registros ${formatNumber(firstRecord)} a ${formatNumber(lastRecord)}.`
        })}
        ${firstPage ? `<div class="recommendations">${recommendationsMarkup(data)}</div>` : ""}
        ${firstPage ? '<p class="section-label">Todos los tickets</p>' : ""}
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Título</th><th>Usuario</th><th>Técnico</th><th>Estado</th><th>Prioridad</th><th>Fecha</th></tr></thead>
            <tbody>${ticketsMarkup(tickets)}</tbody>
          </table>
        </div>
        ${pageFooter(page, totalPages)}
      </section>
    `;
  }).join("");
}

export function buildExecutiveReportHtml(report = {}, filters = {}, requestedLayout = DEFAULT_REPORT_LAYOUT, catalogs = {}) {
  const data = {
    kpis: report.kpis || {},
    estados: report.estados || [],
    tecnicos: report.tecnicos || [],
    areas: report.areas || [],
    categorias: report.categorias || [],
    prioridades: report.prioridades || [],
    tendencia: report.tendencia || [],
    recientes: report.recientes || []
  };
  const catalogData = {
    estados: catalogs.estados?.length ? catalogs.estados : data.estados,
    tecnicos: catalogs.tecnicos?.length ? catalogs.tecnicos : data.tecnicos,
    areas: catalogs.areas?.length ? catalogs.areas : data.areas,
    categorias: catalogs.categorias?.length ? catalogs.categorias : data.categorias,
    prioridades: catalogs.prioridades?.length ? catalogs.prioridades : data.prioridades
  };
  const generatedAt = new Date();
  const total = number(data.kpis.total);
  const closed = number(data.kpis.cerrados);
  const pending = Math.max(total - closed, 0);
  const closureRate = total ? Math.round(closed / total * 100) : 0;
  const topArea = data.areas[0]?.area || "Sin datos";
  const layout = normalizeReportLayout(requestedLayout);
  const chartWidgetIds = layout.filter(widgetId => widgetId.startsWith("chart-"));
  const hasCharts = chartWidgetIds.length > 0;
  const hasTickets = layout.includes("table-recent");
  const ticketPageCount = hasTickets ? splitTickets(data.recientes).length : 0;
  const totalPages = 1 + (hasCharts ? 1 : 0) + ticketPageCount;
  const ticketStartPage = hasCharts ? 3 : 2;
  const activeFilters = activeFilterEntries(catalogData, filters);
  const heroSlots = [
    { label: "Tasa de cierre", value: `${closureRate}%`, priority: 4 },
    { label: "Tiempo promedio", value: `${formatNumber(data.kpis.promedio_resolucion, 1)} h`, priority: 3 },
    { label: "Tickets totales", value: formatNumber(total), priority: 1 },
    { label: "Área con más demanda", value: topArea, priority: 2 }
  ];
  [...heroSlots].sort((a, b) => a.priority - b.priority).forEach((slot, index) => {
    const filterEntry = activeFilters[index];
    if (filterEntry) {
      slot.label = filterEntry[0];
      slot.value = filterEntry[1];
    }
  });
  const heroStats = heroSlots.map(({ label, value }) => [label, value]);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Informe Soporte LG · ${generatedAt.toISOString().slice(0, 10)}</title>
  <style>
    :root{--blue:${COLORS.blue};--cyan:${COLORS.cyan};--mint:${COLORS.mint};--ink:${COLORS.ink};--silver:${COLORS.silver};--paper:#fff;--muted:#5e6b7a;--line:#dce5ee;--soft:#f3f7fb}
    *{box-sizing:border-box}
    html,body{margin:0;background:#e8eef4;color:var(--ink);font-family:"Segoe UI",Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{padding:24px 0 60px}
    .print-toolbar{position:sticky;top:12px;z-index:10;display:flex;justify-content:center;gap:10px;margin:0 auto 18px;width:max-content;padding:8px;border:1px solid #cbd7e2;border-radius:12px;background:rgba(255,255,255,.96);box-shadow:0 8px 25px rgba(30,34,43,.12)}
    .print-toolbar button{border:0;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer}.print-primary{background:var(--blue);color:#fff}.print-secondary{background:#eaf0f6;color:var(--ink)}
    .sheet{position:relative;width:297mm;min-height:210mm;margin:0 auto 18px;padding:12mm 14mm 13mm;background:var(--paper);box-shadow:0 16px 45px rgba(30,34,43,.14);break-after:page;page-break-after:always;overflow:hidden}
    .sheet-summary{display:flex;flex-direction:column}
    .sheet-summary .kpi-grid{flex:1;min-height:0}
    .sheet:last-of-type{break-after:auto;page-break-after:auto}
    .page-footer{position:absolute;left:14mm;right:14mm;bottom:6mm;display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:2.5mm;color:#718092;font-size:8px}
    .hero-banner{margin:-12mm -14mm 8mm;padding:9mm 14mm 8mm;background:linear-gradient(135deg,#0f2340,#1b3f63);color:#fff}.hero-top{display:flex;align-items:center;gap:14px}.hero-logo{display:block;width:52px;height:52px;object-fit:contain}.hero-heading h1{margin:0;font-size:26px;font-weight:800;letter-spacing:-.3px}.hero-heading p{margin:4px 0 0;color:#b9c9de;font-size:10.5px}.hero-stats{display:flex;margin-top:9mm;padding-top:7mm;border-top:1px solid rgba(255,255,255,.14)}.hero-stat{flex:1;padding:0 16px;border-left:1px solid rgba(255,255,255,.14)}.hero-stat:first-child{padding-left:0;border-left:0}.hero-stat small{display:block;color:#9fb4cf;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px}.hero-stat strong{display:block;margin-top:6px;font-weight:800;line-height:1.2;word-break:break-word}
    .section-label{margin:7mm 0 3mm;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#637184}.kpi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));grid-auto-rows:1fr;gap:10px}.kpi-card{position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px solid var(--line);border-radius:14px;padding:16px;background:#fff}.kpi-card::before{position:absolute;top:0;left:0;right:0;height:4px;background:var(--accent);content:""}.kpi-card small{display:block;color:#637184;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px}.kpi-card strong{display:block;margin-top:12px;color:var(--ink);font-size:36px;font-weight:800}.kpi-empty{grid-column:1/-1;padding:28px;border:1px solid var(--line);border-radius:10px;text-align:center;color:var(--muted);background:#fff}
    .insight-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.insight{border-radius:12px;padding:12px 14px;color:#fff}.insight small{display:block;font-size:8.5px;opacity:.78;text-transform:uppercase;letter-spacing:.8px}.insight strong{display:block;margin-top:6px;font-size:18px}.insight p{margin:3px 0 0;font-size:8.5px;opacity:.82}.executive-note{display:flex;align-items:center;gap:13px;margin-top:7px;border:1px solid #cbe1f7;border-radius:11px;padding:10px 12px;background:#eff7ff}.executive-note strong{flex:none;color:var(--blue);font-size:9px;text-transform:uppercase;letter-spacing:.6px}.executive-note p{margin:0;color:#47576a;font-size:9px;line-height:1.45}.pdf-widget-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.pdf-widget-grid .pdf-chart-wide{grid-column:1/-1}.pdf-widget-grid .trend-chart{height:47mm}
    .analysis-grid{display:grid;grid-template-columns:1.55fr .8fr;gap:8px}.panel{border:1px solid var(--line);border-radius:12px;padding:11px;background:#fff;break-inside:avoid;page-break-inside:avoid}.panel h3{margin:0;font-size:11px}.panel-description{margin:3px 0 7px;color:var(--muted);font-size:8px}.trend-chart{display:block;width:100%;height:54mm}.axis-label,.period-label{fill:#647487;font-family:"Segoe UI",Arial,sans-serif;font-size:9px}.period-label{font-size:8px}.legend{display:flex;justify-content:center;gap:18px;margin-top:2px;color:var(--muted);font-size:8px}.legend span{display:flex;align-items:center;gap:5px}.legend i{width:8px;height:8px;border-radius:2px}
    .bar-row{margin-top:9px}.bar-heading,.rank-content>div:first-child{display:flex;justify-content:space-between;gap:8px;color:#546274;font-size:8.5px}.bar-heading strong,.rank-content strong{color:var(--ink)}.bar-track,.rank-track{height:6px;margin-top:4px;border-radius:99px;background:#e8eef4;overflow:hidden}.bar-track span,.rank-track span{display:block;height:100%;border-radius:99px}.ranking-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.rank-row{display:flex;align-items:center;gap:7px;margin-top:8px}.rank-index{display:grid;flex:none;place-items:center;width:18px;height:18px;border-radius:6px;background:#edf3f8;color:#6a7889;font-size:8px;font-weight:800}.rank-content{min-width:0;flex:1}.empty{display:grid;place-items:center;min-height:35mm;color:#788696;font-size:9px;text-align:center}.chart-empty{min-height:54mm}
    .recommendations{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin:4mm 0}.recommendation{display:flex;align-items:flex-start;gap:9px;border:1px solid var(--line);border-radius:10px;padding:9px;background:var(--soft)}.recommendation>span{display:grid;flex:none;place-items:center;width:20px;height:20px;border-radius:6px;background:var(--blue);color:#fff;font-size:9px;font-weight:800}.recommendation p{margin:0;color:#4c5b6d;font-size:8px;line-height:1.42}.recommendation strong{color:var(--ink)}
    .table-wrap{overflow:hidden;border:1px solid var(--line);border-radius:11px;box-shadow:0 4px 14px rgba(30,34,43,.05)}table{width:100%;border-collapse:collapse;table-layout:fixed}thead{background:linear-gradient(135deg,var(--ink),#2c3648);color:#fff}th{padding:9px 10px;font-size:7.5px;text-align:left;text-transform:uppercase;letter-spacing:.6px;white-space:nowrap}td{overflow:hidden;padding:9px 10px;border-top:1px solid #e4ebf2;color:#4b596a;font-size:8.5px;line-height:1.3;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle}tbody tr{break-inside:avoid;page-break-inside:avoid}tbody tr:nth-child(even){background:#f7f9fc}.ticket-id{width:6%;color:var(--blue);font-weight:800}.ticket-title{width:24%;color:var(--ink);font-weight:700}th:nth-child(3),th:nth-child(4){width:14%}th:nth-child(5),th:nth-child(6){width:11%}th:last-child{width:12%}.pill{display:inline-block;border:1px solid var(--pill);border-radius:999px;padding:4px 9px;color:var(--pill);background:var(--pill-bg);font-size:7px;font-weight:800;white-space:nowrap}.table-empty{padding:28px;text-align:center;color:var(--muted)}
    @page{size:A4 landscape;margin:0}
    @media print{html,body{background:#fff}body{padding:0}.print-toolbar{display:none}.sheet{margin:0;box-shadow:none}}
    @media screen and (max-width:1150px){.sheet{transform-origin:top center;transform:scale(.82);margin-bottom:-32mm}}
  </style>
</head>
<body>
  <nav class="print-toolbar" aria-label="Acciones del informe">
    <button class="print-primary" onclick="window.print()">Guardar como PDF / imprimir</button>
    <button class="print-secondary" onclick="window.close()">Cerrar vista previa</button>
  </nav>

  <main>
    <section class="sheet sheet-summary">
      ${heroHeader({
        title: "Informe de soporte",
        subtitle: `Resumen detallado de todos los tickets · ${heroDateRange(filters)}`,
        stats: heroStats
      })}
      <p class="section-label">Indicadores clave</p>
      <div class="kpi-grid" aria-label="Indicadores clave del reporte filtrado">${summaryMarkup(data, layout, catalogData)}</div>
      <div class="executive-note"><strong>Conclusión</strong><p>Se registran <b>${formatNumber(total)}</b> tickets; <b>${formatNumber(pending)}</b> continúan activos. El tiempo promedio de resolución es de <b>${formatNumber(data.kpis.promedio_resolucion, 1)} horas</b>. Se recomienda enfocar el seguimiento en ${escapeHtml(topArea)} y monitorear las reaperturas.</p></div>
      ${pageFooter(1, totalPages)}
    </section>

    ${hasCharts ? `
      <section class="sheet">
        ${heroHeader({
          title: "Comportamiento y distribución",
          subtitle: "Widgets gráficos seleccionados por el administrador."
        })}
        <div class="pdf-widget-grid">${chartWidgetsMarkup(data, layout, total)}</div>
        ${pageFooter(2, totalPages)}
      </section>
    ` : ""}
    ${hasTickets ? ticketPagesMarkup(data, totalPages, ticketStartPage) : ""}
  </main>
  <script>window.addEventListener("load", function(){ window.setTimeout(function(){ window.print(); }, 350); });</script>
</body>
</html>`;
}

export function openExecutiveReport(report, filters, layout, catalogs) {
  const html = buildExecutiveReportHtml(report, filters, layout, catalogs);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const preview = window.open(url, "_blank");

  if (!preview) {
    URL.revokeObjectURL(url);
    return false;
  }

  preview.opener = null;
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}
