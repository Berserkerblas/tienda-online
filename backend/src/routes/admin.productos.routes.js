// ================================================
// RUTAS DE ADMINISTRACIÓN DE PRODUCTOS  
// backend/src/routes/admin.productos.routes.js
// ================================================
// Este archivo define las rutas del panel de administración de productos:
// - POST /admin/productos: Crear nuevo producto
// - PUT /admin/productos/:id: Actualizar producto completo
// - PATCH /admin/productos/:id/estado: Activar/desactivar producto

const express = require("express");

// Controladores de administración de productos
const {
  crearProductoController,
  actualizarProductoController,
  cambiarEstadoController,
  listarProductosController,
  crearProductoUploadController,
  eliminarProductoController,
} = require("../controllers/admin.productos.controller.js");

// Middlewares de seguridad
const { auth } = require("../middlewares/auth.middleware.js");
const { adminOnly } = require("../middlewares/admin.middleware.js");

// Middleware de validación de archivos
const { validarArchivoJPG } = require("../middlewares/upload.middleware.js");

const router = express.Router();

// Todas las rutas requieren autenticación (auth) + rol admin (adminOnly)

// Listar productos (activos e inactivos) - con filtros y paginación
router.get("/productos", auth, adminOnly, listarProductosController);

// Crear nuevo producto
router.post("/productos", auth, adminOnly, crearProductoController);

// Crear nuevo producto con carga de imagen JPG
// Requiere multipart/form-data con campos: "producto" (JSON) y "archivo" (archivo JPG)
router.post("/productos/upload", auth, adminOnly, validarArchivoJPG, crearProductoUploadController);

// Actualizar producto completo
router.put("/productos/:id", auth, adminOnly, actualizarProductoController);

// Cambiar estado del producto (activar/desactivar)
router.patch("/productos/:id/estado", auth, adminOnly, cambiarEstadoController);

// Eliminar producto
router.delete("/productos/:id", auth, adminOnly, eliminarProductoController);

module.exports = router;