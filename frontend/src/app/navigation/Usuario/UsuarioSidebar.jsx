import SidebarShell from "../Shared/SidebarShell.jsx";
import USER_MENU from "./userMenu.js";

export default function UsuarioSidebar(props) {
  return <SidebarShell {...props} ariaLabel="Navegación del usuario" menuItems={USER_MENU} />;
}
