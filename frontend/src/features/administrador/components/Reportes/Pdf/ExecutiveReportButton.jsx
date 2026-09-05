import alerta from "../../../../../shared/services/alertService.js";
import reportIcon from "../../../../../assets/informe.png";
import { readSavedReportLayout } from "../Dashboard/useReportDashboard.js";
import { openExecutiveReport } from "./buildExecutiveReport.js";

export default function ExecutiveReportButton({ data, filters, catalogs, disabled = false }) {
  const handleClick = () => {
    const opened = openExecutiveReport(data, filters, readSavedReportLayout(), catalogs);
    if (opened) return;

    alerta.fire({
      icon: "info",
      title: "Habilita las ventanas emergentes",
      text: "El navegador bloqueó la vista previa del Informe Soporte LG. Habilítala para guardar el PDF.",
      confirmButtonColor: "#0076e3"
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="executive-report-icon-button"
      aria-label="Imprimir o guardar Informe Soporte LG en PDF"
      title="Imprimir / PDF · Informe Soporte LG"
    >
      <img src={reportIcon} alt="" aria-hidden="true" />
    </button>
  );
}
