import { ArrowUpRight } from "lucide-react";
import EstadoBadge from "../../../usuario/components/VerTickets/EstadoBadge.jsx";
import PrioridadBadge from "../../../usuario/components/VerTickets/PrioridadBadge.jsx";
function TicketFilaTecnico({
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


            {/* Usuario */}

            <td className="p-3">

                <div className="
                        font-medium
                        text-slate-700
                    ">
                    {ticket.usuario}
                </div>

            </td>


                        {/* Tiempo estimado */}

            <td className="p-3">

                <span className={`
                        font-semibold
                        ${ticket.tiempo_estimado === "Por definir" ? "text-slate-500" : "text-emerald-600"}
                    `}>
                    {ticket.tiempo_estimado}
                </span>

            </td> 


            {/* Acción */}

            <td className="p-3">

                <button
                  type="button"
                  onClick={() => onVerDetalle(ticket)}
                  aria-label="Ver más detalles"
                  title="Ver más detalles"
                  className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        text-slate-500
                        transition
                        hover:text-[#0076e3]
                        cursor-pointer
                    "
                >
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </button>

            </td>

        </tr>;
}
export default TicketFilaTecnico;
