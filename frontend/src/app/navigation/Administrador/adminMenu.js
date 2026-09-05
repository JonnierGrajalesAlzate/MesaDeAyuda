import baseConocimientoMenu from "../../../assets/BaseConocimientoMenu.png";
import estadisticasMenu from "../../../assets/EstadisticasMenu.png";
import inicioMenu from "../../../assets/InicioMenu.png";
import noticiaMenu from "../../../assets/NoticiaMenu.png";
import usuarioMenu from "../../../assets/usuarioMenu.png";

const ADMIN_MENU = [
  { path: "/administrador", label: "Inicio", iconSrc: inicioMenu, activePaths: ["/administrador/tickets"] },
  { path: "/administrador/noticias", label: "Noticias", iconSrc: noticiaMenu },
  { path: "/reportes", label: "Reportes", iconSrc: estadisticasMenu },
  { path: "/usuarios", label: "Administración", iconSrc: usuarioMenu },
  { path: "/administrador/base-conocimiento", label: "Base de conocimiento", iconSrc: baseConocimientoMenu, activePaths: ["/administrador/base-conocimiento/"] }
];

export default ADMIN_MENU;
