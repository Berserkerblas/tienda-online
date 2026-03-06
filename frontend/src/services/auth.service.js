// frontend/src/services/auth.service.js

import api from "./api.js";

// Autentica un usuario con email y contraseña
// Devuelve { token, usuario, ... }
export async function login({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // { token, usuario }
}

// Registra un nuevo usuario con nombre, email y contraseña
// Devuelve { token, usuario, ... }
export async function register({ nombre, email, password }) {
  const res = await api.post("/auth/register", { nombre, email, password });
  return res.data; // { token, usuario } (o similar)
}

// Obtiene los datos del usuario actualmente autenticado
// El token se envía automáticamente en el header (via api.interceptors)
export async function me() {
  const res = await api.get("/auth/me");
  return res.data; // { usuario, ... } o similar
}