// backend/src/middlewares/admin.middleware.js

// Funcion adminOnly - Middleware que verifica que el usuario autenticado tenga rol "admin".
function adminOnly(req, res, next) {
  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({ message: "Acceso denegado: requiere rol admin" });
  }
  return next();
}

module.exports = { adminOnly };