function BotonBuscarPeriodo({
  onClick
}) {
  return <button onClick={onClick} className="
                tecnico-period-button
                px-6
                py-3
                bg-[#0076e3]
                hover:bg-[#005dc2]
                text-white
                font-semibold
                transition
                cursor-pointer
            ">

            Buscar

        </button>;
}
export default BotonBuscarPeriodo;
