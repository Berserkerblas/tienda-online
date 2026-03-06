// frontend/src/components/Footer.jsx

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Footer.css";

export default function Footer() {
  // Obtiene el año actual para el copyright
  const currentYear = new Date().getFullYear();
  // Extrae datos de autenticación del contexto
  const { autenticado, usuario } = useAuth();
  // Verifica si el usuario actual es admin
  const esAdmin = usuario?.rol === "admin";

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>Gondor</h3>
          <p className="footer-tagline">
            Tu tienda de TCG y juegos de mesa
          </p>
        </div>

        {/* Enlaces de navegación del footer adaptados según el rol del usuario */}
        <nav className="footer-links">
          <Link to="/" className="footer-link">
            Inicio
          </Link>
          
          {/* Productos: visible solo para usuarios no-admin */}
          {!esAdmin && (
            <Link to="/productos" className="footer-link">
              Productos
            </Link>
          )}
          
          {/* Carrito: solo para usuarios autenticados no-admin */}
          {autenticado && !esAdmin && (
            <Link to="/carrito" className="footer-link">
              Carrito
            </Link>
          )}
          
          {/* Mis Pedidos: solo para usuarios autenticados no-admin */}
          {autenticado && !esAdmin && (
            <Link to="/mis-pedidos" className="footer-link">
              Mis Pedidos
            </Link>
          )}
          
          {/* Panel de administración: solo visible para admins */}
          {esAdmin && (
            <Link to="/admin/productos" className="footer-link">
              Administración
            </Link>
          )}
        </nav>

        <div className="footer-copyright">
          © {currentYear} <strong>Gondor</strong> — Proyecto Final DAW
        </div>
      </div>
    </footer>
  );
}
