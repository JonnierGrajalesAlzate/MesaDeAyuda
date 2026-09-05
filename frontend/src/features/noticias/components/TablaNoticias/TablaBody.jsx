import EmptyNoticias from "./EmptyNoticias.jsx";
import NoticiaRow from "./NoticiaRow.jsx";
function TablaBody({
  noticias,
  estados,
  usuarioActual,
  onVer,
  onEditar,
  onEliminar,
  onCambiarEstado,
  onEliminarDefinitivamente
}) {
  return <tbody>

            {noticias.length > 0 ? noticias.map(noticia => <NoticiaRow key={noticia.id} noticia={noticia} estados={estados} usuarioActual={usuarioActual} onVer={onVer} onEditar={onEditar} onEliminar={onEliminar} onCambiarEstado={onCambiarEstado} onEliminarDefinitivamente={onEliminarDefinitivamente} />) : <EmptyNoticias />}

        </tbody>;
}
export default TablaBody;
