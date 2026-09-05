import { Check } from "lucide-react";
import recomendacionesData from "./data/recomendacionesData.js";

function Recomendaciones() {
  return (
    <div className="azure-panel p-6 sm:p-8">
      <h2 className="mb-6 text-2xl font-normal text-slate-800">
        Recomendaciones
      </h2>

      <ul className="space-y-4">
        {recomendacionesData.map((recomendacion, index) => (
          <li key={index} className="ayuda-tip-item">
            <Check className="h-5 w-5 shrink-0" style={{ color: "#00c9ff" }} strokeWidth={2.5} aria-hidden="true" />

            <span className="text-[16px] text-slate-600">{recomendacion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Recomendaciones;
