// ================================================
// CONEXIÓN A BASE DE DATOS
// backend/src/db/conexionBBDD.js
// ================================================
// Este archivo gestiona la conexión a la base de datos MySQL
// Se importa en otros archivos (controladores, servicios) para ejecutar queries a la BD


// Importacion de mysql2: librería que permite usar async/await (en lugar de callbacks tradicionales)
const mysql = require("mysql2/promise");



// Funcion conectarBBDD() Crea y abre una nueva conexión a la base de datos MySQL (usa variables de entorno del archivo .env)
async function conectarBBDD() {

  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST,        
    port: Number(process.env.DB_PORT),  
    user: process.env.DB_USER,        
    password: process.env.DB_PASS,     
    database: process.env.DB_NAME,     
  });

  // Retorna la conexión abierta y lista para usar queries
  return conexion;
}


// Exporta la función para que otros archivos la puedan importar
module.exports = { conectarBBDD };