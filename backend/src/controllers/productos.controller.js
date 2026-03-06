// backend/src/controllers/productos.controller.js
// Gestiona las peticiones HTTP relacionadas con productos (listado y detalle)

const productosService = require('../services/productos.service');

// Funcion listarProductos - Permite obtener un listado de productos con filtros opcionales y paginación.
const listarProductos = async (req, res) => {
  try {
    // Extrae parámetros de filtrado desde la query string (req.query)
    const {
      busqueda,              
      id_categoria,          
      orden_precio,          
      precio_minimo,         
      precio_maximo,
      solo_con_stock,
      pagina,
      limite                 
    } = req.query;

    // PAGINACIÓN: Normaliza y valida los parámetros de paginación, por defcto página 1 y límite 10.
    const paginaNumero = Number(pagina ?? 1);
    const limiteNumero = Number(limite ?? 10);

    // Validación: página debe ser un entero positivo, sino usa 1
    const paginaSegura =
      Number.isInteger(paginaNumero) && paginaNumero > 0 ? paginaNumero : 1;

    // Validación: límite debe ser entero positivo y máximo 50 productos por página
    const limiteSeguro =
      Number.isInteger(limiteNumero) && limiteNumero > 0 && limiteNumero <= 50
        ? limiteNumero
        : 10;

    // Llama al service para obtener los productos filtrados y paginados
    const { productos, total } = await productosService.obtenerProductos({
      busqueda,
      id_categoria: id_categoria ? Number(id_categoria) : undefined,
      orden_precio,
      precio_minimo,
      precio_maximo,
      solo_con_stock,
      pagina: paginaSegura,
      limite: limiteSeguro,
    });

    // Devuelve array de productos con metadatos de paginación
    // Si todo ha ido bien,200 = OK (lista obtenida correctamente)
    return res.status(200).json({
      pagina: paginaSegura,
      limite: limiteSeguro,
      total,
      total_devuelto: productos.length,
      productos,
    });
  } catch (error) {
    // Error inesperado en BD o service
    console.error('Error en listarProductos:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Funcion obtenerProducto - Permite obtener el detalle de un producto por su ID.
const obtenerProducto = async (req, res) => {
  try {
    // Extrae el ID del producto desde la URL (req.params.id)
    const id_producto = Number(req.params.id);

    // VALIDACIÓN: ID debe ser un número entero positivo
    if (!Number.isInteger(id_producto) || id_producto <= 0) {
      return res.status(400).json({ mensaje: 'id inválido' });
    }

    // Busca el producto en la BD a través del service
    const producto = await productosService.obtenerProductoPorId(id_producto);

    // Si no existe o no está activo, devuelve 404
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Devuelve el producto encontrado
    // 200 = OK (producto encontrado)
    return res.status(200).json(producto);
  } catch (error) {
    // Error inesperado en BD o service
    console.error('Error en obtenerProducto:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  listarProductos,
  obtenerProducto,
};