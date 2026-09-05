import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import PageLoader from "../../shared/ui/loading/PageLoader.jsx";
import {
  getHomePathForRole,
  SESSION_STORAGE_KEY,
  USER_ROLES
} from "../../shared/constants/auth.js";
import AuthGuard from "./AuthGuard.jsx";

const Login = lazy(() => import("../pages/Login.jsx"));
const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));
const Tickets = lazy(() => import("../pages/Usuario/Tickets.jsx"));
const UsuarioTicketDetallePage = lazy(() => import("../pages/Usuario/TicketDetallePage.jsx"));
const CrearTickets = lazy(() => import("../pages/CrearTickets.jsx"));
const Ayuda = lazy(() => import("../pages/Usuario/Ayuda.jsx"));
const Tecnico = lazy(() => import("../pages/Tecnico/Tecnico.jsx"));
const Noticias = lazy(() => import("../pages/Tecnico/Noticias.jsx"));
const NoticiaDetalle = lazy(() => import("../pages/Tecnico/NoticiaDetalle.jsx"));
const Estadisticas = lazy(() => import("../pages/Tecnico/Estadisticas.jsx"));
const TecnicoTicketDetallePage = lazy(() => import("../pages/Tecnico/TicketDetallePage.jsx"));
const TicketReasignarPage = lazy(() => import("../pages/Tecnico/TicketReasignarPage.jsx"));
const TicketSolicitudReasignacionPage = lazy(() => import("../pages/Tecnico/TicketSolicitudReasignacionPage.jsx"));
const BaseConocimiento = lazy(() => import("../pages/Tecnico/BaseConocimiento.jsx"));
const BaseConocimientoDetallePage = lazy(() => import("../pages/Tecnico/BaseConocimientoDetallePage.jsx"));
const CrearGuia = lazy(() => import("../pages/Tecnico/CrearGuia.jsx"));
const EditarGuia = lazy(() => import("../pages/Tecnico/EditarGuia.jsx"));
const Administrador = lazy(() => import("../pages/Administrador/Administrador.jsx"));
const AdminTicketDetallePage = lazy(() => import("../pages/Administrador/TicketDetallePage.jsx"));
const Usuarios = lazy(() => import("../pages/Administrador/CRUD/Usuarios.jsx"));
const UsuarioDetalle = lazy(() => import("../pages/Administrador/CRUD/UsuarioDetalle.jsx"));
const AreaDetalle = lazy(() => import("../pages/Administrador/CRUD/AreaDetalle.jsx"));
const CategoriaDetalle = lazy(() => import("../pages/Administrador/CRUD/CategoriaDetalle.jsx"));
const Reportes = lazy(() => import("../pages/Administrador/Reportes/Reportes.jsx"));

const USER_ROUTES = [USER_ROLES.USER];
const TECHNICIAN_ROUTES = [USER_ROLES.TECHNICIAN];
const ADMIN_ROUTES = [USER_ROLES.ADMINISTRATOR];

function ProtectedRoute({ children, roles }) {
  return <AuthGuard roles={roles}>{children}</AuthGuard>;
}

/**
 * Redirige una ruta inexistente al inicio correspondiente al rol almacenado.
 * AuthGuard valida antes la sesión real, por lo que localStorage solo se usa
 * aquí como una ayuda de navegación y nunca como autorización definitiva.
 */
