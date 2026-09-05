import publicadasIcon from "../../../assets/publicadas.png";
import archivadasIcon from "../../../assets/archivadas.png";
import eliminadasIcon from "../../../assets/eliminadas.png";

const ICONS = {
  publicada: publicadasIcon,
  archivada: archivadasIcon,
  eliminada: eliminadasIcon,
};
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const pluralizar = nombre => nombre.endsWith("a") ? `${nombre}s` : nombre;

export default function EstadoNoticiasTabs({ value, counts, estados, onChange }) {
  return <section className="rounded border border-slate-200 bg-white p-2 shadow-sm" aria-label="Filtrar noticias por estado">
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {estados.map(estado => {
        const active = Number(value) === Number(estado.id);
        const color = HEX_COLOR.test(estado.color_estado || "") ? estado.color_estado : "#64748B";
        const key = estado.nombre.toLocaleLowerCase("es-CO");
        return <button
          key={estado.id}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(estado.id)}
          className={`noticias-tab-button flex min-h-12 items-center justify-between gap-3 border px-4 py-2.5 text-left transition-colors ${active ? "font-semibold" : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"}`}
          style={active ? { borderColor: color, backgroundColor: `${color}12`, color } : undefined}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            {ICONS[key] && <img src={ICONS[key]} alt="" aria-hidden="true" className="h-6 w-6 shrink-0 object-contain" />}
            {pluralizar(estado.nombre)}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? "bg-white/80" : "bg-slate-100 text-slate-600"}`}>
            {counts[estado.id] || 0}
          </span>
        </button>;
      })}
    </div>
  </section>;
}
