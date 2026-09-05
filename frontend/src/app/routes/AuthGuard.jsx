import { Navigate, useLocation } from "react-router-dom";

import PageLoader from "../../shared/ui/loading/PageLoader.jsx";
import { getHomePathForRole } from "../../shared/constants/auth.js";
import useProtectedSession from "../../shared/hooks/useProtectedSession.js";
import useMinDuration from "../../shared/hooks/useMinDuration.js";

/**
 * Protege una rama de navegación comprobando la sesión con el backend y,
 * opcionalmente, restringiendo el acceso a una lista de roles.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Vista privada que se desea mostrar.
 * @param {string[]} [props.roles] - Roles autorizados para acceder a la vista.
 */
export default function AuthGuard({ children, roles }) {
  const location = useLocation();
  const { loading, user } = useProtectedSession();
  const showLoader = useMinDuration(loading, 1000);

  if (showLoader) {
    return <PageLoader label={["Cargando", "Configurando tu espacio de trabajo"]} />;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to={getHomePathForRole(user.rol)} replace />;
  }

  return children;
}
