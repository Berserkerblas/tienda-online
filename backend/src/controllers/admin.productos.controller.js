// backend/src/controllers/admin.productos.controller.js
// Gestiona las peticiones HTTP del panel de administración para productos


// Importa las funciones del service backend/src/services/admin.productos.service.js
const {
  ErrorAdminProductos,
  crearProducto,
  actualizarProducto,
  cambiarEstado,
  listarProductos,
  crearProductoConArchivo,
  eliminarProducto,
} = require("../services/admin.productos.service.js");


// Funcion crearProductoController(req, res) controlador que maneja la creación de un nuevo producto (POST /admin/productos)
// Llama a la funcion crearProducto de backend/src/services/admin.productos.service.js con los datos del body y devuelve 
// el producto creado o error si hay problemas de validación o creación
const crearProductoController = async (req, res) => {
  try {
    const productoCreado = await crearProducto(req.body);
    return res.status(201).json(productoCreado);
  } catch (error) {
    if (error instanceof ErrorAdminProductos) {
      return res.status(error.codigoHTTP).json({
        message: error.message,
        detalle: error.detalle || undefined,
      });
    }
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


// FUNCIÓN: actualizarProductoController(req, res) controlador que actualiza TODOS los datos de un producto existente (PUT /admin/productos/:id)
// Llama a la función actualizarProducto de backend/src/services/admin.productos.service.js con el ID del producto (de la URL) 
// y los nuevos datos (del body) y devuelve el producto actualizado o error si hay problemas de validación o actualización
const actualizarProductoController = async (req, res) => {
  try {
    const id_producto = Number(req.params.id);
    const productoActualizado = await actualizarProducto(id_producto, req.body);
    return res.status(200).json(productoActualizado);
  } catch (error) {
    if (error instanceof ErrorAdminProductos) {
      return res.status(error.codigoHTTP).json({
        message: error.message,
        detalle: error.detalle || undefined,
      });
    }
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


// Funcion cambiarEstadoController(req, res) controlador que cambia el estado activo/inactivo de un producto (PATCH /admin/productos/:id/estado)
// Llama a la función cambiarEstado de backend/src/services/admin.productos.service.js con el ID del producto (de la URL) 
// y el nuevo estado (del body) y devuelve confirmación o error si hay problemas de validación o actualización
const cambiarEstadoController = async (req, res) => {
  try {
    const id_producto = Number(req.params.id);
    const activo = Number(req.body.activo);
    const resultado = await cambiarEstado(id_producto, activo);
    return res.status(200).json(resultado);
  } catch (error) {
    if (error instanceof ErrorAdminProductos) {
      return res.status(error.codigoHTTP).json({
        message: error.message,
        detalle: error.detalle || undefined,
      });
    }
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Funcion listarProductosController(req, res) controlador que devuelve la lista de productos con filtros para el admin (GET /admin/productos)
// Llama a la función listarProductos de backend/src/services/admin.productos.service.js con los parámetros de query (filtros) 
// y devuelve la lista de productos o error si hay problemas
const listarProductosController = async (req, res) => {
  try {
    const productos = await listarProductos(req.query);
    return res.status(200).json(productos);
  } catch (error) {
    if (error instanceof ErrorAdminProductos) {
      return res.status(error.codigoHTTP).json({
        message: error.message,
        detalle: error.detalle || undefined,
      });
    }
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Función crearProductoUploadController(req, res) controlador que crea un producto con carga de imagen (POST /admin/productos/upload)
// Llama a la función crearProductoConArchivo con los datos del body y el archivo y devuelve el producto creado o error
const crearProductoUploadController = async (req, res) => {
  try {
    // El middleware validarArchivoJPG ya validó que req.files.archivo existe y es un JPG válido
    const archivo = req.files.archivo;

    // req.body.producto debe ser un JSON stringificado (como string)
    if (!req.body.producto) {
      return res.status(400).json({
        message: "Campo 'producto' requerido en el formulario.",
      });
    }

    // Parsear el JSON del producto
    let datosProducto;
    try {
      datosProducto = JSON.parse(req.body.producto);
    } catch (parseError) {
      return res.status(400).json({
        message: "Datos de producto inválidos (JSON malformado).",
        detalle: parseError.message,
      });
    }

    // Llamar al servicio
    const productoCreado = await crearProductoConArchivo(datosProducto, archivo);
    return res.status(201).json(productoCreado);
  } catch (error) {
    if (error instanceof ErrorAdminProductos) {
      return res.status(error.codigoHTTP).json({
        message: error.message,
        detalle: error.detalle || undefined,
      });
    }
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


// Función eliminarProductoController(req, res) controlador que elimina un producto (DELETE /admin/productos/:id)
const eliminarProductoController = async (req, res) => {
  try {
    const id_producto = Number(req.params.id);
    const resultado = await eliminarProducto(id_producto);
    return res.status(200).json(resultado);
  } catch (error) {
    if (error instanceof ErrorAdminProductos) {
      return res.status(error.codigoHTTP).json({
        message: error.message,
        detalle: error.detalle || undefined,
      });
    }
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


// Exporta todas las funciones controlador para que se puedan usar en las rutas y sean accesibles desde otros archivos
module.exports = {
  crearProductoController,
  actualizarProductoController,
  cambiarEstadoController,
  listarProductosController,
  crearProductoUploadController,
  eliminarProductoController,
};