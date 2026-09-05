export default function ChartCard({ title, description, children, className = "" }) {
  return (
    <article className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-bold text-[#1e222b]">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </article>
  );
}

export function ChartEmptyState({ message = "No hay datos para mostrar." }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
