// backend/src/controllers/pedidos.controller.js
// Este archivo contiene los controladores relacionados con los pedidos.

// Importa la librería PDFKit para generar PDFs (tickets de pedido)
const PDFDocument = require("pdfkit");

// Importa las funciones del service de pedidos backend/src/services/pedidos.service.js
const {
  crearPedidoEnTransaccion,
  obtenerPedidosDelUsuario,
  obtenerDetallePedidoDelUsuario,
  ErrorPedido,
} = require("../services/pedidos.service.js");

const {
  enviarTicketPedidoPorEmail,
  emailHabilitado,
} = require("../services/email.service.js");

// Función escapeHTML(value) para evitar inyección de HTML en los emails
function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Función generarEmailTicketHTML(pedido, usuario) para crear el contenido HTML del email con el ticket del pedido

function generarEmailTicketHTML(pedido, usuario) {
  const nombre = escapeHTML(usuario?.nombre || "cliente");
  const idPedido = escapeHTML(pedido.id_pedido);
  const fecha = escapeHTML(
    new Date(pedido.fecha_pedido).toLocaleString("es-ES")
  );
  const estado = escapeHTML(pedido.estado);
  const total = `${Number(pedido.total).toFixed(2)} €`;

  const envio = {
    nombre_envio: escapeHTML(pedido.nombre_envio),
    direccion_envio: escapeHTML(pedido.direccion_envio),
    ciudad_envio: escapeHTML(pedido.ciudad_envio),
    cp_envio: escapeHTML(pedido.cp_envio),
  };

  const filas = (pedido.lineas || [])
    .map((l) => {
      const nombreProd = escapeHTML(l.nombre);
      const cantidad = escapeHTML(l.cantidad);
      const precio = `${Number(l.precio_unitario).toFixed(2)} €`;
      const subtotal = `${(
        Number(l.precio_unitario) * Number(l.cantidad)
      ).toFixed(2)} €`;

      return `
        <tr>
          <td style="padding:10px 8px; border-top:1px solid #eee;">${nombreProd}</td>
          <td style="padding:10px 8px; border-top:1px solid #eee; text-align:center;">${cantidad}</td>
          <td style="padding:10px 8px; border-top:1px solid #eee; text-align:right; white-space:nowrap;">${precio}</td>
          <td style="padding:10px 8px; border-top:1px solid #eee; text-align:right; white-space:nowrap;">${subtotal}</td>
        </tr>
      `;
    })
    .join("");

  return `
  <div style="margin:0; padding:0; background:#f6f7fb;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb; padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px; max-width:640px; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #eee;">
            <tr>
              <td style="padding:20px 24px; background:#111827; color:#ffffff; font-family:Arial, Helvetica, sans-serif;">
                <div style="font-size:18px; font-weight:700;">Gondor</div>
                <div style="font-size:13px; opacity:0.85; margin-top:4px;">Ticket de compra y confirmación de pedido</div>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 24px; font-family:Arial, Helvetica, sans-serif; color:#111827;">
                <p style="margin:0 0 12px 0; font-size:14px;">Hola <strong>${nombre}</strong>,</p>
                <p style="margin:0 0 16px 0; font-size:14px; line-height:1.45;">
                  Gracias por tu compra. Adjuntamos el <strong>ticket en PDF</strong> correspondiente a tu pedido.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee; border-radius:10px; overflow:hidden;">
                  <tr>
                    <td style="padding:12px 14px; background:#f9fafb; font-size:13px;">
                      <strong>Pedido #${idPedido}</strong>
                    </td>
                    <td style="padding:12px 14px; background:#f9fafb; font-size:13px; text-align:right;">
                      <span style="color:#6b7280;">${fecha}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px; font-size:13px; color:#374151;">
                      Estado: <strong>${estado}</strong>
                    </td>
                    <td style="padding:12px 14px; font-size:13px; text-align:right;">
                      Total: <strong>${escapeHTML(total)}</strong>
                    </td>
                  </tr>
                </table>

                <h3 style="margin:18px 0 10px 0; font-size:14px;">Dirección de envío</h3>
                <p style="margin:0; font-size:13px; color:#374151; line-height:1.45;">
                  <strong>${envio.nombre_envio}</strong><br/>
                  ${envio.direccion_envio}<br/>
                  ${envio.ciudad_envio} (${envio.cp_envio})
                </p>

                <h3 style="margin:18px 0 10px 0; font-size:14px;">Resumen de productos</h3>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee; border-radius:10px; overflow:hidden; font-family:Arial, Helvetica, sans-serif;">
                  <thead>
                    <tr>
                      <th style="padding:10px 8px; background:#f9fafb; text-align:left; font-size:12px; color:#374151;">Producto</th>
                      <th style="padding:10px 8px; background:#f9fafb; text-align:center; font-size:12px; color:#374151;">Cant.</th>
                      <th style="padding:10px 8px; background:#f9fafb; text-align:right; font-size:12px; color:#374151;">Precio</th>
                      <th style="padding:10px 8px; background:#f9fafb; text-align:right; font-size:12px; color:#374151;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filas || `
                      <tr>
                        <td colspan="4" style="padding:12px 10px; color:#6b7280; font-size:13px;">Sin líneas</td>
                      </tr>
                    `}
                  </tbody>
                </table>

                <p style="margin:16px 0 0 0; font-size:13px; color:#6b7280; line-height:1.45;">
                  Este mensaje se ha generado automáticamente. Si tienes cualquier incidencia, puedes responder a este correo.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 24px; background:#f9fafb; font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#6b7280;">
                © ${new Date().getFullYear()} Gondor — Proyecto Final DAW
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

// Funciones auxiliares para el PDF del ticket de pedido:
function formatEUR(value) {
  return `${Number(value).toFixed(2)} €`;
}

function docAvailableHeight(doc) {
  return doc.page.height - doc.page.margins.bottom;
}

function ensureSpace(doc, neededHeight, onNewPage) {
  if (doc.y + neededHeight > docAvailableHeight(doc)) {
    doc.addPage();
    if (typeof onNewPage === "function") onNewPage();
  }
}

// Función drawHeader(doc, pedido) para dibujar la cabecera del ticket con los datos del pedido (ID, fecha, estado, datos de envío):
function drawHeader(doc, pedido) {
  const topY = doc.page.margins.top;
  const indent = 14;

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("TICKET DE COMPRA", 0, topY, { align: "center" });
  doc.moveDown(0.8);
  doc.font("Helvetica").fontSize(10).fillColor("#444");
  doc.text(`Pedido #${pedido.id_pedido}`, { indent });
  doc.text(
    `Fecha: ${new Date(pedido.fecha_pedido).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    })}`,
    { indent }
  );
  doc.text(`Estado: ${pedido.estado}`, { indent });
  doc.fillColor("#000");
  doc.moveDown(0.8);
  doc.font("Helvetica-Bold").fontSize(11).text("Datos de envío", { indent });
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(10);
  doc.text(pedido.nombre_envio, { indent });
  doc.text(pedido.direccion_envio, { indent });
  doc.text(`${pedido.ciudad_envio} (${pedido.cp_envio})`, { indent });
  doc.moveDown(0.8);
}

