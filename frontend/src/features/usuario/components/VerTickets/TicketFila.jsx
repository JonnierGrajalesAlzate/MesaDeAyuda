import EstadoBadge from "./EstadoBadge.jsx";
import PrioridadBadge from "./PrioridadBadge.jsx";
import FechaTicket from "./FechaTicket.jsx";
import { ArrowUpRight } from "lucide-react";
function TicketFila({
  ticket,
  onVerDetalle
}) {
  return <tr className="
                hover:bg-slate-100
                transition
                duration-200
            ">

            {/* ID */}

            <td className="
                    p-3
                    font-semibold
                    text-slate-700
                ">
                #{ticket.id}
            </td>


            {/* Asunto */}

            <td className="p-3">

                <div className="
                        font-medium
                        text-slate-800
                    ">
                    {ticket.titulo}
                </div>


                <div className="
                        text-xs
                        text-slate-400
                        mt-1
                    ">
                    {ticket.categoria}
                </div>

            </td>


            {/* Categoría */}

            <td className="
                    p-3
                    text-slate-700
                ">
                {ticket.categoria}
            </td>


            {/* Estado */}

            <td className="p-3">

                <EstadoBadge estado={ticket.estado} color={ticket.color} />

            </td>


            {/* Prioridad */}

            <td className="p-3">

                <PrioridadBadge prioridad={ticket.prioridad} color={ticket.prioridad_color} />

            </td>


            {/* Fecha */}

            <td className="p-3">

                <FechaTicket fecha={ticket.fecha_creacion} />

            </td>


            {/* Acción */}

            <td className="w-28 p-3 text-center">

                <button
                  type="button"
                  onClick={() => onVerDetalle(ticket)}
                  aria-label={`Ver detalle del ticket ${ticket.id}`}
                  title="Ver detalle"
                  className="mx-auto inline-flex h-10 w-10 cursor-pointer items-center justify-center text-slate-500 transition hover:bg-[#eaf4ff] hover:text-[#0076e3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0076e3]"
                >
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </button>

            </td>


        </tr>;
}
export default TicketFila;
