import TicketFila from "./TicketFila.jsx";
import ResponsiveTable from "../../../../shared/ui/ResponsiveTable.jsx";
function TicketsTabla({
  tickets,
  onVerDetalle
}) {
  return <div className="
                mt-6
                azure-panel
                usuario-tickets-table
                overflow-hidden
            ">

            <ResponsiveTable
              minWidth={860}
              ariaLabel="Tickets del usuario con desplazamiento horizontal"
              caption="Listado de tickets, estados, prioridades y acciones."
            >

                <thead>

                    <tr className="
                            text-slate-700
                        ">

                        <th className="text-left p-3">
                            ID
                        </th>

                        <th className="text-left p-3">
                            Asunto
                        </th>

                        <th className="text-left p-3">
                            Categoría
                        </th>

                        <th className="text-left p-3">
                            Estado
                        </th>

                        <th className="text-left p-3">
                            Prioridad
                        </th>

                        <th className="text-left p-3">
                            Fecha
                        </th>

                        <th className="w-28 p-3 text-center">
                            Acciones
                        </th>

                    </tr>

                </thead>


                <tbody>


                    {tickets.length > 0 ? tickets.map(ticket => <TicketFila key={ticket.id} ticket={ticket} onVerDetalle={onVerDetalle} />) : <tr>

                                    <td colSpan="7" className="
                                            p-6
                                            text-center
                                            text-slate-400
                                        ">
                                        No se encontraron tickets
                                    </td>

                                </tr>}


                </tbody>


            </ResponsiveTable>


        </div>;
}
export default TicketsTabla;