// Función drawTableHeader(doc, x, widths) para dibujar la cabecera de la tabla de productos
function drawTableHeader(doc, x, widths) {
  const y = doc.y;

  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Producto", x, y, { width: widths.prod });
  doc.text("Cant.", x + widths.prod, y, {
    width: widths.cant,
    align: "right",
  });
  doc.text("Precio", x + widths.prod + widths.cant, y, {
    width: widths.precio,
    align: "right",
  });
  doc.text("Subtotal", x + widths.prod + widths.cant + widths.precio, y, {
    width: widths.subtotal,
    align: "right",
  });

  doc.moveDown(0.4);
  const lineY = doc.y;
  doc
    .moveTo(x, lineY)
    .lineTo(x + widths.total, lineY)
    .strokeColor("#e5e7eb")
    .stroke();
  doc.strokeColor("#000");
  doc.moveDown(0.4);

  doc.font("Helvetica").fontSize(10);
}

// Funcion drawTicketPDF(doc, pedido) para dibujar el contenido completo del ticket de pedido en el PDF (reutiliza drawHeader y drawTableHeader)
function drawTicketPDF(doc, pedido) {
  doc.font("Helvetica");
  doc.fillColor("#000");

  drawHeader(doc, pedido);

  const x = doc.page.margins.left;
  const tableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const widths = {
    prod: Math.floor(tableWidth * 0.55),
    cant: Math.floor(tableWidth * 0.12),
    precio: Math.floor(tableWidth * 0.16),
    subtotal:
      tableWidth -
      Math.floor(tableWidth * 0.55) -
      Math.floor(tableWidth * 0.12) -
      Math.floor(tableWidth * 0.16),
  };
  widths.total = widths.prod + widths.cant + widths.precio + widths.subtotal;

  const printTableHeader = () => drawTableHeader(doc, x, widths);

  printTableHeader();

  for (const linea of pedido.lineas || []) {
    const nombre = String(linea.nombre ?? `Producto #${linea.id_producto}`);
    const cantidad = Number(linea.cantidad);
    const precio = Number(linea.precio_unitario);
    const subtotal = precio * cantidad;

    doc.font("Helvetica").fontSize(10);
    const nameHeight = doc.heightOfString(nombre, { width: widths.prod });
    const rowHeight = Math.max(16, nameHeight) + 6;

    ensureSpace(doc, rowHeight + 10, () => {
      // Nueva página: repetimos SOLO la cabecera de tabla (sin “Productos”)
      printTableHeader();
    });

    const y = doc.y;

    doc.text(nombre, x, y, { width: widths.prod });
    doc.text(String(cantidad), x + widths.prod, y, {
      width: widths.cant,
      align: "right",
    });
    doc.text(formatEUR(precio), x + widths.prod + widths.cant, y, {
      width: widths.precio,
      align: "right",
    });
    doc.text(formatEUR(subtotal), x + widths.prod + widths.cant + widths.precio, y, {
      width: widths.subtotal,
      align: "right",
    });

    doc.y = y + rowHeight;

    doc
      .moveTo(x, doc.y)
      .lineTo(x + widths.total, doc.y)
      .strokeColor("#f0f0f0")
      .stroke();
    doc.strokeColor("#000");

    doc.moveDown(0.2);
  }

  ensureSpace(doc, 60);

  doc.moveDown(0.8);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(`TOTAL: ${formatEUR(pedido.total)}`, { align: "right" });

  doc.moveDown(0.8);
  doc.font("Helvetica").fontSize(10).fillColor("#444").text(
    "Gracias por su compra.",
    { align: "center" }
  );
  doc.fillColor("#000");
}

