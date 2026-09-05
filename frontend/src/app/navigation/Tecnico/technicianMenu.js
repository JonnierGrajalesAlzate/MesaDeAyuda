import baseConocimientoMenu from "../../../assets/BaseConocimientoMenu.png";
import estadisticasMenu from "../../../assets/EstadisticasMenu.png";
import inicioMenu from "../../../assets/InicioMenu.png";
import noticiaMenu from "../../../assets/NoticiaMenu.png";

const TECHNICIAN_MENU = [
  { path: "/tecnico", label: "Inicio", iconSrc: inicioMenu, activePaths: ["/tecnico/tickets"] },
  { path: "/estadisticas", label: "Estadísticas", iconSrc: estadisticasMenu, activePaths: ["/estadisticas/tickets"] },
  { path: "/noticias", label: "Noticias", iconSrc: noticiaMenu },
  { path: "/baseConocimiento", label: "Base de conocimiento", iconSrc: baseConocimientoMenu, activePaths: ["/baseConocimiento/"] }
];

export default TECHNICIAN_MENU;
