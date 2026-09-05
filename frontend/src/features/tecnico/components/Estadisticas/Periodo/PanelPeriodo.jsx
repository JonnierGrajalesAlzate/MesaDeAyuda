import FilterDisclosure from "../../../../../shared/ui/Filters/FilterDisclosure.jsx";
import BotonBuscarPeriodo from "./BotonBuscarPeriodo.jsx";
import BotonLimpiarPeriodo from "./BotonLimpiarPeriodo.jsx";
import CampoFecha from "./CampoFecha.jsx";
import PanelEstadisticasTickets from "./PanelEstadisticasTickets.jsx";

function PanelPeriodo({
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  buscarPeriodo,
  limpiarPeriodo,
  totalTickets,
  cerrados,
  enProceso,
  pendientes,
  reabiertos,
  tiempoPromedio
}) {
  return (
    <div className="rounded border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <FilterDisclosure
        embedded
        title="Consultar período"
        description="Selecciona un rango de fechas para consultar los tickets asignados durante ese período."
      >
        <div className="flex flex-wrap items-end gap-4">
          <CampoFecha label="Fecha inicial" fecha={fechaInicio} setFecha={setFechaInicio} maxDate={fechaFin} />
          <CampoFecha label="Fecha final" fecha={fechaFin} setFecha={setFechaFin} minDate={fechaInicio} />
          <div className="flex flex-wrap gap-3">
            <BotonBuscarPeriodo onClick={buscarPeriodo} />
            <BotonLimpiarPeriodo onClick={limpiarPeriodo} />
          </div>
        </div>
      </FilterDisclosure>

      <PanelEstadisticasTickets
        totalTickets={totalTickets}
        cerrados={cerrados}
        enProceso={enProceso}
        pendientes={pendientes}
        reabiertos={reabiertos}
        tiempoPromedio={tiempoPromedio}
      />
    </div>
  );
}

export default PanelPeriodo;
