// ================================================
// MIDDLEWARE DE VALIDACIÓN DE CARGA DE IMÁGENES
// backend/src/middlewares/upload.middleware.js
// ================================================
// Valida que los archivos JPG cargados sean válidos:
// - Extensión .jpg (case-insensitive)
// - Magic bytes FF D8 FF (inicio real de archivo JPG)
// - Tamaño máximo 5MB
// - Campo "archivo" presente en multipart

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const JPG_MAGIC_BYTES = Buffer.from([0xff, 0xd8, 0xff]);

/**
 * Middleware validarArchivoJPG
 * Valida que el archivo cargado sea un JPG válido
 * Espera req.files.archivo presente (express-fileupload)
 */
function validarArchivoJPG(req, res, next) {
  try {
    // Verificar que req.files existe
    if (!req.files || !req.files.archivo) {
      return res.status(400).json({
        message: "No se encontró archivo. Campo 'archivo' requerido.",
      });
    }

    const archivo = req.files.archivo;

    // Validar que sea un array o un objeto (express-fileupload devuelve un objeto)
    if (Array.isArray(archivo)) {
      return res.status(400).json({
        message: "Solo se permite subir un archivo.",
      });
    }

    // Validar nombre de archivo
    if (!archivo.name || typeof archivo.name !== "string") {
      return res.status(400).json({
        message: "Nombre de archivo inválido.",
      });
    }

    const nombreArchivo = archivo.name.toLowerCase();
    const extension = nombreArchivo.split(".").pop();

    // Validar extensión .jpg
    if (extension !== "jpg") {
      return res.status(400).json({
        message: "Solo se aceptan archivos .jpg",
        detalle: `Archivo recibido: ${archivo.name}`,
      });
    }

    // Validar tamaño
    if (archivo.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        message: `Archivo demasiado grande. Máximo: 5 MB, recibido: ${Math.round(archivo.size / 1024 / 1024 * 100) / 100} MB`,
      });
    }

    // Validar magic bytes (primeros 3 bytes: FF D8 FF para JPG válido)
    const buffer = archivo.data;
    if (buffer.length < 3 || !buffer.subarray(0, 3).equals(JPG_MAGIC_BYTES)) {
      return res.status(400).json({
        message: "Archivo no es un JPG válido (magic bytes inválidos).",
        detalle: "El archivo no tiene la estructura interna de un JPEG auténtico.",
      });
    }

    // Todo validado, pasar al siguiente middleware
    next();
  } catch (error) {
    console.error("Error en validarArchivoJPG:", error);
    return res.status(500).json({
      message: "Error al validar archivo.",
      detalle: error.message,
    });
  }
}

module.exports = {
  validarArchivoJPG,
};
