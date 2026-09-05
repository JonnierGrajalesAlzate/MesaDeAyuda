import logo2 from "../../../../assets/logo2.png";

function TecnicoBienvenida({
  usuario
}) {
  return <div className="create-ticket-hero tecnico-hero">
    <img src={logo2} alt="" className="create-ticket-hero-logo" />
    <h1 className="create-ticket-hero-title">Hola, {usuario.nombre}</h1>
    <p className="create-ticket-hero-subtitle">
      Consulta tus indicadores y administra los tickets asignados desde un solo lugar.
    </p>
  </div>;
}
export default TecnicoBienvenida;
