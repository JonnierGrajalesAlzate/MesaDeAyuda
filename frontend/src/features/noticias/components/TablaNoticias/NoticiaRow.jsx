import AccionesNoticias from "./AccionesNoticias.jsx";
import EtiquetaBadge from "./EtiquetaBadge.jsx";
import EstadoNoticiaBadge from "./EstadoNoticiaBadge.jsx";
function NoticiaRow({
  noticia,
  estados,
  usuarioActual,
  onVer,
  onEditar,
  onEliminar,
  onCambiarEstado,
  onEliminarDefinitivamente
}) {
  const fecha = new Date(noticia.fecha_creacion);
  const dias = (new Date() - fecha) / (1000 * 60 * 60 * 24);
  return <tr data-noticia-id={noticia.id} tabIndex={-1} className="group
                border-b
                border-slate-100
                hover:bg-slate-50
                focus:bg-blue-50
                focus:outline-none
                focus:ring-2
                focus:ring-inset
                focus:ring-[#0076e3]
                transition-all
            ">
 

            <td className="min-w-[280px] px-4 py-4 sm:px-6 sm:py-5">

                <h3 className="
                        font-bold
                        text-slate-800
                    ">

                    {noticia.titulo}

                </h3>

                <p className="
                        text-sm
                        text-slate-500
                        mt-1
                        line-clamp-2
                    ">

                    {noticia.descripcion}

                </p>

            </td>

            {/* Etiqueta */}

            <td className="min-w-[150px] px-4 py-4 sm:px-6 sm:py-5">

                <EtiquetaBadge etiqueta={noticia.etiqueta} color={noticia.color} esNueva={dias <= 1} />

            </td>

            {/* Estado */}

            <td className="min-w-[130px] px-4 py-4 text-center sm:px-6 sm:py-5">

                <EstadoNoticiaBadge estado={noticia.estado} color={noticia.estado_color} />

            </td>

            {/* Fecha */}

            <td className="
                    min-w-[120px]
                    px-4
                    py-4
                    sm:px-6
                    sm:py-5
                    text-center
                    text-slate-600
                    whitespace-nowrap
                ">

                {fecha.toLocaleDateString()}

            </td>

            {/* Autor */}

            <td className="
                    min-w-[160px]
                    px-4
                    py-4
                    sm:px-6
                    sm:py-5
                    text-center
                ">

                <div className="
                        font-medium
                        text-slate-800
                    ">

                    {noticia.nombre} {noticia.apellido}

                </div>

            </td>

            {/* Acciones */}

            <td className="min-w-[130px] px-4 py-4 sm:px-6 sm:py-5">

                <AccionesNoticias noticia={noticia} estados={estados} usuarioActual={usuarioActual} onVer={onVer} onEditar={onEditar} onEliminar={onEliminar} onCambiarEstado={onCambiarEstado} onEliminarDefinitivamente={onEliminarDefinitivamente} />

            </td>

        </tr>;
}
export default NoticiaRow;
