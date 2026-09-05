import { useState } from "react";
import useServicios from "./hooks/useServicios.js";

function Servicios() {
  const { servicios, cargando } = useServicios();
  const [servicioExpandido, setServicioExpandido] = useState(null);

  const alternarServicio = (index) => {
    setServicioExpandido((actual) => (actual === index ? null : index));
  };

  return (
    <section className="azure-panel mb-6 p-6 sm:p-8">
      <div className="mb-6">
        <span className="azure-page-eyebrow">Soporte disponible</span>

        <h2 className="mt-1 text-2xl font-normal text-slate-800">Servicios</h2>

        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Explora una categoría para conocer los tipos de solicitudes que
          puedes registrar.
        </p>
      </div>

      {cargando && <p className="text-sm text-slate-400">Cargando categorías…</p>}

      {!cargando && servicios.length === 0 && (
        <p className="text-sm text-slate-400">No hay categorías disponibles.</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {!cargando && servicios.map((servicio, index) => {
          const estaVisible = servicioExpandido === index;
          const descripcionId = `servicio-descripcion-${index}`;

          return (
            <article
              key={servicio.titulo}
              className={`overflow-hidden rounded border bg-white transition-all duration-200 ${
                estaVisible
                  ? "border-[#0076e3] shadow-[0_8px_24px_rgba(0,118,227,0.12)]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <button
                type="button"
                className="flex w-full items-center gap-3 p-4 text-left"
                aria-expanded={estaVisible}
                aria-controls={descripcionId}
                onClick={() => alternarServicio(index)}
              >
                <span
                  aria-hidden="true"
                  className={`h-8 w-1 shrink-0 rounded-full transition-colors ${
                    estaVisible ? "bg-[#00d4a1]" : "bg-[#0076e3]"
                  }`}
                />

                <span className="min-w-0 flex-1 font-semibold text-slate-800">
                  {servicio.titulo}
                </span>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                    estaVisible ? "rotate-180 text-[#0076e3]" : ""
                  }`}
                >
                  <path
                    d="m5 7.5 5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div
                id={descripcionId}
                className={`grid transition-[grid-template-rows,opacity] duration-200 ${
                  estaVisible
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="border-t border-slate-100 px-4 py-3 pl-8 text-sm leading-6 text-slate-600">
                    {servicio.descripcion}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!cargando && servicios.length > 0 && (
        <p className="mt-5 text-xs text-slate-400">
          Haz clic en una categoría para ver sus detalles.
        </p>
      )}
    </section>
  );
}

export default Servicios;
