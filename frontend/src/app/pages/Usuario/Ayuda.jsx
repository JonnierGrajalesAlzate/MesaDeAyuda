import DashboardLayout from "../../layouts/DashboardLayoutUsuario.jsx";
import EncabezadoAyuda from "../../../features/usuario/components/Ayuda/EncabezadoAyuda.jsx";
import Prioridades from "../../../features/usuario/components/Ayuda/Prioridades.jsx";
import Recomendaciones from "../../../features/usuario/components/Ayuda/Recomendaciones.jsx";
import CicloVida from "../../../features/usuario/components/Ayuda/CicloVida.jsx";
import Servicios from "../../../features/usuario/components/Ayuda/Servicios.jsx";
function Ayuda() {
  return <DashboardLayout>

            <div className="ayuda-page space-y-8">

                <EncabezadoAyuda />

                <div className="
                        grid
                        lg:grid-cols-2
                        gap-6
                    ">

                    <Prioridades />

                    <Recomendaciones />

                </div>

                <CicloVida />

                <Servicios />

            </div>

        </DashboardLayout>;
}
export default Ayuda;
