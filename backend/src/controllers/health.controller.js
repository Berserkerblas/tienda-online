// backend/src/controllers/health.controller.js
// Este archivo contiene la función para verificar el estado del servidor:
// - health(): Comprueba que el servidor y la base de datos funcionan correctamente

const { conectarBBDD } = require("../db/conexionBBDD");

// Funcion health - Verifica que el servidor y la base de datos están operativos.
async function health(req, res) {
  try {
    // Abre conexión a la base de datos
    const conexion = await conectarBBDD();
    
    // Ejecuta query simple para verificar que la BD responde
    await conexion.execute("SELECT 1");
    
    // Cierra la conexión
    await conexion.end();

    // Verifica que el servidor responde y la BD funciona, devuelve estado "ok"
    return res.status(200).json({
      estado: "ok",
      bbdd: "ok",
      fecha: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      estado: "error",
      bbdd: "fail",
      fecha: new Date().toISOString(),
    });
  }
}

module.exports = { health };