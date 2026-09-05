import TablaHeader from "./TablaHeader.jsx";
import TablaBody from "./TablaBody.jsx";
import ResponsiveTable from "../../../../shared/ui/ResponsiveTable.jsx";
function TablaNoticias({
  noticias,
  estados,
  usuarioActual,
  onVer,
  onEditar,
  onEliminar,
  onCambiarEstado,
  onEliminarDefinitivamente
}) {
  return <section className="
                min-w-0
                max-w-full
                bg-white
                border
                border-slate-200
                shadow-sm
                overflow-hidden
                rounded
            ">

            <ResponsiveTable
              minWidth={1010}
              ariaLabel="Tabla de noticias con desplazamiento horizontal"
              caption="Listado de noticias, etiquetas, estados, fechas, autores y acciones."
            >

                <TablaHeader />

                <TablaBody noticias={noticias} estados={estados} usuarioActual={usuarioActual} onVer={onVer} onEditar={onEditar} onEliminar={onEliminar} onCambiarEstado={onCambiarEstado} onEliminarDefinitivamente={onEliminarDefinitivamente} />

            </ResponsiveTable>

        </section>;
}
export default TablaNoticias;
