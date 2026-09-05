import { Fragment } from "react";
import cicloVidaData from "./data/cicloVidaData.js";

function CicloVida() {
  return (
    <section className="azure-panel p-6 sm:p-8">
      <h2 className="mb-8 text-2xl font-normal text-slate-800">
        Estados
      </h2>

      <div className="flex flex-col items-center justify-between gap-7 lg:flex-row lg:gap-5">
        {cicloVidaData.map((estado, index) => (
          <Fragment key={estado.titulo}>
            <article className="w-full flex-1 text-center">
              <span className="ayuda-cycle-icon">
                <img
                  src={estado.icono}
                  alt={estado.titulo}
                  className="h-11 w-11 object-contain"
                />
              </span>

              <h3 className="mt-3 font-semibold text-slate-800">
                {estado.titulo}
              </h3>

              <p className="mx-auto mt-2 max-w-56 text-sm text-slate-500">
                {estado.descripcion}
              </p>
            </article>

            {index < cicloVidaData.length - 1 && (
              <div
                aria-hidden="true"
                className="ayuda-cycle-connector hidden h-0.75 flex-1 self-start lg:mt-10.5 lg:block"
              />
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

export default CicloVida;
