// ================================================
// SERVICIO DE PEDIDOS  
// backend/src/services/pedidos.service.js
// ================================================
// Este archivo contiene la lógica de negocio para gestión de pedidos:
// - ErrorPedido: Clase personalizada para errores de negocio
// - validarYNormalizarLineas(): Valida y consolida líneas de pedido
// - crearPedidoEnTransaccion(): Crea pedido completo con transacción (bloqueo de stock)
// - obtenerPedidosDelUsuario(): Lista todos los pedidos del usuario
// - obtenerDetallePedidoDelUsuario(): Obtiene detalle completo de un pedido

const { conectarBBDD } = require("../db/conexionBBDD.js");

// ================================================
// CLASE: ErrorPedido
// ================================================
// Clase de error personalizada para manejar errores de negocio en pedidos.
// Incluye código HTTP y detalle opcional.
class ErrorPedido extends Error {
  constructor(mensaje, codigoHTTP = 400, detalle = null) {
    super(mensaje);
    this.codigoHTTP = codigoHTTP;  // Código HTTP (400, 401, 404, 409, 500, etc.)
    this.detalle = detalle;        // Detalle adicional del error (opcional)
  }
}

// ================================================
// FUNCIÓN: validarYNormalizarLineas
// ================================================
// Valida y normaliza las líneas del pedido (array de productos con cantidad).
// Consolida duplicados: si el mismo producto aparece varias veces, suma las cantidades.
// Esto respeta la restricción UNIQUE (id_pedido, id_producto) en la tabla lineas_pedido.
// Retorna array de líneas consolidadas: [{ id_producto, cantidad }]
function validarYNormalizarLineas(lineas) {
  // Validar que lineas sea un array con al menos un producto
  if (!Array.isArray(lineas) || lineas.length === 0) {
    throw new ErrorPedido("El pedido debe incluir al menos un producto.", 400);
  }

  // Normalizar: convertir todos los valores a números
  const lineasNormalizadas = lineas.map((linea) => ({
    id_producto: Number(linea.id_producto),
    cantidad: Number(linea.cantidad),
  }));

  // Validar cada línea
  for (const linea of lineasNormalizadas) {
    // id_producto debe ser entero positivo
    if (!Number.isInteger(linea.id_producto) || linea.id_producto <= 0) {
      throw new ErrorPedido("id_producto inválido.", 400);
    }
    // cantidad debe ser entero positivo
    if (!Number.isInteger(linea.cantidad) || linea.cantidad <= 0) {
      throw new ErrorPedido("La cantidad debe ser un entero mayor que 0.", 400);
    }
  }

  // CONSOLIDACIÓN DE DUPLICADOS
  // Si el cliente envía: [{ id: 1, cant: 2 }, { id: 1, cant: 3 }]
  // Se consolida en: [{ id: 1, cant: 5 }]
  const mapaCantidades = new Map();
  for (const linea of lineasNormalizadas) {
    const cantidadActual = mapaCantidades.get(linea.id_producto) || 0;
    mapaCantidades.set(linea.id_producto, cantidadActual + linea.cantidad);
  }

  // Convierte el mapa en array de líneas consolidadas
  return Array.from(mapaCantidades.entries()).map(([id_producto, cantidad]) => ({
    id_producto,
    cantidad,
  }));
}

