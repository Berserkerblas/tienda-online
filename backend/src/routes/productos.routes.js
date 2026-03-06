// ================================================
// RUTAS PÚBLICAS DE PRODUCTOS  
// backend/src/routes/productos.routes.js
// ================================================

const express = require("express");
const router = express.Router();

const productosController = require("../controllers/productos.controller");

// LISTADO: GET /productos
router.get("/", productosController.listarProductos);

// DETALLE: GET /productos/:id
router.get("/:id", productosController.obtenerProducto);

module.exports = router;