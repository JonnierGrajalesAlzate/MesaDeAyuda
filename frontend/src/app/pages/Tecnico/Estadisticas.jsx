import { useState } from "react";
import EncabezadoEstadisticas from "../../../features/tecnico/components/Estadisticas/EncabezadoEstadisticas.jsx";
import useFiltrosTickets from "../../../features/tecnico/components/Estadisticas/Filtros/useFiltrosTickets.js";
import TabsEstadisticas from "../../../features/tecnico/components/Estadisticas/Navegacion/TabsEstadisticas.jsx";
import usePeriodoTickets from "../../../features/tecnico/components/Estadisticas/Periodo/hooks/usePeriodoTickets.js";
import VistaPeriodo from "../../../features/tecnico/components/Estadisticas/Views/VistaPeriodo.jsx";
import VistaTickets from "../../../features/tecnico/components/Estadisticas/Views/VistaTickets.jsx";
import useTickets from "../../../features/tecnico/components/Estadisticas/hooks/useTickets.js";
import PageLoader from "../../../shared/ui/loading/PageLoader.jsx";
import DashboardLayoutTecnico from "../../layouts/DashboardLayoutTecnico.jsx";
function Estadisticas() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [vista, setVista] = useState("periodo");
  const {
    tickets,
    loading,
    error
  } = useTickets(usuario.id);
  const period = usePeriodoTickets(tickets);
  const filters = useFiltrosTickets(period.ticketsPeriodo);
  if (loading) {
    return <PageLoader label="Preparando tus estadísticas…" />;
  }
  if (error) {
    return <DashboardLayoutTecnico>
        <EncabezadoEstadisticas />
        <div className="p-8 text-red-600">{error}</div>
      </DashboardLayoutTecnico>;
  }
  return <DashboardLayoutTecnico>
      <EncabezadoEstadisticas />
      <TabsEstadisticas vista={vista} setVista={setVista} />

      {vista === "periodo" ? (
        <VistaPeriodo
          fechaInicio={period.fechaInicio}
          setFechaInicio={period.setFechaInicio}
          fechaFin={period.fechaFin}
          setFechaFin={period.setFechaFin}
          buscarPeriodo={period.buscarPeriodo}
          limpiarPeriodo={period.limpiarPeriodo}
          totalTickets={period.totalTickets}
          cerrados={period.cerrados}
          enProceso={period.enProceso}
          pendientes={period.pendientes}
          reabiertos={period.reabiertos}
          tiempoPromedio={period.tiempoPromedio}
        />
      ) : (
        <VistaTickets
          busqueda={filters.busqueda}
          setBusqueda={filters.setBusqueda}
          estado={filters.estado}
          setEstado={filters.setEstado}
          prioridad={filters.prioridad}
          setPrioridad={filters.setPrioridad}
          categoria={filters.categoria}
          setCategoria={filters.setCategoria}
          usuario={filters.usuario}
          setUsuario={filters.setUsuario}
          estados={filters.estados}
          prioridades={filters.prioridades}
          categorias={filters.categorias}
          usuarios={filters.usuarios}
          limpiarFiltros={filters.limpiarFiltros}
          tickets={filters.ticketsFiltrados}
        />
      )}
    </DashboardLayoutTecnico>;
}
export default Estadisticas;
