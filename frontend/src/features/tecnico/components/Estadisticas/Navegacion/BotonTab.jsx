function BotonTab({
  activo,
  titulo,
  icono,
  onClick
}) {
  return <button onClick={onClick} className={`
                flex
                items-center
                justify-center
                gap-3
                flex-1
                px-5
                py-3
                rounded-xl
                font-semibold
                transition-all
                duration-200
                ${activo ? "bg-[#0076e3] text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}
            `}>

            <img src={icono} alt={titulo} className="
                    w-9
                    h-9
                    md:w-11
                    md:h-11
                    object-contain
                    flex-shrink-0
                " />

            <span>

                {titulo}

            </span>

        </button>;
}
export default BotonTab;
