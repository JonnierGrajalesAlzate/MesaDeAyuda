import SidebarShell from "../Shared/SidebarShell.jsx";
import TECHNICIAN_MENU from "./technicianMenu.js";

export default function TecnicoSidebar(props) {
  return <SidebarShell {...props} ariaLabel="Navegación del técnico" menuItems={TECHNICIAN_MENU} />;
}
