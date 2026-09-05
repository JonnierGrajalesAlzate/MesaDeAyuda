import logo from "../../assets/logo1.png";

export default function Footer() {
  return <footer className="mt-10 w-full text-[#1e222b]">
    <div className="mx-auto grid max-w-7xl items-center justify-items-center gap-6 px-6 py-8 text-center md:grid-cols-[auto_minmax(0,1fr)] md:justify-items-stretch md:px-8 md:text-left">
      <div>
        <div className="flex items-center justify-center gap-3 md:justify-start">
          <img src={logo} alt="Soporte LG" className="h-12 w-12 shrink-0 object-contain" />
          <div>
            <p className="text-base font-bold tracking-tight text-[#334155]">Soporte LG</p>
            <p className="text-xs font-semibold text-[#334155]">Londoño Gómez</p>
          </div>
        </div>
      </div>

      <p className="text-sm font-semibold text-[#334155] md:justify-self-end md:text-right">
        © Todos los derechos reservados.
      </p>
    </div>
  </footer>;
}
