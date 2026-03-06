// ================================================
// SERVICIO DE EMAIL (Nodemailer)
// backend/src/services/email.service.js
// ================================================

const nodemailer = require("nodemailer");

function emailHabilitado() {
  return String(process.env.EMAIL_ENABLED || "").toLowerCase() === "true";
}

function crearTransporterSMTP() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("Faltan variables SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 suele ser TLS directo
    auth: { user, pass },
  });
}

/**
 * Envía un email con ticket PDF adjunto.
 * - "text" es recomendable como fallback.
 * - "html" mejora el diseño y compatibilidad con Gmail.
 */
async function enviarTicketPedidoPorEmail({
  to,
  asunto,
  text,
  html,
  pdfBuffer,
  nombreArchivo,
}) {
  if (!emailHabilitado()) {
    return { enviado: false, motivo: "EMAIL_ENABLED=false" };
  }

  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Falta EMAIL_FROM en variables de entorno.");
  }

  const transporter = crearTransporterSMTP();

  const info = await transporter.sendMail({
    from,
    to,
    subject: asunto,
    // Fallback texto plano (si el cliente no soporta HTML)
    text: text || "",
    // HTML bonito
    html: html || undefined,
    attachments: [
      {
        filename: nombreArchivo,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return { enviado: true, messageId: info.messageId };
}

module.exports = {
  enviarTicketPedidoPorEmail,
  emailHabilitado,
};