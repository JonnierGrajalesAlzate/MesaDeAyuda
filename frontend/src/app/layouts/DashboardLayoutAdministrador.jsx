import AdministradorSidebar from "../navigation/Administrador/AdministradorSidebar.jsx";
import AdministradorTopbar from "../navigation/Administrador/AdministradorTopbar.jsx";
import WorkspaceLayout from "./WorkspaceLayout.jsx";

export default function DashboardLayoutAdministrador({ children }) {
  return (
    <WorkspaceLayout
      SidebarComponent={AdministradorSidebar}
      TopbarComponent={AdministradorTopbar}
    >
      {children}
    </WorkspaceLayout>
  );
}