// ================================================
// FUNCIÓN: crearPedidoEnTransaccion
// ================================================
// Crea un pedido completo usando una transacción de BD para garantizar consistencia.
// 
// FLUJO DE LA TRANSACCIÓN:
// 1. Bloquea los productos (FOR UPDATE) para evitar sobreventa
// 2. Valida que los productos existan, estén activos y tengan stock suficiente
// 3. Calcula el total del pedido en backend (nunca confiar en el cliente)
// 4. Inserta la cabecera del pedido
// 5. Inserta las líneas del pedido con precio_unitario histórico
// 6. Descuenta el stock de los productos
// 7. Hace COMMIT si todo ok, o ROLLBACK si hay error
//
// IMPORTANTE: Usa FOR UPDATE para bloquear las filas y evitar condiciones de carrera
// (dos usuarios comprando el último producto al mismo tiempo)
async function crearPedidoEnTransaccion({
  id_usuario,
  nombre_envio,
  direccion_envio,
  ciudad_envio,
  cp_envio,
  lineas,
}) {
  // VALIDACIÓN 1: Usuario debe estar autenticado
  if (!id_usuario) {
    throw new ErrorPedido("Usuario no autenticado.", 401);
  }

  // VALIDACIÓN 2: Datos de envío obligatorios
  if (!nombre_envio || !direccion_envio || !ciudad_envio || !cp_envio) {
    throw new ErrorPedido("Faltan datos de envío obligatorios.", 400);
  }

  // Validar y consolidar líneas del pedido
  const lineasNormalizadas = validarYNormalizarLineas(lineas);
  const listaIdsProductos = lineasNormalizadas.map((l) => l.id_producto);

  const conexion = await conectarBBDD();

  try {
    // INICIO DE LA TRANSACCIÓN
    // A partir de aquí, todos los cambios son temporales hasta hacer COMMIT
    await conexion.beginTransaction();

    // PASO 1: BLOQUEAR PRODUCTOS (FOR UPDATE)
    // Selecciona los productos y los BLOQUEA hasta finalizar la transacción
    // Esto evita que otro usuario modifique el stock mientras procesamos este pedido
    const placeholders = listaIdsProductos.map(() => "?").join(",");

    const [productosBloqueados] = await conexion.execute(
      `
      SELECT id_producto, precio, stock, activo
      FROM productos
      WHERE id_producto IN (${placeholders})
      FOR UPDATE
      `,
      listaIdsProductos
    );

    // Verificar que todos los productos existen
    if (productosBloqueados.length !== listaIdsProductos.length) {
      throw new ErrorPedido("Algún producto no existe.", 404);
    }

    // Crear mapa para acceso rápido por ID
    const mapaProductosPorId = new Map(
      productosBloqueados.map((p) => [p.id_producto, p])
    );

    // PASO 2: VALIDAR PRODUCTOS Y CALCULAR TOTAL
    let totalCalculado = 0;

    for (const linea of lineasNormalizadas) {
      const producto = mapaProductosPorId.get(linea.id_producto);

      // Verificar que el producto existe (por si acaso)
      if (!producto) {
        throw new ErrorPedido("Algún producto no existe.", 404);
      }

      // VALIDACIÓN: Producto debe estar activo
      const estaActivo = producto.activo === 1 || producto.activo === true;
      if (!estaActivo) {
        throw new ErrorPedido("Algún producto está inactivo.", 404);
      }

      // VALIDACIÓN: Stock suficiente
      if (Number(producto.stock) < linea.cantidad) {
        throw new ErrorPedido(
          `Stock insuficiente para el producto ${linea.id_producto}.`,
          409  // 409 = Conflict (conflicto de stock)
        );
      }

      // Calcular subtotal: precio * cantidad
      totalCalculado += Number(producto.precio) * linea.cantidad;
    }

    // Redondear total a 2 decimales
    totalCalculado = Math.round(totalCalculado * 100) / 100;

    // PASO 3: INSERTAR CABECERA DEL PEDIDO
    // Crea el registro principal del pedido con datos de envío y total calculado
    const [resultadoInsercionPedido] = await conexion.execute(
      `
      INSERT INTO pedidos
        (id_usuario, nombre_envio, direccion_envio, ciudad_envio, cp_envio, total, estado)
      VALUES
        (?, ?, ?, ?, ?, ?, 'pendiente')
      `,
      [
        id_usuario,
        nombre_envio,
        direccion_envio,
        ciudad_envio,
        cp_envio,
        totalCalculado,
      ]
    );

    const id_pedido_generado = resultadoInsercionPedido.insertId;

    // PASO 4: INSERTAR LÍNEAS DEL PEDIDO
    // Guarda cada producto con su cantidad y precio_unitario histórico
    // IMPORTANTE: precio_unitario se guarda aquí para mantener historial
    // (si el producto cambia de precio después, el pedido mantiene el precio original)
    for (const linea of lineasNormalizadas) {
      const producto = mapaProductosPorId.get(linea.id_producto);

      await conexion.execute(
        `
        INSERT INTO lineas_pedido
          (id_pedido, id_producto, cantidad, precio_unitario)
        VALUES
          (?, ?, ?, ?)
        `,
        [id_pedido_generado, linea.id_producto, linea.cantidad, producto.precio]
      );
    }

    // PASO 5: DESCONTAR STOCK DE LOS PRODUCTOS
    // Actualiza el stock de cada producto restando la cantidad comprada
    for (const linea of lineasNormalizadas) {
      await conexion.execute(
        `
        UPDATE productos
        SET stock = stock - ?
        WHERE id_producto = ?
        `,
        [linea.cantidad, linea.id_producto]
      );
    }

    // PASO 6: CONFIRMAR TRANSACCIÓN (COMMIT)
    // Si llegamos aquí sin errores, confirma todos los cambios permanentemente
    await conexion.commit();

    // Retornar resultado exitoso
    return {
      id_pedido: id_pedido_generado,
      total: totalCalculado,
      estado: "pendiente",
    };
  } catch (error) {
    // Si hubo cualquier error, DESHACER todos los cambios (ROLLBACK)
    // Esto garantiza que la BD no quede en un estado inconsistente
    await conexion.rollback();

    // Si es un error de negocio controlado, relanzarlo
    if (error instanceof ErrorPedido) {
      throw error;
    }

    // Si llega un error de clave duplicada (muy raro después de consolidación)
    if (error && error.code === "ER_DUP_ENTRY") {
      throw new ErrorPedido("Producto duplicado en líneas de pedido.", 400);
    }

    // Cualquier otro error inesperado
    throw new ErrorPedido("Error interno al crear el pedido.", 500, error.message);
  } finally {
    // SIEMPRE cerrar la conexión
    await conexion.end();
  }
}

