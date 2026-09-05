import { useState } from "react";
import ResponsiveTable from "../../../../shared/ui/ResponsiveTable.jsx";
import EstadoBadge from "../../../usuario/components/VerTickets/EstadoBadge.jsx";
import PrioridadBadge from "../../../usuario/components/VerTickets/PrioridadBadge.jsx";
import FechaTicket from "../../../usuario/components/VerTickets/FechaTicket.jsx";

const HEADERS = ["ID", "Título", "Usuario", "Técnico", "Estado", "Prioridad", "Fecha"];
export default function RecentTicketsTable({
  tickets,
  embedded = false
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = tickets.length > 5;
  const visibleTickets = expanded ? tickets : tickets.slice(0, 5);

  return <section className={embedded ? "report-recent-table" : "rounded-none border border-slate-200 bg-white p-6 shadow-sm"}>
      {!embedded && <h2 className="mb-4 text-xl font-bold">Todos los tickets</h2>}
      <div className="overflow-hidden rounded-none border border-slate-200">
        <ResponsiveTable
          minWidth={920}
          ariaLabel="Todos los tickets del reporte con desplazamiento horizontal"
          caption="Todos los tickets incluidos en el reporte administrativo."
        >
          <thead>
            <tr className="text-slate-700">
              {HEADERS.map(header => <th key={header} className="p-3 text-left">
                  {header}
                </th>)}
            </tr>
          </thead>
          <tbody>
            {visibleTickets.map(ticket => <tr key={ticket.id} className="hover:bg-slate-100 transition duration-200">
                <td className="p-3 font-semibold text-slate-700">#{ticket.id}</td>
                <td className="p-3 font-medium text-slate-800">{ticket.titulo}</td>
                <td className="p-3">{ticket.usuario}</td>
                <td className="p-3">{ticket.tecnico || "Sin asignar"}</td>
                <td className="p-3">
                  <EstadoBadge estado={ticket.estado} color={ticket.color} className="report-status-badge" />
                </td>
                <td className="p-3">
                  <PrioridadBadge prioridad={ticket.prioridad} color={ticket.prioridad_color} className="report-status-badge" />
                </td>
                <td className="whitespace-nowrap p-3">
                  <FechaTicket fecha={ticket.fecha_creacion} />
                </td>
              </tr>)}
          </tbody>
        </ResponsiveTable>

        {hasMore && (
          <div className="flex items-center justify-center border-t border-slate-200 bg-slate-50 px-4 py-3">
            <button
              type="button"
              onClick={() => setExpanded(current => !current)}
              aria-expanded={expanded}
              className="inline-flex items-center gap-2 border-0 bg-transparent text-xs font-bold text-[#0076e3] transition hover:text-[#005aaf]"
            >
              {expanded ? "Ver menos" : `Ver más (${tickets.length - 5} restantes)`}
            </button>
          </div>
        )}
      </div>
    </section>;
}
