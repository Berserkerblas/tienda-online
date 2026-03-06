// frontend/src/services/api.js

import axios from "axios";

// Crea instancia de axios con URL base desde variables de entorno
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Interceptor de peticiones: añade token JWT al header Authorization
api.interceptors.request.use((config) => {
  // Obtiene el token del localStorage
  const token = localStorage.getItem("token");

  // Si existe token, lo añade al header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;