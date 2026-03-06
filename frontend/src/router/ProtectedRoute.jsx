// frontend/src/router/ProtectedRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ redirectTo = "/auth" }) {
  // Obtiene estado de autenticación y carga
  const { autenticado, cargando } = useAuth();

  // Mientras se valida la sesión, muestra mensaje de espera
  if (cargando) {
    return <p style={{ padding: 16 }}>Comprobando sesión...</p>;
  }

  // Si no está autenticado, redirige a login (o a redirectTo si se especifica)
  if (!autenticado) {
    return <Navigate to={redirectTo} replace />;
  }

  // Usuario autenticado: renderiza el contenido protegido
  return <Outlet />;
}