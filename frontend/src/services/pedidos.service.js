// frontend/src/services/pedidos.service.js

import api from "./api.js";

// Crea un nuevo pedido con datos de envío y líneas de productos
// payload: { nombre_envio, direccion_envio, ciudad_envio, cp_envio, lineas: [{id_producto, cantidad}, ...] }
export async function crearPedido(payload) {
  const res = await api.post("/pedidos", payload);
  return res.data; // { id_pedido, ... }
}

// Obtiene el historial de pedidos del usuario autenticado
// Requiere token en header (autenticado)
export async function obtenerMisPedidos() {
  const res = await api.get("/pedidos");
  return res.data; // array de pedidos o { pedidos: [...] }
}

// Obtiene los detalles completos de un pedido específico
export async function obtenerPedidoPorId(id) {
  const res = await api.get(`/pedidos/${id}`);
  return res.data; // { id_pedido, lineas: [...], total, ... }
}

/**
 * Descarga el ticket/factura PDF de un pedido (requiere estar autenticado).
 * Devuelve un Blob con el contenido PDF.
 */
export async function descargarTicketPedido(id) {
  // responseType: 'blob' indica que esperamos un archivo binario
  const res = await api.get(`/pedidos/${id}/ticket`, {
    responseType: "blob",
  });

  // res.data contiene el blob del PDF
  return res.data;
}