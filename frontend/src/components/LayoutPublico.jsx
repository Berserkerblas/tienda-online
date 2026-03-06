// frontend/src/components/LayoutPublico.jsx

import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./LayoutPublico.css";

export default function LayoutPublico() {
  // Obtiene la ruta actual para aplicar estilos específicos a la homepage
  const { pathname } = useLocation();
  // Determina si estamos en la página de inicio
  const esHome = pathname === "/";

  return (
    <div className={`layout-publico ${esHome ? "layout-home" : ""}`}>
      <Header />
      {/* Contenedor principal donde se renderiza el contenido de cada página */}
      <div className="layout-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}