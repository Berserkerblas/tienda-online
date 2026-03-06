// frontend/src/pages/AuthPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

export default function AuthPage() {
  const navigate = useNavigate();
  // Obtiene funciones de autenticación y estado actual
  const { iniciarSesion, registrarse, autenticado, usuario } = useAuth();

  // Alterna entre modo login y registro
  const [modo, setModo] = useState("login"); // "login" | "register"

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Control de estado de carga y errores
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Maneja el envío del formulario (login o registro)
  async function onSubmit(e) {
    e.preventDefault();

    try {
      setCargando(true);
      setError("");

      // Ejecuta login o registro según el modo
      let user = null;
      if (modo === "login") {
        user = await iniciarSesion({ email, password });
      } else {
        await registrarse({ nombre, email, password });
      }

      // Redirige según el rol del usuario: admin a administración, otros al catálogo
      if (user?.rol === "admin") {
        navigate("/admin/productos");
      } else {
        navigate("/productos");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        modo === "login"
          ? "Credenciales inválidas o error de servidor."
          : "No se pudo crear la cuenta (revisa datos o email duplicado)."
      );
    } finally {
      setCargando(false);
    }
  }

  // Si ya tienes sesión iniciada, muestra panel de usuario
  if (autenticado) {
    return (
      <main className="auth-main">
        <div className="auth-container">
          <h1 className="auth-title">Mi Cuenta</h1>
          
          <div className="auth-account">
            <div className="auth-account-card">
              <div className="auth-account-icon">✓</div>
              <h2 className="auth-account-title">Sesión iniciada</h2>
              {usuario?.email && (
                <div className="auth-account-email">{usuario.email}</div>
              )}
              <div className="auth-account-message">
                ¡Bienvenido! Ya puedes acceder a todas las secciones.
              </div>
              
              <div className="auth-account-actions">
                <a href="/productos" className="auth-account-btn">
                  Ir al catálogo
                </a>
                <a href="/mis-pedidos" className="auth-account-btn">
                  Mis pedidos
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-main">
      <div className="auth-container">
        <h1 className="auth-title">
          {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>

        <div className="auth-mode-toggle">
          <button
            type="button"
            className="auth-mode-btn"
            onClick={() => setModo("login")}
            disabled={cargando || modo === "login"}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className="auth-mode-btn"
            onClick={() => setModo("register")}
            disabled={cargando || modo === "register"}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          {modo === "register" && (
            <div className="auth-form-group">
              <label htmlFor="nombre-input">Nombre completo</label>
              <input
                id="nombre-input"
                type="text"
                className="auth-form-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                minLength={2}
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div className="auth-form-group">
            <label htmlFor="email-input">Email</label>
            <input
              id="email-input"
              type="email"
              className="auth-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password-input">Contraseña</label>
            <input
              id="password-input"
              type="password"
              className="auth-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            disabled={cargando}
            className="auth-btn-submit"
          >
            {cargando
              ? modo === "login"
                ? "Entrando..."
                : "Creando cuenta..."
              : modo === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </button>
        </form>
      </div>
    </main>
  );
}