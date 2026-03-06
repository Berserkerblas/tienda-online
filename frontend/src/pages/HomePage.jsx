// frontend/src/pages/HomePage.jsx

// Esta página es el punto de entrada de la aplicación. 
// Contiene un video de fondo y enlaces para navegar a productos y carrito.

import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

export default function HomePage() {
  // Obtiene datos del usuario del contexto de autenticación
  const { usuario } = useAuth();
  // Determina si el usuario actual es admin
  const esAdmin = usuario?.rol === "admin";
  
  return (
    <main className="homepage-main">
      <section className="hero-section">
        <div className="hero-video-container">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="hero-video"
          >
            {/* Video de fondo: debe estar en /public/hero.mp4 */}
            <source src="/hero.mp4" type="video/mp4" />
            Tu navegador no soporta vídeo HTML5.
          </video>

          <div className="hero-overlay">
            <div className="hero-content">
              <h1 className="hero-title">
                Gondor TCG & Juegos de mesa
              </h1>

              <p className="hero-description">
                Warhammer, One Piece, MTG, Pokémon, Lorcana y juegos de mesa.
              </p>

              <div className="hero-buttons">
                {/* Botón dinámico: al admin lo redirige a administración, al usuario normal al catálogo */}
                {esAdmin ? (
                  <a href="/admin/productos" className="hero-btn-primary">
                    Ir a Administración
                  </a>
                ) : (
                  <a href="/productos" className="hero-btn-primary">
                    Ver catálogo
                  </a>
                )}
              </div>


            </div>
          </div>
        </div>
      </section>
    </main>
  );
}