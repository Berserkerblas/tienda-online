// frontend/src/services/productos.service.js

import api from "./api.js";

// Obtiene lista de productos con filtros opcionales (búsqueda, categoría, rango de precios, etc.)
// Parámetros: { busqueda, id_categoria, precio_minimo, precio_maximo, solo_con_stock, orden_precio, pagina, limite }
export async function obtenerProductos(params = {}) {
  const res = await api.get("/productos", { params });
  return res.data; // { productos: [...], total: number }
}

// Obtiene los detalles completos de un producto por su ID
export async function obtenerProductoPorId(id) {
  const res = await api.get(`/productos/${id}`);
  return res.data; // { producto: {...} } o similar
}
