import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../shared/services/authService.js";
import logo from "../../assets/logo2.png";
import PageLoader from "../../shared/ui/loading/PageLoader.jsx";
import useMinDuration from "../../shared/hooks/useMinDuration.js";

// Tokens de marca (ver src/index.css :root) — se repiten aquí en hexadecimal
// porque este componente usa clases de Tailwind, no custom properties.
const BRAND = {
  ink: "#1e222b",
  blue: "#0076e3",
  blueDark: "#005aaf",
  sky: "#00c9ff",
  mint: "#00d4a1",
  canvas: "#f4f7fa",
  border: "#dce4ec",
  muted: "#667587",
};

// Cada onda se construye como UNA sola pieza (tile) perfectamente periódica y
// se dibuja dos veces, una junto a otra, dentro de un SVG del doble de ancho.
// Animar ese SVG completo con translateX(-50%) desplaza exactamente un tile:
// la segunda copia queda donde empezó la primera → el bucle nunca se corta.
function buildSoftTile() {
  const period = 150, amplitude = 80, y = 210, periods = 8; // 8 * 150 = 1200
  const half = period / 2;
  let d = `M0 ${y} Q${half} ${y - amplitude} ${period} ${y}`;
  for (let i = 1; i < periods; i++) d += ` T${period * (i + 1)} ${y}`;
  return d;
}
function buildMidTile() {
  const period = 120, amplitude = 90, periods = 10; // 10 * 120 = 1200
  const half = period / 2;
  let d = `M0 170 q${half} ${-amplitude} ${period} 0`;
  for (let i = 1; i < periods; i++) d += ` t${period} 0`;
  return d;
}
function buildEcgTile() {
  // Diseño original (latido con varios segmentos), reescalado al mismo
  // tamaño (alto y largo) que las ondas soft/mid: período ~135, amplitud ~85.
  const unit = "l95 0 l19 -53 l22 85 l23 -78 l26 46"; // dx=185, dy neto=0
  let d = "M0 240";
  for (let i = 0; i < 6; i++) d += ` ${unit}`; // 6 * 185 = 1110
  d += " l90 0"; // pausa final, completa el tile a 1200
  return d;
}
const TILE_WIDTH = 1200;
const WAVE_SOFT = buildSoftTile();
const WAVE_MID = buildMidTile();
const WAVE_ECG = buildEcgTile();

function PulseBackground() {
  const layers = [
    { d: WAVE_SOFT, duration: "16s", className: "stroke-white/12 [stroke-width:2]" },
    { d: WAVE_MID, duration: "11s", className: "stroke-[#7cc0ff]/25 [stroke-width:2]" },
    {
      d: WAVE_ECG,
      duration: "7s",
      className: "stroke-[#7cf0c0]/90 [stroke-width:2.6] [filter:drop-shadow(0_0_10px_rgba(124,240,192,.6))]",
    },
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] overflow-hidden opacity-90">
      {layers.map(layer => (
        <svg
          key={layer.duration}
          className="absolute inset-0 h-full w-[200%] overflow-visible motion-reduce:animate-none"
          style={{ animation: `lgscan ${layer.duration} linear infinite` }}
          viewBox={`0 0 ${TILE_WIDTH * 2} 300`}
          preserveAspectRatio="none"
        >
          <path d={layer.d} fill="none" strokeLinecap="round" className={layer.className} />
          <path d={layer.d} fill="none" strokeLinecap="round" className={layer.className} transform={`translate(${TILE_WIDTH} 0)`} />
        </svg>
      ))}
    </div>
  );
}

const CAPACIDADES = [
  "Tickets con seguimiento en tiempo real",
  "Base de conocimiento del equipo técnico",
  "Reportes y métricas de gestión",
];

function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function IconLock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3.5" y="11" width="17" height="10.5" rx="2.5" />
      <path d="M7 11V7.3a5 5 0 0 1 10 0V11" />
    </svg>
  );
}

function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.5 17.6A10.8 10.8 0 0 1 12 19.5c-6.5 0-10.5-7.5-10.5-7.5a20.7 20.7 0 0 1 4.7-5.6" />
      <path d="M9.6 4.7A10.8 10.8 0 0 1 12 4.5c6.5 0 10.5 7.5 10.5 7.5a20.4 20.4 0 0 1-2 2.95" />
      <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

