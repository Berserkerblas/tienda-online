// ================================================
// SERVICIO DE PRODUCTOS PÚBLICOS  
// backend/src/services/productos.service.js
// ================================================
// Este archivo contiene la lógica de negocio para el catálogo público de productos:
// - obtenerProductos(): Lista productos activos con filtros y paginación
// - obtenerProductoPorId(): Obtiene un producto activo por su ID

const { conectarBBDD } = require('../db/conexionBBDD');

// Función obtenerProductos - Permite obtener un listado de productos activos con filtros opcionales y paginación.
const obtenerProductos = async ({
  busqueda,
  id_categoria,
  precio_minimo,
  precio_maximo,
  solo_con_stock,
  orden_precio,
  pagina = 1,
  limite = 10
}) => {
  const conexion = await conectarBBDD();

  try {
    // NORMALIZACIÓN Y VALIDACIÓN DE PAGINACIÓN
    const paginaNumero = Number(pagina);
    const limiteNumero = Number(limite);

    // Página debe ser entero positivo, sino usa 1
    const paginaSegura =
      Number.isInteger(paginaNumero) && paginaNumero > 0 ? paginaNumero : 1;

    // Límite debe ser entero positivo y máximo 20 productos por página
    const limiteSeguro =
      Number.isInteger(limiteNumero) && limiteNumero > 0 && limiteNumero <= 20
        ? limiteNumero
        : 10;

    // Calcular offset para paginación
    const offset = (paginaSegura - 1) * limiteSeguro;

    // Consulta base: solo productos activos (activo = 1)
    let consulta = `
      SELECT
        id_producto,
        id_categoria,
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        fecha_creacion
      FROM productos
      WHERE activo = 1
    `;

    const valores = [];

    // FILTRO 1: Búsqueda por nombre (LIKE con wildcards)
    if (busqueda && String(busqueda).trim() !== '') {
      consulta += ` AND nombre LIKE ?`;
      valores.push(`%${String(busqueda).trim()}%`);
    }

    // FILTRO 2: Filtro por categoría (exacto)
    if (id_categoria !== undefined && id_categoria !== null && id_categoria !== '') {
      const idCategoriaNumero = Number(id_categoria);
      if (Number.isInteger(idCategoriaNumero) && idCategoriaNumero > 0) {
        consulta += ` AND id_categoria = ?`;
        valores.push(idCategoriaNumero);
      }
    }

    // FILTRO 3: Solo productos con stock disponible
    const soloConStockNormalizado = String(solo_con_stock ?? '').toLowerCase();
    const quiereSoloConStock =
      soloConStockNormalizado === 'true' || soloConStockNormalizado === '1';

    if (quiereSoloConStock) {
      consulta += ` AND stock > 0`;
    }

    // FILTRO 4: Rango de precio (mínimo y/o máximo)
    const precioMinimoNumero =
      precio_minimo !== undefined && precio_minimo !== null && precio_minimo !== ''
        ? Number(precio_minimo)
        : null;

    const precioMaximoNumero =
      precio_maximo !== undefined && precio_maximo !== null && precio_maximo !== ''
        ? Number(precio_maximo)
        : null;

    if (precioMinimoNumero !== null && Number.isFinite(precioMinimoNumero) && precioMinimoNumero >= 0) {
      consulta += ` AND precio >= ?`;
      valores.push(precioMinimoNumero);
    }

    if (precioMaximoNumero !== null && Number.isFinite(precioMaximoNumero) && precioMaximoNumero >= 0) {
      consulta += ` AND precio <= ?`;
      valores.push(precioMaximoNumero);
    }

    // ORDENACIÓN
    const ordenPrecioNormalizado = String(orden_precio ?? '').toLowerCase();

    if (ordenPrecioNormalizado === 'asc') {
      // Orden estable: desempata por id_producto para evitar saltos entre páginas
      consulta += ` ORDER BY precio ASC, id_producto DESC`;
    } else if (ordenPrecioNormalizado === 'desc') {
      // Orden estable: desempata por id_producto para evitar saltos entre páginas
      consulta += ` ORDER BY precio DESC, id_producto DESC`;
    } else {
      // Por defecto: productos más recientes primero
      consulta += ` ORDER BY fecha_creacion DESC, id_producto DESC`;
    }

    // Contar total de productos ANTES de aplicar LIMIT/OFFSET
    let consultaTotal = `SELECT COUNT(*) as total FROM productos WHERE activo = 1`;
    
    // Aplicar los mismos filtros para contar correctamente
    if (busqueda && String(busqueda).trim() !== '') {
      consultaTotal += ` AND nombre LIKE ?`;
    }
    if (id_categoria !== undefined && id_categoria !== null && id_categoria !== '') {
      const idCategoriaNumero = Number(id_categoria);
      if (Number.isInteger(idCategoriaNumero) && idCategoriaNumero > 0) {
        consultaTotal += ` AND id_categoria = ?`;
      }
    }
    if (quiereSoloConStock) {
      consultaTotal += ` AND stock > 0`;
    }
    if (precioMinimoNumero !== null && Number.isFinite(precioMinimoNumero) && precioMinimoNumero >= 0) {
      consultaTotal += ` AND precio >= ?`;
    }
    if (precioMaximoNumero !== null && Number.isFinite(precioMaximoNumero) && precioMaximoNumero >= 0) {
      consultaTotal += ` AND precio <= ?`;
    }

    const [countResult] = await conexion.execute(consultaTotal, valores);
    const totalProductos = countResult[0]?.total || 0;

    // PAGINACIÓN
    // LIMIT y OFFSET se incrustan directamente (ya validados como enteros seguros)
    consulta += ` LIMIT ${limiteSeguro} OFFSET ${offset}`;

    // Ejecutar consulta y retornar resultados
    const [resultados] = await conexion.execute(consulta, valores);
    return {
      productos: resultados,
      total: totalProductos
    };
  } finally {
    // Cerrar conexión
    await conexion.end();
  }
};

// Función obtenerProductoPorId - Permite obtener el detalle de un producto activo por su ID.
const obtenerProductoPorId = async (id_producto) => {
  const conexion = await conectarBBDD();

  try {
    // Convertir y validar ID
    const idNumero = Number(id_producto);

    // Si el ID no es válido, devolver null (no existe)
    if (!Number.isInteger(idNumero) || idNumero <= 0) {
      return null;
    }

    // Consultar producto por ID (solo si está activo)
    const consulta = `
      SELECT
        id_producto,
        id_categoria,
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        fecha_creacion
      FROM productos
      WHERE id_producto = ? AND activo = 1
    `;

    const [resultados] = await conexion.execute(consulta, [idNumero]);
    
    // Devolver el primer resultado o null si no se encontró
    return resultados[0] || null;
  } finally {
    // Cerrar conexión
    await conexion.end();
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
};