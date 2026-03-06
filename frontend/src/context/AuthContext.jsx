// frontend/src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi, register as registerApi, me as meApi } from "../services/auth.service.js";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Token JWT almacenado en localStorage para persistencia entre sesiones
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  // Datos del usuario actual (id, nombre, email, rol)
  const [usuario, setUsuario] = useState(null);
  // Flag para saber si hemos terminado de validar el token al montar la app
  const [cargando, setCargando] = useState(true);

  // Sincroniza el token con axios headers y localStorage cada vez que cambia
  useEffect(() => {
    if (token) {
      // Añade token al header de axios para todas las peticiones autenticadas
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      // Persiste el token en localStorage
      localStorage.setItem("token", token);
    } else {
      // Elimina el token de axios si no hay sesión activa
      delete api.defaults.headers.common.Authorization;
      // Limpia localStorage
      localStorage.removeItem("token");
    }
  }, [token]);

  // Valida el token al montar la app: obtiene los datos del usuario actual
  useEffect(() => {
    async function init() {
      try {
        if (!token) {
          setUsuario(null);
          return;
        }

        const data = await meApi();
        setUsuario(data?.usuario ?? data);
      } catch {
        setToken("");
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    }

    init();
    // Solo ejecuta una vez al montar el componente (array vacío)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autentica el usuario con email y contraseña
  async function iniciarSesion({ email, password }) {
    const data = await loginApi({ email, password });
    // Maneja variaciones en el formato de respuesta del backend
    const nuevoToken = data?.token ?? data?.accessToken;
    const user = data?.usuario ?? data?.user ?? null;

    if (!nuevoToken) {
      throw new Error("La respuesta de login no incluye token.");
    }

    // Actualiza el estado con el token y usuario válido
    setToken(nuevoToken);
    setUsuario(user);
    return user;
  }

  // Registra un nuevo usuario con nombre, email y contraseña
  async function registrarse({ nombre, email, password }) {
    const data = await registerApi({ nombre, email, password });
    // Extrae el token del formato que devuelve el backend
    const nuevoToken = data?.token ?? data?.accessToken;
    const user = data?.usuario ?? data?.user ?? null;

    if (!nuevoToken) {
      throw new Error("La respuesta de register no incluye token.");
    }

    // Guarda el token y los datos del nuevo usuario
    setToken(nuevoToken);
    setUsuario(user);
  }

  // Limpia la sesión: elimina token y datos del usuario
  function cerrarSesion() {
    setToken("");
    setUsuario(null);
  }

  // Memoiza el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(
    () => ({
      token,
      usuario,
      cargandoSesion: cargando,
      cargando,
      // Indicador booleano de si hay sesión activa
      autenticado: Boolean(token),
      iniciarSesion,
      registrarse,
      cerrarSesion,
    }),
    [token, usuario, cargando]
  );

  // Provee el contexto de autenticación a toda la app
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para acceder al contexto de autenticación desde cualquier componente
export function useAuth() {
  const ctx = useContext(AuthContext);
  // Validación: asegura que se está usando dentro del provider
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}