// ================================================
// FUNCIÓN: obtenerPedidosDelUsuario
// ================================================
// Devuelve todos los pedidos del usuario autenticado (solo cabeceras).
// No incluye las líneas de productos, solo información general de cada pedido.
// Ordena por fecha descendente (más reciente primero).
async function obtenerPedidosDelUsuario(id_usuario) {
  // Validar que el usuario esté autenticado
  if (!id_usuario) {
    throw new ErrorPedido("Usuario no autenticado.", 401);
  }

  const conexion = await conectarBBDD();

  try {
    // Consultar todos los pedidos del usuario
    // Solo devuelve: id, fecha, total y estado (sin líneas de productos)
    const [pedidos] = await conexion.execute(
      `
      SELECT id_pedido, fecha_pedido, total, estado
      FROM pedidos
      WHERE id_usuario = ?
      ORDER BY fecha_pedido DESC
      `,
      [id_usuario]
    );

    return pedidos;
  } catch (error) {
    throw new ErrorPedido("Error al obtener los pedidos del usuario.", 500, error.message);
  } finally {
    await conexion.end();
  }
}

// ================================================
// FUNCIÓN: obtenerDetallePedidoDelUsuario
// ================================================
// Devuelve el detalle completo de un pedido (cabecera + líneas con productos).
// SEGURIDAD: Solo devuelve el pedido si pertenece al usuario autenticado.
// Si el pedido no existe o no pertenece al usuario, devuelve 404.
async function obtenerDetallePedidoDelUsuario(id_usuario, id_pedido) {
  // Validar que el usuario esté autenticado
  if (!id_usuario) {
    throw new ErrorPedido("Usuario no autenticado.", 401);
  }

  // Validar que el ID del pedido sea válido
  if (!Number.isInteger(Number(id_pedido)) || Number(id_pedido) <= 0) {
    throw new ErrorPedido("ID de pedido inválido.", 400);
  }

  const conexion = await conectarBBDD();

  try {
    // PASO 1: Obtener cabecera del pedido
    // Verifica que el pedido exista Y pertenezca al usuario (seguridad)
    const [cabecera] = await conexion.execute(
      `
      SELECT id_pedido, nombre_envio, direccion_envio, ciudad_envio, cp_envio,
             fecha_pedido, total, estado
      FROM pedidos
      WHERE id_pedido = ? AND id_usuario = ?
      `,
      [id_pedido, id_usuario]
    );

    // Si no se encontró, el pedido no existe o no pertenece al usuario
    // Ambos casos devuelven 404 para no filtrar información (seguridad)
    if (cabecera.length === 0) {
      throw new ErrorPedido("Pedido no encontrado.", 404);
    }

    // PASO 2: Obtener líneas del pedido con información de productos
    // JOIN con productos para obtener nombre e imagen (info útil para el frontend)
    const [lineas] = await conexion.execute(
      `
      SELECT lp.id_linea,
             lp.id_producto,
             p.nombre,
             p.imagen,
             lp.cantidad,
             lp.precio_unitario
      FROM lineas_pedido lp
      JOIN productos p ON p.id_producto = lp.id_producto
      WHERE lp.id_pedido = ?
      ORDER BY lp.id_linea ASC
      `,
      [id_pedido]
    );

    // Retornar cabecera + líneas en un solo objeto
    return {
      ...cabecera[0],
      lineas,
    };
  } catch (error) {
    // Si es un error de negocio controlado, relanzarlo
    if (error instanceof ErrorPedido) {
      throw error;
    }

    // Cualquier otro error inesperado
    throw new ErrorPedido("Error al obtener el detalle del pedido.", 500, error.message);
  } finally {
    await conexion.end();
  }
}

module.exports = {
  ErrorPedido,
  crearPedidoEnTransaccion,
  obtenerPedidosDelUsuario,
  obtenerDetallePedidoDelUsuario,
};