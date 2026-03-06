// frontend/src/components/Header.jsx

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  // Extrae estado de autenticación y datos del usuario desde el contexto
  const { autenticado, cerrarSesion, usuario } = useAuth();
  // Obtiene la cantidad total de items en el carrito
  const { totalItems } = useCart();

  // Maneja el cierre de sesión y redirige a inicio
  function onLogout() {
    cerrarSesion();
    navigate("/");
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <img src="/logo.png" alt="Gondor" className="header-logo-img" />
        </Link>

        {/* Barra de navegación principal con enlaces dinámicos según rol */}
        <nav className="header-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
            end
          >
            Inicio
          </NavLink>

          {/* Enlace a productos: visible solo para usuarios no-admin */}
          {usuario?.rol !== "admin" && (
            <NavLink 
              to="/productos" 
              className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
            >
              Productos
            </NavLink>
          )}

          {/* Menú de administración: visible solo si el usuario es admin */}
          {usuario?.rol === "admin" && (
            <NavLink 
              to="/admin/productos" 
              className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
            >
              Administración
            </NavLink>
          )}

          {/* Carrito: solo visible para usuarios autenticados no-admin */}
          {autenticado && usuario?.rol !== "admin" && (
            <NavLink 
              to="/carrito" 
              className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
            >
              Carrito ({totalItems})
            </NavLink>
          )}

          {/* Historial de pedidos: solo para usuarios autenticados no-admin */}
          {autenticado && usuario?.rol !== "admin" && (
            <NavLink 
              to="/mis-pedidos" 
              className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
            >
              Mis pedidos
            </NavLink>
          )}

          {/* Login: visible solo si no está autenticado */}
          {!autenticado && (
            <NavLink 
              to="/auth" 
              className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
            >
              Login
            </NavLink>
          )}
        </nav>

        {/* Sección de usuario autenticado con nombre y botón de cierre de sesión */}
        {autenticado && (
          <div className="header-user-section">
            <span className="header-user-info">
              Hola, <strong>{usuario?.nombre}</strong> ({usuario?.rol})
            </span>

            <button 
              type="button" 
              onClick={onLogout} 
              className="header-logout-btn"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}