function IconAlert(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5v5.5" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const showLoader = useMinDuration(loading, 1000);

  const handleLogin = async event => {
    event.preventDefault();
    setError("");
    try {
      setLoading(true);
      const data = await login(correo, password);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      if (data.usuario.rol === "Administrador") navigate("/admin");
      else if (data.usuario.rol === "Tecnico") navigate("/tecnico");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "No pudimos validar tus datos de acceso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]" style={{ background: BRAND.canvas }}>
      {showLoader && <PageLoader label={["Validando", "Configurando tu espacio de trabajo"]} />}
      {/* Panel de marca — narrativa del producto, solo en pantallas grandes */}
      <section
        className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14"
        style={{
          background: `radial-gradient(circle at 84% 16%, rgb(0 201 255 / 0.32), transparent 24rem), radial-gradient(circle at 14% 90%, rgb(0 212 161 / 0.2), transparent 22rem), linear-gradient(140deg, ${BRAND.ink} 0%, #123c68 50%, ${BRAND.blue} 100%)`,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255 / 0.16) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.16) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
            maskImage: "linear-gradient(135deg, #000, transparent 78%)",
          }}
        />

        <PulseBackground />

        <div className="relative z-10 flex items-center gap-3">
          <img src={logo} alt="" aria-hidden="true" className="h-11 w-11 object-contain" />
          <div>
            <strong className="block text-[15px] tracking-[-.2px]">Soporte LG</strong>
            <span className="mt-0.5 block text-[11px] text-white/70">Mesa de ayuda</span>
          </div>
        </div>

        <div className="relative z-10 max-w-[30rem]">
          <h1 className="text-[clamp(2rem,3.4vw,3rem)] font-bold leading-[1.08] tracking-[-.035em]">
            Toda tu mesa de ayuda, en un solo lugar.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/78">
            Registra incidentes, dales seguimiento en tiempo real y consulta la base de conocimiento del equipo técnico.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {CAPACIDADES.map(item => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] text-white/85">
                <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-[#7cf0c0]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden="true" className="relative z-10 h-px" />
      </section>

      {/* Panel de acceso — funcional, en el mismo lenguaje visual del resto de la app */}
      <section
        className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#0076e3_0%,#005aaf_100%)] p-6 sm:p-10 lg:bg-none"
      >
        <div className="w-full max-w-[420px]">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <img src={logo} alt="Londoño Gómez" className="h-10 w-10 object-contain" />
            <div>
              <strong className="block text-[15px] text-white">Soporte LG</strong>
              <span className="mt-0.5 block text-[11px] text-white/70">Mesa de ayuda</span>
            </div>
          </div>

          <div
            className="rounded-xl bg-white p-7 shadow-[0_18px_54px_rgb(30_34_43_/_0.1)] sm:p-9"
            style={{ border: `1px solid ${BRAND.border}`, borderTop: `3px solid ${BRAND.blue}` }}
          >
            <h2 className="text-[26px] font-bold tracking-[-.02em]" style={{ color: BRAND.ink }}>Inicia sesión</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: BRAND.muted }}>
              Ingresa con tu cuenta corporativa para continuar.
            </p>

            <form onSubmit={handleLogin} noValidate className="mt-6 grid gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="correo" className="text-[12px] font-bold" style={{ color: "#435164" }}>Correo electrónico</label>
                <div className="relative">
                  <IconMail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: BRAND.muted }} />
                  <input
                    id="correo"
                    type="email"
                    value={correo}
                    onChange={event => setCorreo(event.target.value)}
                    placeholder="Ingresa tu correo"
                    autoComplete="username"
                    required
                    autoFocus
                    className="h-12 w-full rounded-[9px] border pl-11 pr-3.5 text-[14px] outline-none transition focus:ring-4"
                    style={{ borderColor: BRAND.border, color: BRAND.ink }}
                    onFocus={event => { event.target.style.borderColor = BRAND.blue; event.target.style.boxShadow = "0 0 0 3px rgb(0 118 227 / 0.12)"; }}
                    onBlur={event => { event.target.style.borderColor = BRAND.border; event.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="password" className="text-[12px] font-bold" style={{ color: "#435164" }}>Contraseña</label>
                <div className="relative">
                  <IconLock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: BRAND.muted }} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    required
                    className="h-12 w-full rounded-[9px] border pl-11 pr-11 text-[14px] outline-none transition focus:ring-4"
                    style={{ borderColor: BRAND.border, color: BRAND.ink }}
                    onFocus={event => { event.target.style.borderColor = BRAND.blue; event.target.style.boxShadow = "0 0 0 3px rgb(0 118 227 / 0.12)"; }}
                    onBlur={event => { event.target.style.borderColor = BRAND.border; event.target.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(value => !value)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md transition hover:bg-slate-100"
                    style={{ color: BRAND.muted }}
                  >
                    {showPassword ? <IconEyeOff className="h-[18px] w-[18px]" /> : <IconEye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2.5 rounded-[9px] border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] leading-snug text-red-700">
                  <IconAlert aria-hidden="true" className="mt-px h-4 w-4 flex-none" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-semibold text-white transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
                style={{ background: BRAND.blue, boxShadow: "0 7px 16px rgb(0 118 227 / 0.22)" }}
                onMouseEnter={event => { if (!loading) event.currentTarget.style.background = BRAND.blueDark; }}
                onMouseLeave={event => { event.currentTarget.style.background = BRAND.blue; }}
              >
                {loading ? (
                  <>
                    <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    Validando…
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
