function BotonLimpiarPeriodo({
  onClick
}) {
  return <button type="button" onClick={onClick} className="
                tecnico-period-button
                px-6
                py-3
                border
                border-slate-300
                bg-white
                hover:bg-slate-100
                text-slate-700
                font-semibold
                transition
                cursor-pointer
            ">

            Limpiar

        </button>;
}
export default BotonLimpiarPeriodo;
