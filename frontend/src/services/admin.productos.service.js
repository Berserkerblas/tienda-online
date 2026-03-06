// frontend/src/services/admin.productos.service.js

import api from "./api.js";

/**
 * GET /admin/productos
 * Obtiene listado completo de productos (activos e inactivos).
 * Permite filtros: busqueda, id_categoria, activo (1/0), pagina, limite.
 * Requiere rol admin.
 */
export async function listarProducto(params = {}) {
  const response = await api.get("/admin/productos", { params });
  return response.data; // { productos: [...], total: number, ... }
}

/**
 * POST /admin/productos
 * Crea un nuevo producto con datos: id_categoria, nombre, descripcion, precio, stock, imagen, activo
 * Requiere rol admin.
 */
export async function crearProducto(producto) {
  const response = await api.post("/admin/productos", producto);
  return response.data; // { id_producto, ... }
}

/**
 * PUT /admin/productos/:id
 * Actualiza completamente un producto existente.
 * Requiere rol admin.
 */
export async function actualizarProducto(idProducto, producto) {
  const response = await api.put(`/admin/productos/${idProducto}`, producto);
  return response.data; // { id_producto, ... }
}

/**
 * PATCH /admin/productos/:id/estado
 * Activa o desactiva un producto (cambiar el estado activo/inactivo).
 * Requiere rol admin.
 */
export async function estadoProducto(idProducto, activo) {
  const response = await api.patch(`/admin/productos/${idProducto}/estado`, {
    activo,
  });
  return response.data; // { id_producto, activo, ... }
}

/**
 * POST /admin/productos/upload
 * Crea un nuevo producto con carga de archivo de imagen JPG.
 * Envía FormData con campos "producto" (JSON stringificado) y "archivo" (File object).
 * Requiere rol admin.
 */
export async function crearProductoConArchivo(datosProducto, archivoFile) {
  const formData = new FormData();
  
  // Agregar datos del producto como JSON stringificado
  formData.append("producto", JSON.stringify(datosProducto));
  
  // Agregar archivo
  formData.append("archivo", archivoFile);

  // Importante: NO incluir Content-Type, el navegador lo establece automáticamente
  // con el boundary correcto para multipart/form-data
  const response = await api.post("/admin/productos/upload", formData);
  return response.data; // { id_producto, ... }
}