import { useMemo, useState } from "react";
import { ChartEmptyState } from "./ChartCard.jsx";

const FALLBACK_COLORS = ["#0076e3", "#00c9ff", "#00d4a1", "#1e222b", "#c3cfdb"];
const SIZE = 200;
const RADIUS = 76;
const STROKE = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP_PX = 4;

export default function DonutBreakdown({ items = [], centerLabel = "Total" }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const chart = useMemo(() => {
    const values = items
      .map((item, index) => ({
        ...item,
        value: Math.max(0, Number(item.value) || 0),
        color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
      }))
      .filter(item => item.value > 0);
    const total = values.reduce((sum, item) => sum + item.value, 0);
    const gap = values.length > 1 ? GAP_PX : 0;
    const withLength = values.map(item => {
      const fraction = total ? item.value / total : 0;
      return { ...item, fraction, length: fraction * CIRCUMFERENCE };
    });
    const offsets = withLength.reduce((accumulated, item, index) => {
      const previous = index === 0 ? 0 : accumulated[index - 1];
      return [...accumulated, previous + item.length];
    }, []);
    const segments = withLength.map((item, index) => ({
      ...item,
      dash: Math.max(item.length - gap, 0),
      offset: -(index === 0 ? 0 : offsets[index - 1]),
      percentage: Math.round(item.fraction * 100)
    }));
    return { total, segments };
  }, [items]);

  if (!chart.total) return <ChartEmptyState />;

  const active = activeIndex !== null ? chart.segments[activeIndex] : null;

  return (
    <div className="grid items-center gap-7 sm:grid-cols-[200px_minmax(0,1fr)]">
      <div className="flex justify-center">
        <div className="relative">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
            <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
            {chart.segments.map((segment, index) => (
              <circle
                key={segment.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth={activeIndex === index ? STROKE + 6 : STROKE}
                strokeDasharray={`${segment.dash} ${CIRCUMFERENCE - segment.dash}`}
                strokeDashoffset={segment.offset}
                strokeLinecap="round"
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{ cursor: "pointer", transition: "stroke-width 160ms ease, opacity 160ms ease" }}
              />
            ))}
          </svg>

          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <strong className="block text-3xl font-bold text-[#1e222b]">{active ? active.value : chart.total}</strong>
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                {active ? active.label : centerLabel}
              </span>
              {active && <span className="mt-0.5 block text-[11px] font-semibold" style={{ color: active.color }}>{active.percentage}%</span>}
            </div>
          </div>
        </div>
      </div>

      <ul className="space-y-1">
        {chart.segments.map((item, index) => (
          <li
            key={item.label}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            className={`grid cursor-pointer grid-cols-[12px_minmax(0,1fr)_auto] items-center gap-3 px-2 py-2 transition ${
              activeIndex === index ? "bg-slate-50" : ""
            }`}
          >
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-700" title={item.label}>{item.label}</span>
              <span className="text-xs text-slate-400">{item.percentage}% del total</span>
            </div>
            <strong className="text-base text-[#1e222b]">{item.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
