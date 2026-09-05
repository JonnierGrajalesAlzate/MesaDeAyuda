import { ChartEmptyState } from "./ChartCard.jsx";

export default function GroupedHorizontalBars({
  items = [],
  nameKey,
  series = [],
  limit = 8
}) {
  const normalized = items
    .map(item => ({
      ...item,
      __total: series.reduce(
        (total, entry) => total + Math.max(0, Number(item[entry.key]) || 0),
        0
      )
    }))
    .filter(item => item.__total > 0)
    .sort((left, right) => right.__total - left.__total)
    .slice(0, limit);

  const maximum = Math.max(
    ...normalized.flatMap(item =>
      series.map(entry => Math.max(0, Number(item[entry.key]) || 0))
    ),
    1
  );

  if (!normalized.length) return <ChartEmptyState />;

  return (
    <div className="report-grouped-bars">
      <div className="report-grouped-bars-legend" aria-label="Leyenda">
        {series.map(entry => (
          <span key={entry.key}>
            <i style={{ backgroundColor: entry.color }} />
            {entry.label}
          </span>
        ))}
      </div>

      <ol className="report-grouped-bars-list">
        {normalized.map((item, index) => (
          <li key={`${item[nameKey]}-${index}`}>
            <strong title={item[nameKey]}>
              {item[nameKey] || "Sin asignar"}
            </strong>

            <div className="report-grouped-bars-series">
              {series.map(entry => {
                const value = Math.max(0, Number(item[entry.key]) || 0);
                return (
                  <div key={entry.key} className="report-grouped-bars-row">
                    <span>{entry.label}</span>
                    <div className="report-grouped-bars-track">
                      <i
                        style={{
                          width: `${value / maximum * 100}%`,
                          backgroundColor: entry.color
                        }}
                      />
                    </div>
                    <b>{value}</b>
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
