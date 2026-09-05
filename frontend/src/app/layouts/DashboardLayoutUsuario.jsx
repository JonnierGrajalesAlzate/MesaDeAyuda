import UsuarioSidebar from "../navigation/Usuario/UsuarioSidebar.jsx";
import UsuarioTopbar from "../navigation/Usuario/UsuarioTopbar.jsx";
import WorkspaceLayout from "./WorkspaceLayout.jsx";

export default function DashboardLayoutUsuario({ children }) {
  return (
    <WorkspaceLayout
      SidebarComponent={UsuarioSidebar}
      TopbarComponent={UsuarioTopbar}
      shellClassName="workspace-shell--usuario"
    >
      {children}
    </WorkspaceLayout>
  );
}