// Función generarTicketPedidoPDFBuffer(pedido) para generar un buffer PDF del ticket de pedido (reutiliza drawTicketPDF)
function generarTicketPedidoPDFBuffer(pedido) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      drawTicketPDF(doc, pedido);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Funcion crearPedido(req, res) controlador que maneja la creación de un nuevo pedido (POST /pedidos):
async function crearPedido(req, res) {
  try {
    const id_usuario = req.user?.id_usuario;

    const { nombre_envio, direccion_envio, ciudad_envio, cp_envio, lineas } =
      req.body;

    const resultado = await crearPedidoEnTransaccion({
      id_usuario,
      nombre_envio,
      direccion_envio,
      ciudad_envio,
      cp_envio,
      lineas,
    });

    // Email (no rompe compra)
    try {
      const emailDestino = req.user?.email;

      if (emailHabilitado()) {
        if (!emailDestino) {
          console.warn(
            "[EMAIL] EMAIL_ENABLED=true pero req.user.email no existe. No se envía email."
          );
        } else {
          const pedidoDetalle = await obtenerDetallePedidoDelUsuario(
            id_usuario,
            resultado.id_pedido
          );

          const pdfBuffer = await generarTicketPedidoPDFBuffer(pedidoDetalle);

          const textFallback =
            `Hola ${req.user?.nombre || ""},\n\n` +
            `Gracias por tu compra. Adjuntamos el ticket en PDF.\n` +
            `Pedido #${pedidoDetalle.id_pedido}\n` +
            `Total: ${Number(pedidoDetalle.total).toFixed(2)} €\n\n` +
            `Gondor`;

          const html = generarEmailTicketHTML(pedidoDetalle, req.user);

          await enviarTicketPedidoPorEmail({
            to: emailDestino,
            asunto: `Ticket de compra - Pedido #${pedidoDetalle.id_pedido}`,
            text: textFallback,
            html,
            pdfBuffer,
            nombreArchivo: `ticket-pedido-${pedidoDetalle.id_pedido}.pdf`,
          });
        }
      }
    } catch (errEmail) {
      console.warn(
        "[EMAIL] Fallo enviando ticket por email (no afecta a la compra):",
        errEmail?.message || errEmail
      );
    }

    return res.status(201).json(resultado);
  } catch (error) {
    if (error instanceof ErrorPedido) {
      return res.status(error.codigoHTTP).json({
        message: error.message,
        detalle: error.detalle || undefined,
      });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Funcion listarPedidosDelUsuario(req, res) controlador que maneja la obtención de los pedidos del usuario autenticado (GET /pedidos):
async function listarPedidosDelUsuario(req, res) {
  try {
    const id_usuario = req.user?.id_usuario;
    const pedidos = await obtenerPedidosDelUsuario(id_usuario);
    return res.status(200).json(pedidos);
  } catch (error) {
    if (error instanceof ErrorPedido) {
      return res.status(error.codigoHTTP).json({
        message: error.message,
        detalle: error.detalle || undefined,
      });
    }
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Funcion obtenerPedidoPorId(req, res) controlador que maneja la obtención del detalle de un pedido específico del usuario autenticado (GET /pedidos/:id):
async function obtenerPedidoPorId(req, res) {
  try {
    const id_usuario = req.user?.id_usuario;
    const id_pedido = Number(req.params.id);

    const pedido = await obtenerDetallePedidoDelUsuario(id_usuario, id_pedido);

    return res.status(200).json(pedido);
  } catch (error) {
    if (error instanceof ErrorPedido) {
      return res.status(error.codigoHTTP).json({
        message: error.message,
        detalle: error.detalle || undefined,
      });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Funcion obtenerTicketPedido(req, res) controlador que maneja la obtención del ticket de un pedido específico del usuario autenticado (GET /pedidos/:id/ticket):
async function obtenerTicketPedido(req, res) {
  try {
    const id_usuario = req.user?.id_usuario;
    const id_pedido = Number(req.params.id);

    const pedido = await obtenerDetallePedidoDelUsuario(id_usuario, id_pedido);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="ticket-pedido-${pedido.id_pedido}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    drawTicketPDF(doc, pedido);

    doc.end();
  } catch (error) {
    if (error instanceof ErrorPedido) {
      return res.status(error.codigoHTTP).json({
        message: error.message,
        detalle: error.detalle || undefined,
      });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = {
  crearPedido,
  listarPedidosDelUsuario,
  obtenerPedidoPorId,
  obtenerTicketPedido,
};