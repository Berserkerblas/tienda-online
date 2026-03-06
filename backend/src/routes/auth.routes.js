// ================================================
// RUTAS DE AUTENTICACIÓN  
// backend/src/routes/auth.routes.js
// ================================================
// Este archivo define las rutas de autenticación:
// - POST /register: Registrar nuevo usuario
// - POST /login: Iniciar sesión (obtener token JWT)
// - GET /me: Obtener datos del usuario autenticado


const express = require("express");
const router = express.Router();

// Middleware de autenticación
const { auth } = require("../middlewares/auth.middleware");

// Controladores de auth
const { login, me, register } = require("../controllers/auth.controller");

// Ruta de prueba
router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "auth routes funcionando" });
});

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

// Rutas protegidas (requieren autenticación)
router.get("/me", auth, me);

module.exports = router;

