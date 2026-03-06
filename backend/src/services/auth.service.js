// ================================================
// SERVICIO DE AUTENTICACIÓN 
// backend/src/services/auth.service.js
// ================================================
// Este archivo contiene la lógica de negocio y acceso a datos de autenticación:
// - buscarUsuarioPorEmail(): Busca un usuario en BD por su email
// - crearUsuario(): Registra un nuevo usuario en la BD

const { conectarBBDD } = require("../db/conexionBBDD.js");

// Funcion: buscarUsuarioPorEmail
async function buscarUsuarioPorEmail(email) {
  const conexion = await conectarBBDD();
  try {
    // Busca usuario por email en la tabla usuarios
    // Selecciona todos los campos necesarios (incluido password para comparar en login)
    const [rows] = await conexion.execute(
      "SELECT id_usuario, nombre, email, password, rol, fecha_creacion FROM usuarios WHERE email = ?",
      [email]
    );
    
    // Devuelve el primer resultado o null si no se encontró nada
    return rows[0] || null;
  } finally {
    // IMPORTANTE: Siempre cerrar la conexión después de usarla
    await conexion.end();
  }
}

// Funcion: crearUsuario
async function crearUsuario({ nombre, email, password }) {
  const conexion = await conectarBBDD();
  try {
    // Comprobar si el email ya está registrado
    const [existe] = await conexion.execute(
      "SELECT id_usuario FROM usuarios WHERE email = ?",
      [email]
    );

    // Si el email ya existe, lanza error
    if (existe.length > 0) {
      throw new Error("El email ya está registrado");
    }

    // Insertar nuevo usuario en la BD, por defecto el rol es "cliente"
    const [result] = await conexion.execute(
      `INSERT INTO usuarios (nombre, email, password, rol, fecha_creacion)
       VALUES (?, ?, ?, 'cliente', NOW())`,
      [nombre, email, password]
    );

    return {
      id_usuario: result.insertId,
      nombre,
      email,
      rol: "cliente"
    };
  } finally {
    // Cerrar conexión
    await conexion.end();
  }
}

module.exports = {
  buscarUsuarioPorEmail,
  crearUsuario
};