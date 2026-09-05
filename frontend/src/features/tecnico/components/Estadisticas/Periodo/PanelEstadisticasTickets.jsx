import GraficaPeriodo from "./GraficaPeriodo.jsx";
function PanelEstadisticasTickets({
  totalTickets,
  cerrados,
  enProceso,
  pendientes,
  reabiertos,
  tiempoPromedio
}) {
  return <div className="
                mt-10
                w-full
            ">

            <GraficaPeriodo totalTickets={totalTickets} tiempoPromedio={tiempoPromedio} cerrados={cerrados} enProceso={enProceso} pendientes={pendientes} reabiertos={reabiertos} />

        </div>;
}
export default PanelEstadisticasTickets;
