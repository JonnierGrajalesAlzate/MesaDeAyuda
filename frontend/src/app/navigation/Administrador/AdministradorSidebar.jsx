import SidebarShell from "../Shared/SidebarShell.jsx";
import ADMIN_MENU from "./adminMenu.js";

export default function AdministradorSidebar(props) {
  return <SidebarShell {...props} ariaLabel="Navegación del administrador" menuItems={ADMIN_MENU} />;
}
