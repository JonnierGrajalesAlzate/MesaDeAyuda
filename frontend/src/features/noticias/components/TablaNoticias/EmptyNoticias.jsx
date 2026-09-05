import sinBusquedaIcon from "../../../../assets/SinBusqueda.png";

function EmptyNoticias() {
  return <tr>

            <td colSpan={6} className="py-16 text-center text-slate-500">
                <div className="flex flex-col items-center gap-2">
                    <img src={sinBusquedaIcon} alt="" aria-hidden="true" className="h-20 w-20 object-contain" />
                    No existen noticias registradas.
                </div>
            </td>

        </tr>;
}
export default EmptyNoticias;
