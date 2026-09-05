import { useCallback, useEffect, useState } from "react";
import OperationsOverview from "../../../features/administrador/components/Dashboard/OperationsOverview.jsx";
import useRealtimeRefresh from "../../../shared/hooks/useRealtimeRefresh.js";
import DashboardLayout from "../../layouts/DashboardLayoutAdministrador.jsx";
import { obtenerResumenAdministrador } from "../../../features/administrador/services/resumenAdministradorService.js";
import logo2 from "../../../assets/logo2.png";

const EMPTY_SUMMARY = { estados: [], tecnicos: [] };

export default function Administrador() {
  const authenticatedUser = JSON.parse(localStorage.getItem("usuario") || "{}");
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setSummary(await obtenerResumenAdministrador());
      setError("");
    } catch {
      setError("No se pudo cargar la información operativa.");
    }
  }, []);

  useEffect(() => {
    let active = true;

    obtenerResumenAdministrador()
      .then(summaryData => {
        if (!active) return;
        setSummary(summaryData);
        setError("");
      })
      .catch(() => {
        if (active) setError("No se pudo cargar la información operativa.");
      });

    return () => {
      active = false;
    };
  }, []);

  useRealtimeRefresh(["tickets", "solicitudes-reasignacion"], load);

  return (
    <DashboardLayout>
      <main className="admin-dashboard-page w-full space-y-5" aria-label="Operación de soporte">
        <div className="create-ticket-hero">
          <img src={logo2} alt="" className="create-ticket-hero-logo" />
          <h1 className="create-ticket-hero-title">Hola, {authenticatedUser.nombre || "administrador"}</h1>
          <p className="create-ticket-hero-subtitle">Supervisa la operación de soporte, tus tickets y la carga del equipo técnico.</p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        <OperationsOverview
          technicians={summary.tecnicos}
          administratorId={authenticatedUser.id}
          refreshKey={summary}
        />
      </main>
    </DashboardLayout>
  );
}
