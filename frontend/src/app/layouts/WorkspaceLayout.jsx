import { useEffect, useState } from "react";

import Footer from "../../shared/ui/Footer.jsx";

export default function WorkspaceLayout({
  children,
  SidebarComponent,
  TopbarComponent,
  shellClassName = ""
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const closeSidebarOnEscape = event => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", closeSidebarOnEscape);
    return () => document.removeEventListener("keydown", closeSidebarOnEscape);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(currentState => !currentState);

  return (
    <div className={`workspace-shell ${shellClassName}`.trim()}>
      <SidebarComponent open={sidebarOpen} onClose={closeSidebar} />

      <div className="workspace-frame">
        <TopbarComponent onMenuToggle={toggleSidebar} />
        <main className="app-main workspace-main">
          <div className="app-content">
            {children}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
