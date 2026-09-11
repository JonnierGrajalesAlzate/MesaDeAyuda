import { useEffect, useState } from "react";
import ReportDashboard from "../../../../features/administrador/components/Reportes/Dashboard/ReportDashboard.jsx";
import ReportFilters from "../../../../features/administrador/components/Reportes/ReportFilters.jsx";
import ExecutiveReportButton from "../../../../features/administrador/components/Reportes/Pdf/ExecutiveReportButton.jsx";
import useRealtimeRefresh from "../../../../shared/hooks/useRealtimeRefresh.js";
import DashboardLayout from "../../../layouts/DashboardLayoutAdministrador.jsx";
import { obtenerReportes } from "../../../../features/administrador/services/Reportes/reportesService.js";
const EMPTY_FILTERS = {
  inicio: "",
  fin: "",
  estado: [],
  tecnico: [],
  categoria: [],
  prioridad: [],
  area: []
};
function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
const EMPTY_REPORT = {
  kpis: {},
  estados: [],
  tecnicos: [],
  areas: [],
  categorias: [],
  prioridades: [],
  tendencia: [],
  prediccion: null,
  recientes: []
};
export default function Reportes() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [data, setData] = useState(EMPTY_REPORT);
  const [filterCatalogs, setFilterCatalogs] = useState(EMPTY_REPORT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async (params = filters) => {
    setLoading(true);
    setError("");
    try {
      setData({
        ...EMPTY_REPORT,
        ...(await obtenerReportes(params))
      });
    } catch {
      setError("No se pudo generar el informe. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    obtenerReportes(EMPTY_FILTERS).then(report => {
      if (active) {
        const completeReport = { ...EMPTY_REPORT, ...report };
        setData(completeReport);
        setFilterCatalogs(completeReport);
      }
    }).catch(() => {
      if (active) {
        setError("No se pudo generar el informe. Intenta nuevamente.");
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  useRealtimeRefresh("tickets", () => load());
  const changeFilter = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    if (key === "inicio" && value && !filters.fin) {
      nextFilters.fin = todayISO();
    }
    setFilters(nextFilters);
    load(nextFilters);
  };
  return <DashboardLayout>
      <div className="report-page w-full space-y-5">
        <header className="report-page-header">
          <div className="report-page-header-main">
            <div className="report-page-heading">
              <span className="report-page-kicker">Informe</span>
              <p>Consulta el rendimiento de la mesa de ayuda y convierte los datos en decisiones claras.</p>
            </div>

            <div className="report-page-actions">
              <ExecutiveReportButton data={data} filters={filters} catalogs={filterCatalogs} disabled={loading} />
            </div>
          </div>

        </header>

        <ReportFilters filters={filters} data={filterCatalogs} onChange={changeFilter} />

        {error && <p className="rounded-none bg-red-50 p-4 text-red-700">{error}</p>}

        {loading
          ? <p className="p-10 text-center text-slate-500">Generando informe…</p>
          : <ReportDashboard data={data} />}
      </div>
    </DashboardLayout>;
}
