import TicketFilaTecnico from "./TicketFilaTecnico.jsx";
import ResponsiveTable from "../../../../shared/ui/ResponsiveTable.jsx";
function TicketsTablaTecnico({
  tickets = [],
  onVerDetalle
}) {
  return <div className="
                mt-6
                bg-white
                border
                border-slate-200
                shadow-sm
                overflow-hidden
                rounded
            ">

            <ResponsiveTable
              minWidth={980}
              ariaLabel="Tickets del técnico con desplazamiento horizontal"
              caption="Tickets incluidos en las estadísticas del técnico."
            >

                <thead>

                    <tr className="text-slate-700">

                        <th className="p-3 text-left">
                            ID
                        </th>

                        <th className="p-3 text-left">
                            Asunto
                        </th>

                        <th className="p-3 text-left">
                            Categoría
                        </th>

                        <th className="p-3 text-left">
                            Estado
                        </th>

                        <th className="p-3 text-left">
                            Prioridad
                        </th>

                        <th className="p-3 text-left">
                            Usuario
                        </th>

                        <th className="p-3 text-left">
                            Duración
                        </th>

                        <th className="p-3 text-left">
                            Acciones
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {tickets?.length > 0 ? tickets.map(ticket => <TicketFilaTecnico key={ticket.id} ticket={ticket} onVerDetalle={onVerDetalle} />) : <tr>

                                    <td colSpan={8} className="
                                            p-8
                                            text-center
                                            text-slate-400
                                        ">

                                        No se encontraron tickets.

                                    </td>

                                </tr>}

                </tbody>

            </ResponsiveTable>

        </div>;
}
export default TicketsTablaTecnico;
