// ================================================
// RUTAS DE PEDIDOS 
// backend/src/routes/pedidos.routes.js
// ================================================
// Este archivo define las rutas de gestión de pedidos del usuario:
// - POST /pedidos: Crear un nuevo pedido
// - GET /pedidos: Listar todos los pedidos del usuario autenticado
// - GET /pedidos/:id: Obtener detalle de un pedido específico
// - GET /pedidos/:id/ticket: Obtener ticket PDF del pedido

const express = require("express");

// Controladores de pedidos
const {
  crearPedido,
  listarPedidosDelUsuario,
  obtenerPedidoPorId,
  obtenerTicketPedido,
} = require("../controllers/pedidos.controller.js");

// Middleware de autenticación
const { auth } = require("../middlewares/auth.middleware.js");

const router = express.Router();

// Todas las rutas de pedidos requieren autenticación
// El middleware auth verifica el token JWT y carga req.user

// Crear nuevo pedido
router.post("/", auth, crearPedido);

// Listar pedidos del usuario autenticado
router.get("/", auth, listarPedidosDelUsuario);

// Obtener ticket PDF del pedido
router.get("/:id/ticket", auth, obtenerTicketPedido);

// Obtener detalle de un pedido específico
router.get("/:id", auth, obtenerPedidoPorId);

module.exports = router;