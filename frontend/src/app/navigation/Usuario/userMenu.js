import ayudaMenu from "../../../assets/CentroAyuda.png";
import crearTicketMenu from "../../../assets/CrearTicket.png";
import inicioMenu from "../../../assets/InicioMenu.png";
import ticketsMenu from "../../../assets/TicketsMenu.png";

const USER_MENU = [
  { path: "/dashboard", label: "Inicio", iconSrc: inicioMenu },
  { path: "/crear-ticket", label: "Crear ticket", iconSrc: crearTicketMenu },
  { path: "/tickets", label: "Mis tickets", iconSrc: ticketsMenu, activePaths: ["/tickets/"] },
  { path: "/ayuda", label: "Centro de ayuda", iconSrc: ayudaMenu }
];

export default USER_MENU;
