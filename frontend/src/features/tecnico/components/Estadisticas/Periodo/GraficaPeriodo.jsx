import DonutBreakdown from "../../../../../shared/ui/Charts/DonutBreakdown.jsx";

function Metric({ label, value, accent }) {
  return (
    <div className="min-w-36 rounded border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <strong className="mt-1 block text-2xl font-bold" style={{ color: accent }}>{value}</strong>
    </div>
  );
}

function GraficaPeriodo({
  totalTickets,
  tiempoPromedio,
  cerrados,
  enProceso,
  pendientes,
  reabiertos
}) {
  const data = [
    { label: "Cerrados", value: cerrados, color: "#00d4a1" },
    { label: "En proceso", value: enProceso, color: "#f59e0b" },
    { label: "Pendientes", value: pendientes, color: "#0076e3" },
    { label: "Reabiertos", value: reabiertos, color: "#ef4444" }
  ];

  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Distribución de tickets</h2>
          <p className="mt-1 text-sm text-slate-500">Resumen interactivo del período consultado.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Metric label="Total de tickets" value={totalTickets} accent="#0076e3" />
          <Metric label="Tiempo promedio" value={tiempoPromedio} accent="#008f6c" />
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <DonutBreakdown items={data} centerLabel="Tickets" />
      </div>
    </div>
  );
}

export default GraficaPeriodo;
