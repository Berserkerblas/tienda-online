// ================================================
// SERVICIO DE ADMINISTRACIÓN DE PRODUCTOS  
// backend/src/services/admin.productos.service.js
// ================================================
// Este archivo contiene la lógica de negocio para gestionar productos (admin):
// - ErrorAdminProductos: Clase personalizada para errores de negocio
// - validarProducto(): Valida todos los campos de un producto
// - crearProducto(): Crea un nuevo producto en BD
// - actualizarProducto(): Actualiza todos los datos de un producto
// - cambiarEstado(): Activa/desactiva un producto
// - listarProductos(): Lista productos con filtros y paginación

const { conectarBBDD } = require("../db/conexionBBDD.js");

// Funcion ErrorAdminProductos - Clase de error personalizada para manejar errores de negocio en productos.
class ErrorAdminProductos extends Error {
  constructor(mensaje, codigoHTTP = 400, detalle = null) {
    super(mensaje);
    this.codigoHTTP = codigoHTTP;  
    this.detalle = detalle;        
  }
}

// Funcion esNumeroValido - Valida que un valor sea un número finito (no NaN, no Infinity)
function esNumeroValido(valor) {
  return typeof valor === "number" && Number.isFinite(valor);
}

// Funcion validarProducto - Valida que los datos de un producto sean correctos para creación o actualización.
function validarProducto(datosProducto) {
  const {
    id_categoria,
    nombre,
    descripcion,
    precio,
    stock,
    imagen,
    activo,
  } = datosProducto;

  if (!Number.isInteger(id_categoria) || id_categoria <= 0) {
    throw new ErrorAdminProductos("id_categoria inválido.", 400);
  }

  if (typeof nombre !== "string" || nombre.trim().length < 2 || nombre.trim().length > 150) {
    throw new ErrorAdminProductos("El nombre debe tener entre 2 y 150 caracteres.", 400);
  }

  if (descripcion != null && typeof descripcion !== "string") {
    throw new ErrorAdminProductos("La descripción debe ser texto.", 400);
  }

  if (!esNumeroValido(precio) || precio <= 0) {
    throw new ErrorAdminProductos("El precio debe ser un número mayor que 0.", 400);
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new ErrorAdminProductos("El stock debe ser un entero mayor o igual que 0.", 400);
  }

  if (imagen != null && typeof imagen !== "string") {
    throw new ErrorAdminProductos("La imagen debe ser una cadena (nombre de archivo o URL).", 400);
  }

  if (!(activo === 0 || activo === 1)) {
    throw new ErrorAdminProductos("El campo activo debe ser 0 o 1.", 400);
  }

  // Retorna objeto normalizado
  return {
    id_categoria,
    nombre: nombre.trim(),           
    descripcion: descripcion ?? null, 
    precio,
    stock,
    imagen: imagen ?? null,           
    activo,
  };
}


// Verifica si existe una categoría con el ID especificado
async function comprobarCategoriaExiste(conexion, id_categoria) {
  const [filas] = await conexion.execute(
    "SELECT id_categoria FROM categorias WHERE id_categoria = ? LIMIT 1",
    [id_categoria]
  );
  return filas.length > 0;
}

// Verifica si existe un producto con el ID especificado
async function comprobarProductoExiste(conexion, id_producto) {
  const [filas] = await conexion.execute(
    "SELECT id_producto FROM productos WHERE id_producto = ? LIMIT 1",
    [id_producto]
  );
  return filas.length > 0;
}

// Verifica que el nombre del producto esté disponible (no exista otro con ese nombre)
async function comprobarNombreProductoDisponible(conexion, nombre, id_producto_excluir = null) {
  if (id_producto_excluir) {
    // Al actualizar, permite que el producto mantenga su propio nombre
    const [filas] = await conexion.execute(
      "SELECT id_producto FROM productos WHERE nombre = ? AND id_producto <> ? LIMIT 1",
      [nombre, id_producto_excluir]
    );
    return filas.length === 0;
  }

  // Al crear, verifica que no exista ningún producto con ese nombre
  const [filas] = await conexion.execute(
    "SELECT id_producto FROM productos WHERE nombre = ? LIMIT 1",
    [nombre]
  );
  return filas.length === 0;
}

