import { useMemo, useState } from "react";
import { ChartEmptyState } from "./ChartCard.jsx";

const MONTH_LABELS = {
  Jan: "Ene",
  Feb: "Feb",
  Mar: "Mar",
  Apr: "Abr",
  May: "May",
  Jun: "Jun",
  Jul: "Jul",
  Aug: "Ago",
  Sep: "Sep",
  Oct: "Oct",
  Nov: "Nov",
  Dec: "Dic"
};

function readablePeriod(period) {
  const [month, year] = String(period || "").trim().split(/\s+/);
  return {
    month: MONTH_LABELS[month] || month || "Mes",
    year: year || ""
  };
}

function roundedMaximum(value) {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

export default function MonthlyComparisonChart({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const chart = useMemo(() => {
    const values = data.map(item => ({
      label: item.periodo,
      ...readablePeriod(item.periodo),
      created: Math.max(0, Number(item.creados) || 0),
      closed: Math.max(0, Number(item.cerrados) || 0)
    }));
    const maximum = roundedMaximum(Math.max(...values.flatMap(item => [item.created, item.closed]), 0));
    return { values, maximum };
  }, [data]);

  if (!chart.values.length) {
    return <ChartEmptyState message="No hay datos mensuales para construir la comparación." />;
  }

  const width = Math.max(720, chart.values.length * 92);
  const height = 330;
  const margin = { top: 20, right: 20, bottom: 58, left: 48 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const groupWidth = plotWidth / chart.values.length;
  const barWidth = Math.min(24, groupWidth * 0.28);
  const gap = 6;
  const ticks = [0, 1, 2, 3, 4].map(index => chart.maximum / 4 * index);
  const summary = chart.values[activeIndex ?? chart.values.length - 1];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#0076e3]" />Creados</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#00a87f]" />Cerrados</span>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <strong className="mr-2 text-slate-700">{summary.label}</strong>
          Creados {summary.created} · Cerrados {summary.closed}
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Comparación mensual de tickets creados y cerrados"
          className="h-[330px] min-w-[720px]"
          style={{ width }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {ticks.map(tick => {
            const y = margin.top + plotHeight - tick / chart.maximum * plotHeight;
            return (
              <g key={tick}>
                <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke="#e8eef4" strokeWidth="1" />
                <text x={margin.left - 10} y={y + 4} textAnchor="end" fill="#7b8b9d" fontSize="11">
                  {Math.round(tick)}
                </text>
              </g>
            );
          })}

          {chart.values.map((item, index) => {
            const center = margin.left + groupWidth * index + groupWidth / 2;
            const createdHeight = item.created / chart.maximum * plotHeight;
            const closedHeight = item.closed / chart.maximum * plotHeight;
            const selected = activeIndex === index;
            return (
              <g
                key={`${item.label}-${index}`}
                tabIndex="0"
                aria-label={`${item.label}: ${item.created} creados y ${item.closed} cerrados`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                className="outline-none"
              >
                {selected && <rect x={center - groupWidth / 2 + 4} y={margin.top} width={groupWidth - 8} height={plotHeight} rx="8" fill="#f5f9fc" />}
                <rect
                  x={center - barWidth - gap / 2}
                  y={margin.top + plotHeight - createdHeight}
                  width={barWidth}
                  height={Math.max(createdHeight, item.created ? 3 : 0)}
                  rx="5"
                  fill="#0076e3"
                  className="transition-opacity hover:opacity-80"
                >
                  <title>{`${item.label}: ${item.created} creados`}</title>
                </rect>
                <rect
                  x={center + gap / 2}
                  y={margin.top + plotHeight - closedHeight}
                  width={barWidth}
                  height={Math.max(closedHeight, item.closed ? 3 : 0)}
                  rx="5"
                  fill="#00a87f"
                  className="transition-opacity hover:opacity-80"
                >
                  <title>{`${item.label}: ${item.closed} cerrados`}</title>
                </rect>
                <text x={center} y={height - 29} textAnchor="middle" fill="#526376" fontSize="12" fontWeight="600">
                  {item.month}
                </text>
                <text x={center} y={height - 13} textAnchor="middle" fill="#94a3b8" fontSize="10">
                  {item.year}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
