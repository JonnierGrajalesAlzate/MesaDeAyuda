import { useEffect, useState } from "react";
import { obtenerPrioridades } from "../../../tickets/services/catalogosService.js";
import prioridadesData from "./data/prioridadesData.js";

function Prioridades() {
  const [colores, setColores] = useState({});

  useEffect(() => {
    let active = true;
    obtenerPrioridades()
      .then(data => {
        if (!active) return;
        const mapa = {};
        (data || []).forEach(prioridad => {
          mapa[String(prioridad.nombre || "").trim().toLowerCase()] = prioridad.color;
        });
        setColores(mapa);
      })
      .catch(error => console.error("No se pudieron cargar las prioridades", error));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="azure-panel p-6 sm:p-8">
      <h2 className="mb-6 text-2xl font-normal text-slate-800">
        Niveles de Prioridad
      </h2>

      <div className="space-y-3">
        {prioridadesData.map((prioridad) => (
          <article key={prioridad.titulo} className="ayuda-priority-card">
            <span
              className="ayuda-priority-dot"
              aria-hidden="true"
              style={{ backgroundColor: colores[prioridad.titulo.toLowerCase()] || "#cbd5e1" }}
            />

            <div className="min-w-0">
              <h3 className="ayuda-priority-title">
                {prioridad.titulo}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-base">
                {prioridad.descripcion}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Prioridades;
