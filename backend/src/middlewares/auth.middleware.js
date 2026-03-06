// backend/src/middlewares/auth.middleware.js

// Este archivo contiene el middleware de autenticación:

// jsonwebtoken: Librería para verificar y decodificar tokens JWT
const jwt = require("jsonwebtoken");

// Funcion auth - Middleware que verifica el token JWT en el header Authorization
function auth(req, res, next) {
  // Extrae el header Authorization de la petición
  // Formato esperado: "Authorization: Bearer <token_jwt>"
  const authHeader = req.headers.authorization;

  // Verificar que existe el header y tiene formato Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // 401 = Unauthorized (falta token o formato incorrecto)
    return res.status(401).json({ message: "No autorizado falta token" });
  }

  // Extrae el token JWT del header (quita "Bearer " del inicio), "Bearer abc123" -> "abc123"
  const token = authHeader.split(" ")[1];

  try {
    //Verificar que el token sea válido y no esté expirado
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Si el token es válido, guarda los datos del usuario en req.user
    req.user = decoded;
    
    // Llama a next() para continuar al siguiente middleware o controlador
    return next();
  } catch (err) {
    // Si jwt.verify() falla, el token es inválido o expiró, error 401 -> no autorizado
    return res.status(401).json({ message: "No autorizado token inválido o expirado" });
  }
}

module.exports = { auth };