// Función crearProducto - Crea un nuevo producto en la base de datos.
async function crearProducto(datosProducto) {
  // Validarã todos los campos del producto
  const producto = validarProducto(datosProducto);
  const conexion = await conectarBBDD();

  try {
    const categoriaExiste = await comprobarCategoriaExiste(conexion, producto.id_categoria);
    if (!categoriaExiste) {
      throw new ErrorAdminProductos("La categoría indicada no existe.", 404);
    }
    const nombreDisponible = await comprobarNombreProductoDisponible(conexion, producto.nombre);
    if (!nombreDisponible) {
      throw new ErrorAdminProductos("Ya existe un producto con ese nombre.", 400);
    }

    // Insertar el producto en la BD
    const [resultado] = await conexion.execute(
      `
      INSERT INTO productos
        (id_categoria, nombre, descripcion, precio, stock, imagen, activo)
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        producto.id_categoria,
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.stock,
        producto.imagen,
        producto.activo,
      ]
    );

    // Retorna el producto creado con su ID autogenerado
    return {
      id_producto: resultado.insertId,
      ...producto,
    };
  } catch (error) {
    if (error instanceof ErrorAdminProductos) throw error;
    throw new ErrorAdminProductos("Error interno al crear el producto.", 500, error.message);
  } finally {
    // Cerrar conexión
    await conexion.end();
  }
}

// Funcion actualizarProducto - Actualiza todos los datos de un producto existente.
async function actualizarProducto(id_producto, datosProducto) {
  // Validar que el ID sea un entero positivo
  if (!Number.isInteger(id_producto) || id_producto <= 0) {
    throw new ErrorAdminProductos("ID de producto inválido.", 400);
  }

  // Validar todos los campos del producto
  const producto = validarProducto(datosProducto);
  const conexion = await conectarBBDD();

  try {
    const existe = await comprobarProductoExiste(conexion, id_producto);
    if (!existe) {
      throw new ErrorAdminProductos("Producto no encontrado.", 404);
    }

    const categoriaExiste = await comprobarCategoriaExiste(conexion, producto.id_categoria);
    if (!categoriaExiste) {
      throw new ErrorAdminProductos("La categoría indicada no existe.", 404);
    }

    const nombreDisponible = await comprobarNombreProductoDisponible(conexion, producto.nombre, id_producto);
    if (!nombreDisponible) {
      throw new ErrorAdminProductos("Ya existe otro producto con ese nombre.", 400);
    }

    // Actualizar el producto en la BD
    await conexion.execute(
      `
      UPDATE productos
      SET id_categoria = ?, nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen = ?, activo = ?
      WHERE id_producto = ?
      `,
      [
        producto.id_categoria,
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.stock,
        producto.imagen,
        producto.activo,
        id_producto,
      ]
    );

    return { id_producto, ...producto };
  } catch (error) {
    if (error instanceof ErrorAdminProductos) throw error;
    throw new ErrorAdminProductos("Error interno al actualizar el producto.", 500, error.message);
  } finally {
    // Cerrar conexión
    await conexion.end();
  }
}

// Funcion cambiarEstado - Activa o desactiva un producto (campo activo).
async function cambiarEstado(id_producto, activo) {
  
  if (!Number.isInteger(id_producto) || id_producto <= 0) {
    throw new ErrorAdminProductos("ID de producto inválido.", 400);
  }

  if (!(activo === 0 || activo === 1)) {
    throw new ErrorAdminProductos("El campo activo debe ser 0 o 1.", 400);
  }

  const conexion = await conectarBBDD();

  try {
    const existe = await comprobarProductoExiste(conexion, id_producto);
    if (!existe) {
      throw new ErrorAdminProductos("Producto no encontrado.", 404);
    }

    await conexion.execute(
      "UPDATE productos SET activo = ? WHERE id_producto = ?",
      [activo, id_producto]
    );

    return { id_producto, activo };
  } catch (error) {
  
    if (error instanceof ErrorAdminProductos) throw error;
    throw new ErrorAdminProductos("Error interno al cambiar el estado.", 500, error.message);
  } finally {
    // Cerrar conexión
    await conexion.end();
  }
}

// Función listarProductos - Devuelve listado de productos (activos e inactivos) para el panel admin.
async function listarProductos({ busqueda, id_categoria, activo, pagina = 1, limite = 20 }) {
  const conexion = await conectarBBDD();

  try {
    // Normalización de paginación
    const paginaNumero = Number(pagina);
    const limiteNumero = Number(limite);

    const paginaSegura = Number.isInteger(paginaNumero) && paginaNumero > 0 ? paginaNumero : 1;
    const limiteSeguro =
      Number.isInteger(limiteNumero) && limiteNumero > 0 && limiteNumero <= 50 ? limiteNumero : 20;

    const offset = (paginaSegura - 1) * limiteSeguro;

    let consulta = `
      SELECT
        id_producto,
        id_categoria,
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        activo,
        fecha_creacion
      FROM productos
      WHERE 1=1
    `;

    const valores = [];

    // Filtro por búsqueda (nombre)
    if (busqueda && String(busqueda).trim() !== "") {
      consulta += ` AND nombre LIKE ?`;
      valores.push(`%${String(busqueda).trim()}%`);
    }

    // Filtro por categoría
    if (id_categoria !== undefined && id_categoria !== null && id_categoria !== "") {
      const idCategoriaNumero = Number(id_categoria);
      if (Number.isInteger(idCategoriaNumero) && idCategoriaNumero > 0) {
        consulta += ` AND id_categoria = ?`;
        valores.push(idCategoriaNumero);
      }
    }

    // Filtro por activo (0/1)
    if (activo !== undefined && activo !== null && activo !== "") {
      const activoNumero = Number(activo);
      if (activoNumero === 0 || activoNumero === 1) {
        consulta += ` AND activo = ?`;
        valores.push(activoNumero);
      }
    }

    consulta += ` ORDER BY fecha_creacion DESC`;
    consulta += ` LIMIT ${limiteSeguro} OFFSET ${offset}`;

    const [filas] = await conexion.execute(consulta, valores);
    return filas;
  } catch (error) {
    // Mantener mismo estilo de error que el resto del service
    throw new ErrorAdminProductos("Error interno al listar productos (admin).", 500, error.message);
  } finally {
    await conexion.end();
  }
}

// Función eliminarProducto - Elimina un producto de la base de datos.
async function eliminarProducto(id_producto) {
  if (!Number.isInteger(id_producto) || id_producto <= 0) {
    throw new ErrorAdminProductos("ID de producto inválido.", 400);
  }

  const conexion = await conectarBBDD();

  try {
    const existe = await comprobarProductoExiste(conexion, id_producto);
    if (!existe) {
      throw new ErrorAdminProductos("Producto no encontrado.", 404);
    }

    // Eliminar el producto de la BD
    await conexion.execute(
      "DELETE FROM productos WHERE id_producto = ?",
      [id_producto]
    );

    return { id_producto, mensaje: "Producto eliminado correctamente" };
  } catch (error) {
    if (error instanceof ErrorAdminProductos) throw error;
    throw new ErrorAdminProductos("Error interno al eliminar el producto.", 500, error.message);
  } finally {
    await conexion.end();
  }
}

// ================================================
// FUNCIÓN: crearProductoConArchivo
// ================================================
// Crea un nuevo producto con carga de archivo de imagen
// 1. Valida datos del producto
// 2. Guarda archivo en backend/public/productos/
// 3. Inserta producto en BD
// 4. Si falla BD: elimina archivo (rollback)

const fs = require("fs").promises;
const path = require("path");

async function crearProductoConArchivo(datosProducto, archivoData) {
  // Validar que los datos existan
  if (!datosProducto || !archivoData) {
    throw new ErrorAdminProductos("Datos de producto o archivo faltantes.", 400);
  }

  // Validar producto (mismo proceso que crearProducto)
  const producto = validarProducto(datosProducto);

  // Extraer nombre de archivo
  const nombreArchivo = archivoData.name.toLowerCase();

  // Ruta destino: backend/public/productos/nombreArchivo
  const rutaDestino = path.join(__dirname, "..", "..", "public", "productos", nombreArchivo);

  const conexion = await conectarBBDD();

  try {
    // Verificar que la categoría existe
    const categoriaExiste = await comprobarCategoriaExiste(conexion, producto.id_categoria);
    if (!categoriaExiste) {
      throw new ErrorAdminProductos("La categoría indicada no existe.", 404);
    }

    // Verificar que el nombre del producto está disponible
    const nombreDisponible = await comprobarNombreProductoDisponible(conexion, producto.nombre);
    if (!nombreDisponible) {
      throw new ErrorAdminProductos("Ya existe un producto con ese nombre.", 400);
    }

    // Guardar archivo en disco
    await archivoData.mv(rutaDestino);

    // Insertar producto en BD (con nombre de archivo como imagen)
    const productoConImagen = {
      ...producto,
      imagen: nombreArchivo, // Guardar solo el nombre del archivo
    };

    const [resultado] = await conexion.execute(
      `
      INSERT INTO productos
        (id_categoria, nombre, descripcion, precio, stock, imagen, activo)
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        productoConImagen.id_categoria,
        productoConImagen.nombre,
        productoConImagen.descripcion,
        productoConImagen.precio,
        productoConImagen.stock,
        productoConImagen.imagen,
        productoConImagen.activo,
      ]
    );

    // Retorna el producto creado con su ID autogenerado
    return {
      id_producto: resultado.insertId,
      ...productoConImagen,
    };
  } catch (error) {
    // Si algo falla despues de guardar el archivo, eliminarlo (rollback)
    try {
      await fs.unlink(rutaDestino);
    } catch (unlinkError) {
      console.error("Error al eliminar archivo durante rollback:", unlinkError.message);
    }

    // Relanzar error
    if (error instanceof ErrorAdminProductos) throw error;
    throw new ErrorAdminProductos("Error interno al crear el producto con archivo.", 500, error.message);
  } finally {
    await conexion.end();
  }
}

module.exports = {
  ErrorAdminProductos,
  crearProducto,
  actualizarProducto,
  cambiarEstado,
  listarProductos,
  crearProductoConArchivo,
};