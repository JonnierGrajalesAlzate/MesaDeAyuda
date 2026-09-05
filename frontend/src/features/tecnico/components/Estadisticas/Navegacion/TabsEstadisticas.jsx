import BotonTab from "./BotonTab.jsx";

import estadisticas from "../../../../../assets/grafica.png";
import estadisticasSeleccionada from "../../../../../assets/GraficaSeleccionada.png";

import tickets from "../../../../../assets/ticketsVista.png";
import ticketsSeleccionado from "../../../../../assets/ticketsSeleccionado.png";

function TabsEstadisticas({
    vista,
    setVista
}) {

    return (

        <div
            className="
                bg-white
                border
                border-slate-200
                shadow-sm
                p-2
                mb-8
                rounded
            "
        >

            <div
                className="
                    flex
                    gap-2
                "
            >

                <BotonTab
                    activo={vista === "periodo"}
                    titulo="Estadísticas por período"
                    icono={vista === "periodo" ? estadisticasSeleccionada : estadisticas}
                    onClick={() => setVista("periodo")}
                />

                <BotonTab
                    activo={vista === "tickets"}
                    titulo="Tickets"
                    icono={vista === "tickets" ? ticketsSeleccionado : tickets}
                    onClick={() => setVista("tickets")}
                />

            </div>

        </div>

    );

}

export default TabsEstadisticas;