function RoleHomeRedirect() {
  const storedUser = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "{}");
  return <Navigate to={getHomePathForRole(storedUser.rol)} replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader label={["Cargando", "Configurando tu espacio de trabajo"]} />}>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedRoute roles={USER_ROUTES}><Dashboard /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute roles={USER_ROUTES}><Tickets /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute roles={USER_ROUTES}><UsuarioTicketDetallePage /></ProtectedRoute>} />
          <Route path="/crear-ticket" element={<ProtectedRoute roles={USER_ROUTES}><CrearTickets /></ProtectedRoute>} />
          <Route path="/ayuda" element={<ProtectedRoute roles={USER_ROUTES}><Ayuda /></ProtectedRoute>} />

          <Route path="/tecnico" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><Tecnico /></ProtectedRoute>} />
          <Route path="/tecnico/tickets/:id" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><TecnicoTicketDetallePage /></ProtectedRoute>} />
          <Route path="/tecnico/tickets/:id/reasignar" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><TicketReasignarPage /></ProtectedRoute>} />
          <Route path="/tecnico/tickets/:id/solicitud-reasignacion" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><TicketSolicitudReasignacionPage /></ProtectedRoute>} />
          <Route path="/noticias" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><Noticias /></ProtectedRoute>} />
          <Route path="/noticias/nueva" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><NoticiaDetalle modo="crear" /></ProtectedRoute>} />
          <Route path="/noticias/:id" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><NoticiaDetalle modo="ver" /></ProtectedRoute>} />
          <Route path="/noticias/:id/editar" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><NoticiaDetalle modo="editar" /></ProtectedRoute>} />
          <Route path="/estadisticas" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><Estadisticas /></ProtectedRoute>} />
          <Route path="/estadisticas/tickets/:id" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><TecnicoTicketDetallePage /></ProtectedRoute>} />
          <Route path="/baseConocimiento" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><BaseConocimiento /></ProtectedRoute>} />
          <Route path="/baseConocimiento/:id" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><BaseConocimientoDetallePage /></ProtectedRoute>} />
          <Route path="/baseConocimiento/crear-guia" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><CrearGuia /></ProtectedRoute>} />
          <Route path="/baseConocimiento/editar-guia/:id" element={<ProtectedRoute roles={TECHNICIAN_ROUTES}><EditarGuia /></ProtectedRoute>} />

          <Route path="/administrador" element={<ProtectedRoute roles={ADMIN_ROUTES}><Administrador /></ProtectedRoute>} />
          <Route path="/administrador/tickets/:id" element={<ProtectedRoute roles={ADMIN_ROUTES}><AdminTicketDetallePage /></ProtectedRoute>} />
          <Route path="/administrador/tickets/:id/reasignar" element={<ProtectedRoute roles={ADMIN_ROUTES}><TicketReasignarPage layoutRole="administrador" /></ProtectedRoute>} />
          <Route path="/administrador/tickets/:id/solicitud-reasignacion" element={<ProtectedRoute roles={ADMIN_ROUTES}><TicketSolicitudReasignacionPage layoutRole="administrador" /></ProtectedRoute>} />
          <Route path="/administrador/noticias" element={<ProtectedRoute roles={ADMIN_ROUTES}><Noticias layoutRole="administrador" /></ProtectedRoute>} />
          <Route path="/administrador/noticias/nueva" element={<ProtectedRoute roles={ADMIN_ROUTES}><NoticiaDetalle modo="crear" layoutRole="administrador" /></ProtectedRoute>} />
          <Route path="/administrador/noticias/:id" element={<ProtectedRoute roles={ADMIN_ROUTES}><NoticiaDetalle modo="ver" layoutRole="administrador" /></ProtectedRoute>} />
          <Route path="/administrador/noticias/:id/editar" element={<ProtectedRoute roles={ADMIN_ROUTES}><NoticiaDetalle modo="editar" layoutRole="administrador" /></ProtectedRoute>} />
          <Route path="/administrador/base-conocimiento" element={<ProtectedRoute roles={ADMIN_ROUTES}><BaseConocimiento layoutRole="administrador" /></ProtectedRoute>} />
          <Route path="/administrador/base-conocimiento/:id" element={<ProtectedRoute roles={ADMIN_ROUTES}><BaseConocimientoDetallePage layoutRole="administrador" /></ProtectedRoute>} />
          <Route path="/administrador/base-conocimiento/crear-guia" element={<ProtectedRoute roles={ADMIN_ROUTES}><CrearGuia layoutRole="administrador" /></ProtectedRoute>} />
          <Route path="/administrador/base-conocimiento/editar-guia/:id" element={<ProtectedRoute roles={ADMIN_ROUTES}><EditarGuia layoutRole="administrador" /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute roles={ADMIN_ROUTES}><Usuarios /></ProtectedRoute>} />
          <Route path="/usuarios/nuevo" element={<ProtectedRoute roles={ADMIN_ROUTES}><UsuarioDetalle modo="crear" /></ProtectedRoute>} />
          <Route path="/usuarios/areas/nueva" element={<ProtectedRoute roles={ADMIN_ROUTES}><AreaDetalle modo="crear" /></ProtectedRoute>} />
          <Route path="/usuarios/areas/:id" element={<ProtectedRoute roles={ADMIN_ROUTES}><AreaDetalle modo="ver" /></ProtectedRoute>} />
          <Route path="/usuarios/areas/:id/editar" element={<ProtectedRoute roles={ADMIN_ROUTES}><AreaDetalle modo="editar" /></ProtectedRoute>} />
          <Route path="/usuarios/categorias/nueva" element={<ProtectedRoute roles={ADMIN_ROUTES}><CategoriaDetalle modo="crear" /></ProtectedRoute>} />
          <Route path="/usuarios/categorias/:id" element={<ProtectedRoute roles={ADMIN_ROUTES}><CategoriaDetalle modo="ver" /></ProtectedRoute>} />
          <Route path="/usuarios/categorias/:id/editar" element={<ProtectedRoute roles={ADMIN_ROUTES}><CategoriaDetalle modo="editar" /></ProtectedRoute>} />
          <Route path="/usuarios/:id" element={<ProtectedRoute roles={ADMIN_ROUTES}><UsuarioDetalle modo="ver" /></ProtectedRoute>} />
          <Route path="/usuarios/:id/editar" element={<ProtectedRoute roles={ADMIN_ROUTES}><UsuarioDetalle modo="editar" /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute roles={ADMIN_ROUTES}><Reportes /></ProtectedRoute>} />

          <Route path="*" element={<ProtectedRoute><RoleHomeRedirect /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
