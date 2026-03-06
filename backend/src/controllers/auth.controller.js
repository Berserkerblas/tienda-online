// backend/src/controllers/auth.controller.js
// Gestiona las peticiones HTTP relacionadas con autenticación de usuarios


// Importamos jsonwebtoken una librería para crear y verificar tokens JWT (JSON Web Tokens)
// Permite crear tokens seguros para autenticar usuarios sin usar sesiones
const jwt = require("jsonwebtoken");

// Importa funciones de backend/src/services/auth.service.js
const { buscarUsuarioPorEmail } = require("../services/auth.service");
const { crearUsuario } = require("../services/auth.service");


// Función validarEmailBasico(email), función auxiliar para validar el formato básico de un email
const validarEmailBasico = (email) => {
  return (
    typeof email === "string" &&
    email.includes("@") &&          
    email.includes(".") &&       
    email.length <= 255             
  );
}

// Función login(req, res) controlador que maneja el login de usuarios (POST /auth/login)
// Valida que el email y password existan, que el email tenga formato válido y que la password tenga mínimo 8 caracteres
// Luego busca el usuario en la BD por email, verifica que la password coincida y genera un token JWT con los datos del usuario
// Devuelve el usuario (sin password) y el token al frontend o error si las credenciales son inválidas
async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email y password son obligatorios" });
  }

  if (!validarEmailBasico(email)) {
    return res.status(400).json({ message: "Formato de email inválido" });
  }

  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
  }

  // Llama a buscarUsuarioPorEmail(email) de backend/src/services/auth.service.js para obtener el usuario de la BD
  const usuario = await buscarUsuarioPorEmail(email);

  if (!usuario) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  if (usuario.password !== password) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }
  
  const usuarioSeguro = {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol
  };

  // Genera token JWT con los datos del usuario
  const token = jwt.sign(usuarioSeguro, process.env.JWT_SECRET, { expiresIn: "7d" });

  // Devuelve usuario + token al frontend
  return res.status(200).json({
    usuario: usuarioSeguro,
    token
  });
}


// Funcion register(req, res) controlador que maneja el registro de nuevos usuarios (POST /auth/register)
// Valida que nombre, email y password existan, que el nombre tenga mínimo 2 caracteres, que el email tenga formato válido y que la password tenga mínimo 8 caracteres
// Luego delega al service crearUsuario() la creación del usuario en la BD (el service valida que el email no exista ya)
// Si el usuario se crea exitosamente, genera un token JWT con los datos del nuevo usuario y lo devuelve al frontend junto con los datos del usuario (sin password)
// Si hay error (ej: email ya registrado), devuelve el mensaje de error
async function register(req, res) {
  
  const { nombre, email, password } = req.body || {};

  if (!nombre || !email || !password) {
    return res.status(400).json({ message: "Nombre, email y password son obligatorios" });
  }

  if (typeof nombre !== "string" || nombre.length < 2) {
    return res.status(400).json({ message: "El nombre debe tener al menos 2 caracteres" });
  }

  if (!validarEmailBasico(email)) {
    return res.status(400).json({ message: "Formato de email inválido" });
  }

  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
  }

  // Intenta crear el usuario en la BD (delega al service)
  try {
    // Llama a crearUsuario() de backend/src/services/auth.service.js con los datos del nuevo usuario
    const usuario = await crearUsuario({ nombre, email, password });
    // Si se creó el usuario, genera un token JWT con los datos del nuevo usuario
    const token = jwt.sign(usuario, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      usuario,
      token
    });

  } catch (err) {

    return res.status(400).json({ message: err.message });
  }
}

// Funcion me(req, res) controlador que maneja la ruta para obtener los datos del usuario autenticado (GET /auth/me)
function me(req, res) {
  // Devuelve los datos del usuario autenticado que el middleware auth puso en req.user
  return res.status(200).json({
    id_usuario: req.user.id_usuario,
    nombre: req.user.nombre,
    email: req.user.email,
    rol: req.user.rol
  });
}

// Exporta todas las funciones controlador para que se puedan usar en las rutas
module.exports = { login, me, register };
