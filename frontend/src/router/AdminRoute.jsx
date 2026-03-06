// frontend/src/router/AdminRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  // Obtiene datos del usuario y estado de carga de sesión
  const { usuario, cargandoSesion } = useAuth();

  // Espera a que se cargue la validación de sesión (/auth/me)
  if (cargandoSesion) return null;

  // No hay usuario: redirige a login
  if (!usuario) return <Navigate to="/auth" replace />;

  // Usuario autenticado pero no es admin: redirige al catálogo
  if (usuario.rol !== "admin") return <Navigate to="/productos" replace />;

  // Usuario es admin: permite acceso al contenido
  return children;
}