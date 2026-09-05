function Bar({ value, maximum, color, label }) {
  const width = value > 0 ? Math.max(5, (value / maximum) * 100) : 0;

  return <div className="grid grid-cols-[82px_minmax(0,1fr)_28px] items-center gap-2 sm:grid-cols-[90px_minmax(0,1fr)_32px]">
    <span className="text-[11px] font-semibold text-slate-500">{label}</span>
    <div className="h-3 overflow-hidden rounded-sm bg-slate-100">
      <div
        className="h-full rounded-sm transition-[width] duration-500"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
    <strong className="text-right text-xs text-[#1e222b]">{value}</strong>
  </div>;
}

function TechnicianBars({ technician, maximum }) {
  const completed = Number(technician.realizados) || 0;
  const pending = Number(technician.pendientes) || 0;

  return <li className="grid gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:grid-cols-[minmax(135px,0.7fr)_minmax(240px,1.3fr)] sm:items-center">
    <div className="min-w-0">
      <strong className="block truncate text-sm text-[#1e222b]" title={technician.tecnico}>{technician.tecnico}</strong>
      <span className="text-xs text-slate-400">{technician.rol} · {completed + pending} tickets asignados</span>
    </div>
    <div className="space-y-2">
      <Bar value={completed} maximum={maximum} color="#00d4a1" label="Realizados" />
      <Bar value={pending} maximum={maximum} color="#0076e3" label="Pendientes" />
    </div>
  </li>;
}

export default function TechnicianWorkload({ technicians = [] }) {
  const maximum = Math.max(1, ...technicians.flatMap(item => [
    Number(item.realizados) || 0,
    Number(item.pendientes) || 0
  ]));
  const pendingTotal = technicians.reduce(
    (total, technician) => total + (Number(technician.pendientes) || 0),
    0
  );
  const completedTotal = technicians.reduce(
    (total, technician) => total + (Number(technician.realizados) || 0),
    0
  );
  const ticketTotal = pendingTotal + completedTotal;

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-none border border-slate-200 bg-[#f8fafc] shadow-sm">
      <div className="grid min-h-[92px] items-center gap-4 border-b border-slate-200 bg-white px-5 py-4 md:grid-cols-[1fr_auto_1fr] sm:px-6">
        <div className="hidden md:block" aria-hidden="true" />
        <div className="text-center">
          <span className="text-[15px] font-extrabold uppercase tracking-[.12em] text-[#0076e3]">
            Equipo técnico
          </span>
          <p className="mt-1 text-sm text-slate-500">Comparativo de tickets realizados y pendientes.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-white px-3 py-3 sm:px-6">
        <div className="px-2 text-center sm:px-4">
          <strong className="block text-xl leading-none text-[#0076e3]">{pendingTotal}</strong>
          <span className="mt-1 block text-[11px] font-semibold text-slate-500">Pendientes</span>
        </div>
        <div className="px-2 text-center sm:px-4">
          <strong className="block text-xl leading-none text-[#00a980]">{completedTotal}</strong>
          <span className="mt-1 block text-[11px] font-semibold text-slate-500">Realizados</span>
        </div>
        <div className="px-2 text-center sm:px-4">
          <strong className="block text-xl leading-none text-[#1e222b]">{ticketTotal}</strong>
          <span className="mt-1 block text-[11px] font-semibold text-slate-500">Total</span>
        </div>
      </div>

      <ul className="flex-1 bg-white px-5 py-1 sm:px-6">
        {technicians.length === 0 ? (
          <li className="p-10 text-center text-sm text-slate-500">
            No hay técnicos registrados.
          </li>
        ) : technicians.map(technician => (
          <TechnicianBars key={technician.id} technician={technician} maximum={maximum} />
        ))}
      </ul>
    </article>
  );
}

