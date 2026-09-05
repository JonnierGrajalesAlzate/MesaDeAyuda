import { ChartEmptyState } from "./ChartCard.jsx";

export default function RankedBars({
  items = [],
  nameKey,
  valueKey,
  color = "#0076e3",
  segments = [],
  limit = 8
}) {
  const normalized = items
    .map(item => ({ ...item, __value: Math.max(0, Number(item[valueKey]) || 0) }))
    .filter(item => item.__value > 0)
    .sort((left, right) => right.__value - left.__value)
    .slice(0, limit);
  const maximum = Math.max(...normalized.map(item => item.__value), 1);

  if (!normalized.length) return <ChartEmptyState />;

  return (
    <div>
      {segments.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2">
          {segments.map(segment => (
            <span key={segment.key} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
              {segment.label}
            </span>
          ))}
        </div>
      )}

      <ol className="space-y-4">
        {normalized.map((item, index) => {
          const width = item.__value / maximum * 100;
          return (
            <li key={`${item[nameKey]}-${index}`}>
              <div className="mb-1.5 flex items-center justify-between gap-4">
                <span className="min-w-0 truncate text-sm font-semibold text-slate-700" title={item[nameKey]}>
                  {index + 1}. {item[nameKey] || "Sin asignar"}
                </span>
                <strong className="shrink-0 text-sm text-[#1e222b]">{item.__value}</strong>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100" title={`${item[nameKey]}: ${item.__value}`}>
                <div className="flex h-full overflow-hidden rounded-full transition-all duration-500" style={{ width: `${width}%`, backgroundColor: segments.length ? undefined : color }}>
                  {segments.map(segment => {
                    const segmentValue = Math.max(0, Number(item[segment.key]) || 0);
                    const segmentWidth = item.__value ? segmentValue / item.__value * 100 : 0;
                    return <span key={segment.key} className="h-full" style={{ width: `${segmentWidth}%`, backgroundColor: segment.color }} />;
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
