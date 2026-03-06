// ================================================
// ARCHIVO PRINCIPAL 
// backend/src/app.js
// ================================================

// Este archivo es el punto de entrada de toda la API
// Define cómo se comporta el servidor: qué middlewares usa, qué rutas expone, cómo maneja requests

// FLUJO DEL ARCHIVO:
// 1. Carga variables de entorno (.env)
// 2. Importa dependencias (express, cors, etc)
// 3. Importa las rutas del proyecto
// 4. Crea instancia de Express
// 5. Registra middlewares globales (apply a TODOS los requests)
// 6. Registra las rutas de la API
// 7. Inicia el servidor en un puerto


// ================================================
// 1. IMPORTACIONES Y DEPENDENCIAS
// ================================================

// Express: Framework web para Node.js que facilita la creación de APIs REST
// Proporciona métodos para manejar requests HTTP, definir rutas, y registrar middlewares
const express = require("express");

// CORS (Cross-Origin Resource Sharing): Middleware de seguridad del navegador
// Permite que el frontend (en diferente dominio/puerto) acceda a esta API
// Sin configurar CORS, el navegador BLOQUEA las peticiones (Same-Origin Policy - política de seguridad web)
const cors = require("cors");

// Dotenv: Carga variables de entorno desde el archivo .env en process.env
// IMPORTANTE: DEBE ejecutarse ANTES de acceder a process.env
// Variables que el proyecto necesita: CORS_ORIGIN, PORT, DATABASE_URL, JWT_SECRET, etc.
require("dotenv").config();

// Express-fileupload: Middleware para manejo de carga de archivos (multipart/form-data)
// Procesa archivos cargados por formularios HTML en req.files
const fileUpload = require("express-fileupload");

const path = require("path");

// ================================================
// 2. INICIALIZACIÓN DE LA APLICACIÓN EXPRESS
// ================================================

// Importa las rutas de autenticación desde el archivo auth.routes.js
const authRoutes = require("./routes/auth.routes");

// Importa las rutas de productos
const productosRoutes = require("./routes/productos.routes");

// Importa las rutas de pedidos
const pedidosRoutes = require("./routes/pedidos.routes");

// Importa las rutas de administración de productos
const adminProductosRoutes = require("./routes/admin.productos.routes");

// Crea una instancia de la aplicación Express
const app = express();

// ================================================
// 3. MIDDLEWARES GLOBALES
// ================================================
// Los middlewares se ejecutan en TODOS los requests, ANTES de llegar a las rutas
// El orden de los middlewares IMPORTA: se ejecutan de arriba a abajo

// 1. MIDDLEWARE: Parsear JSON
// Transforma el body de los requests en un objeto JavaScript
// Ejemplo: {"nombre": "Juan"} de string se convierte en objeto JavaScript accesible en req.body
// SIN ESTO: req.body sería undefined y no podríamos recibir datos POST/PUT
app.use(express.json());

// 2. MIDDLEWARE: CORS (Cross-Origin Resource Sharing)
// Configura qué dominios pueden acceder a esta API desde navegadores web
// origin: Define cuál es el dominio permitido (viene de CORS_ORIGIN en .env)
// credentials: true es CRÍTICO - permite enviar tokens JWT y cookies en los requests
//   Sin esto, aunque el frontend esté autorizado, los navegadores no envían auth headers

// Ejemplo: Si CORS_ORIGIN = "http://localhost:5173" (tu frontend)
//   El navegador en http://localhost:5173 SÍ puede hacer peticiones
//   El navegador en http://otrositio.com NO puede hacer peticiones (será bloqueado)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // URL del frontend permitida (ej: http://localhost:5173)
    credentials: true, // IMPORTANTE para autenticación: permite enviar cookies y JWT tokens
  })
);

// 3. MIDDLEWARE: Archivos estáticos (IMÁGENES)
// Sirve todo lo que haya dentro de backend/public como archivos accesibles por URL.
// Ejemplo:
// - archivo: backend/public/productos/wh1.jpg
// - URL:    http://localhost:3000/productos/wh1.jpg
app.use(express.static(path.resolve(__dirname, "..", "public")));

// 4. MIDDLEWARE: File Upload (Carga de archivos)
// Procesa multipart/form-data para manejar archivos cargados
// Pone los archivos en req.files, accesibles por el nombre del campo del formulario
// Ejemplo: <input name="archivo"> estará disponible en req.files.archivo
app.use(fileUpload());

// ================================================
// 5. RUTAS Y ENDPOINTS
// ================================================
// Cada app.use() y app.get() REGISTRA una ruta

// ENDPOINT: Health Check (simple y sin autenticación)
app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true, // Indica que el servicio está operativo
    service: "backend", // Identificador del servicio para monitoreo
    ts: new Date().toISOString(), // Timestamp en formato ISO 8601 para debugging
  });
});

// RUTAS PRINCIPALES
// Cada una se gestiona por un archivo diferente en la carpeta /routes

// RUTA: /auth - Autenticación (login, registro, logout)
app.use("/auth", authRoutes);

// RUTA: /productos - Gestión de productos (acceso público)
app.use("/productos", productosRoutes);

// RUTA: /pedidos - Gestión de pedidos del cliente
app.use("/pedidos", pedidosRoutes);

// RUTA: /admin - Panel de administración (requiere role admin)
app.use("/admin", adminProductosRoutes);

// ================================================
// INICIALIZACIÓN DEL SERVIDOR
// ================================================
// Hasta aquí, la app está configurada pero NO está aceptando conexiones
// app.listen() es lo que ACTIVA el servidor

// Define el puerto en el que escuchará el servidor
// Prioridad: 1. Variable de entorno PORT (si existe) 2. Sino, puerto 3000 por defecto
// En desarrollo: 3000 es típico. En producción: usa variable de entorno
const PORT = process.env.PORT || 3000;

// app.listen() INICIA EL SERVIDOR
// - Pone el servidor a escuchar en el puerto especificado
// - Ahora la API acepta requests HTTP
// - El callback se ejecuta cuando el servidor está listo
app.listen(PORT, () => {
  console.log(`✓ API running on http://localhost:${PORT}`);
});