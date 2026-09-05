import TecnicoSidebar from "../navigation/Tecnico/TecnicoSidebar.jsx";
import TecnicoTopbar from "../navigation/Tecnico/TecnicoTopbar.jsx";
import WorkspaceLayout from "./WorkspaceLayout.jsx";

export default function DashboardLayoutTecnico({ children }) {
  return (
    <WorkspaceLayout
      SidebarComponent={TecnicoSidebar}
      TopbarComponent={TecnicoTopbar}
    >
      {children}
    </WorkspaceLayout>
  );
}
