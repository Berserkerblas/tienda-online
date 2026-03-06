// frontend/src/pages/AdminProductsPage.jsx

import { useEffect, useState, useRef } from "react";

import {
  listarProducto,
  crearProducto,
  actualizarProducto,
  estadoProducto,
  crearProductoConArchivo,
  eliminarProducto,
} from "../services/admin.productos.service.js";
import "./AdminProductsPage.css";

const FORM_INICIAL = {
  id_categoria: "",
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  imagen: "",
  activo: 1,
};

const CATEGORIAS = [
  { id_categoria: 1, nombre: "Warhammer" },
  { id_categoria: 2, nombre: "One Piece" },
  { id_categoria: 3, nombre: "MTG" },
  { id_categoria: 4, nombre: "Pokemon" },
  { id_categoria: 5, nombre: "Lorcana" },
  { id_categoria: 6, nombre: "Juegos de mesa" },
];

export default function AdminProductsPage() {
  // ===== DATOS Y CARGA =====
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== ARCHIVO CARGADO =====
  // Referencia al input file y estado del archivo seleccionado
  const fileInputRef = useRef(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);

  // ===== FILTROS =====
  // Búsqueda por nombre y filtro de estado (activos/inactivos)
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos"); // "todos" | "activos" | "inactivos"

  // ===== PAGINACIÓN =====
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(20);
  const [haySiguiente, setHaySiguiente] = useState(false);

  // ===== FORMULARIO DE CREAR/EDITAR =====
  // Datos del formulario y ID del producto en edición (si aplica)
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);

  // ===== UI Y MENSAJES =====
  // Control de errores, éxitos y estado de guardado
  const [errorMsg, setErrorMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Limpia los mensajes de error y éxito
  function limpiarMensajes() {
    setErrorMsg("");
    setOkMsg("");
  }

  // Reinicia el formulario y sale del modo edición
  function resetFormulario() {
    setForm(FORM_INICIAL);
    setEditandoId(null);
  }

  // ===== FUNCIONES DE ARCHIVO =====
  
  // Limpia archivo seleccionado y preview
  function limpiarArchivo() {
    setArchivoSeleccionado(null);
    setPreviewURL(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Maneja selección de archivo
  function handleFileSelect(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    // Validar extensión .jpg (case-insensitive)
    const extension = archivo.name.split(".").pop()?.toLowerCase();
    if (extension !== "jpg") {
      setErrorMsg("❌ Solo se aceptan archivos .jpg");
      limpiarArchivo();
      return;
    }

    // Validar que el nombre coincida con el campo "imagen"
    const nombreCampoImagen = form.imagen?.trim().toLowerCase();
    if (!nombreCampoImagen) {
      setErrorMsg("❌ Primero escribe el nombre del archivo en 'URL Imagen'");
      limpiarArchivo();
      return;
    }

    const nombreArchivo = archivo.name.toLowerCase();
    if (nombreArchivo !== nombreCampoImagen) {
      setErrorMsg(
        `❌ El nombre del archivo no coincide.\nArchivo: "${archivo.name}"\nEsperado: "${form.imagen}"`
      );
      limpiarArchivo();
      return;
    }

    // Validar tamaño máximo 5MB
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (archivo.size > maxSize) {
      setErrorMsg(
        `❌ Archivo demasiado grande. Máximo: 5 MB, recibido: ${Math.round(archivo.size / 1024 / 1024 * 100) / 100} MB`
      );
      limpiarArchivo();
      return;
    }

    // Validar que sea JPG real (revisar magic bytes)
    // Leer primeros bytes del archivo
    const reader = new FileReader();
    reader.onload = (evt) => {
      const arr = new Uint8Array(evt.target.result).subarray(0, 3);
      const isJpg = arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff;

      if (!isJpg) {
        setErrorMsg("❌ Archivo no es un JPG válido (estructura de archivo inválida)");
        limpiarArchivo();
        return;
      }

      // Todo bien, guardar archivo
      limpiarMensajes();
      setArchivoSeleccionado(archivo);

      // Crear preview
      const url = URL.createObjectURL(archivo);
      setPreviewURL(url);
    };

    reader.readAsArrayBuffer(archivo.slice(0, 3));
  }

  // Construye los parámetros para la llamada al API con filtros y paginación
  function construirParamsAdmin(paginaUsada = pagina, limiteUsado = limite) {
    const params = {};

    if (busqueda.trim()) params.busqueda = busqueda.trim();

    // Filtra por activo/inactivo
    if (filtroActivo === "activos") params.activo = 1;
    if (filtroActivo === "inactivos") params.activo = 0;

    params.pagina = paginaUsada;
    params.limite = limiteUsado;

    return params;
  }

  // Carga los productos con los filtros actuales
  async function cargarProductos(paginaUsada = pagina, limiteUsado = limite) {
    try {
      setLoading(true);
      const params = construirParamsAdmin(paginaUsada, limiteUsado);
      const data = await listarProducto(params);

      setProductos(data);

      // Si la API devuelve menos que el límite, asumimos que no hay más páginas
      setHaySiguiente(Array.isArray(data) && data.length === Number(limiteUsado));
    } catch (error) {
      console.error("Error cargando productos", error);
      setErrorMsg(error.response?.data?.message || "Error cargando productos.");
      setProductos([]);
      setHaySiguiente(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarProductos(1, limite);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      limpiarMensajes();
      setGuardando(true);

      const datosNormalizados = {
        id_categoria: Number(form.id_categoria),
        nombre: form.nombre?.trim(),
        descripcion: form.descripcion?.trim() || null,
        precio: Number(form.precio),
        stock: Number(form.stock),
        imagen: form.imagen?.trim() || null,
        activo: Number(form.activo),
      };

      if (editandoId) {
        await actualizarProducto(editandoId, datosNormalizados);
        setOkMsg("Producto actualizado correctamente.");
      } else {
        // Si hay archivo seleccionado, usar endpoint de upload
        if (archivoSeleccionado) {
          await crearProductoConArchivo(datosNormalizados, archivoSeleccionado);
          setOkMsg("✓ Producto creado. Imagen subida: " + archivoSeleccionado.name);
        } else {
          // Sin archivo, crear producto normal
          await crearProducto(datosNormalizados);
          setOkMsg("Producto creado correctamente.");
        }
      }

      resetFormulario();
      limpiarArchivo();

      // tras crear/editar, recargamos página 1 para “verlo seguro”
      setPagina(1);
      await cargarProductos(1, limite);

      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error guardando producto", error);
      setErrorMsg(
        error.response?.data?.message || error.message || "Error guardando producto."
      );
    } finally {
      setGuardando(false);
    }
  }

  function editarProducto(producto) {
    limpiarMensajes();
    limpiarArchivo();

    setEditandoId(producto.id_producto);

    setForm({
      id_categoria: String(producto.id_categoria ?? ""),
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      stock: producto.stock,
      imagen: producto.imagen || "",
      activo: producto.activo,
    });

    window.scrollTo(0, 0);
  }

  async function toggleEstado(producto) {
    limpiarMensajes();

    const nuevoEstado = producto.activo === 1 ? 0 : 1;

    if (nuevoEstado === 0) {
      const ok = window.confirm(`¿Seguro que quieres desactivar "${producto.nombre}"?`);
      if (!ok) return;
    }

    try {
      await estadoProducto(producto.id_producto, nuevoEstado);
      setOkMsg(`Producto ${nuevoEstado === 1 ? "activado" : "desactivado"} correctamente.`);
      await cargarProductos(pagina, limite);
    } catch (error) {
      console.error("Error cambiando estado", error);
      setErrorMsg(
        error.response?.data?.message || error.message || "Error cambiando estado."
      );
    }
  }

  async function handleEliminar(producto) {
    limpiarMensajes();

    const confirmar = window.confirm(
      `⚠️ ¿Estás seguro de que quieres ELIMINAR permanentemente "${producto.nombre}"?\n\nEsta acción NO se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      await eliminarProducto(producto.id_producto);
      setOkMsg(`✓ Producto "${producto.nombre}" eliminado correctamente.`);
      
      // Si estamos en una página vacía tras eliminar, volver atrás
      if (productos.length === 1 && pagina > 1) {
        setPagina(pagina - 1);
        await cargarProductos(pagina - 1, limite);
      } else {
        await cargarProductos(pagina, limite);
      }
    } catch (error) {
      console.error("Error eliminando producto", error);
      setErrorMsg(
        error.response?.data?.message || error.message || "Error eliminando producto."
      );
    }
  }

  function aplicarFiltros(e) {
    e.preventDefault();
    limpiarMensajes();
    setPagina(1);
    cargarProductos(1, limite);
  }

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroActivo("todos");
    limpiarMensajes();
    setPagina(1);
    setTimeout(() => cargarProductos(1, limite), 0);
  }

  function irAnterior() {
    if (pagina <= 1) return;
    const nueva = pagina - 1;
    setPagina(nueva);
    cargarProductos(nueva, limite);
  }

  function irSiguiente() {
    if (!haySiguiente) return;
    const nueva = pagina + 1;
    setPagina(nueva);
    cargarProductos(nueva, limite);
  }

  function cambiarLimite(e) {
    const nuevoLimite = Number(e.target.value);
    setLimite(nuevoLimite);
    setPagina(1);
    cargarProductos(1, nuevoLimite);
  }

  return (
    <main className="admin-productos-main">
      <h1 className="admin-productos-h1">Panel Admin - Productos</h1>

      {errorMsg && (
        <div className="admin-productos-alert admin-productos-alert-error">
          ❌ {errorMsg}
        </div>
      )}

      {okMsg && (
        <div className="admin-productos-alert admin-productos-alert-success">
          ✓ {okMsg}
        </div>
      )}

      {/* FORMULARIO */}
      <form className="admin-productos-form" onSubmit={handleSubmit}>
        <h2>{editandoId ? `Editar producto #${editandoId}` : "Crear producto"}</h2>

        <div className="admin-productos-form-group">
          <div className="admin-productos-form-control">
            <label>Categoría *</label>
            <select
              name="id_categoria"
              value={form.id_categoria}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-productos-form-control">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del producto"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-productos-form-control">
            <label>Precio *</label>
            <input
              type="number"
              step="0.01"
              name="precio"
              placeholder="49.99"
              value={form.precio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-productos-form-control">
            <label>Stock *</label>
            <input
              type="number"
              name="stock"
              placeholder="10"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="admin-productos-form-group">
          <div className="admin-productos-form-control">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              placeholder="Descripción del producto"
              value={form.descripcion}
              onChange={handleChange}
            />
          </div>

          <div className="admin-productos-form-control">
            <label>URL Imagen</label>
            <input
              type="text"
              name="imagen"
              placeholder="imagen.jpg"
              value={form.imagen}
              onChange={handleChange}
            />
          </div>

          <div className="admin-productos-form-control">
            <label>Subir Imagen JPG (Opcional)</label>
            <div className="admin-productos-file-input-wrapper">
              <input
                type="file"
                ref={fileInputRef}
                accept=".jpg,.jpeg"
                onChange={handleFileSelect}
                disabled={guardando || !form.imagen?.trim()}
                title={!form.imagen?.trim() ? "Primero escribe el nombre en 'URL Imagen'" : ""}
              />
              <small className="admin-productos-file-hint">
                {!form.imagen?.trim()
                  ? "Escribe primero el nombre del archivo en 'URL Imagen'"
                  : archivoSeleccionado
                  ? `✓ ${archivoSeleccionado.name} (${(archivoSeleccionado.size / 1024).toFixed(1)} KB)`
                  : "Selecciona un archivo .jpg que coincida con el nombre anterior"}
              </small>
            </div>
          </div>

          {previewURL && archivoSeleccionado && (
            <div className="admin-productos-preview">
              <label>Vista previa:</label>
              <img src={previewURL} alt="Preview" className="admin-productos-preview-img" />
            </div>
          )}

          <div className="admin-productos-form-control">
            <label>Activo</label>
            <select
              name="activo"
              value={form.activo}
              onChange={handleChange}
            >
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          </div>
        </div>

        <div className="admin-productos-form-buttons">
          <button
            type="submit"
            className="admin-productos-btn admin-productos-btn-primary"
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : editandoId
              ? "Actualizar producto"
              : "Crear producto"}
          </button>

          {editandoId && (
            <button
              type="button"
              className="admin-productos-btn admin-productos-btn-secondary"
              onClick={() => {
                resetFormulario();
                limpiarArchivo();
                limpiarMensajes();
              }}
              disabled={guardando}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {/* FILTROS */}
      <form className="admin-productos-filtros" onSubmit={aplicarFiltros}>
        <h2>Filtros</h2>

        <div className="admin-productos-filtros-controls">
          <div className="admin-productos-filtros-control">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="admin-productos-filtros-control">
            <select value={filtroActivo} onChange={(e) => setFiltroActivo(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>

          <div className="admin-productos-filtros-control">
            <label>Límite:</label>
            <select value={limite} onChange={cambiarLimite} disabled={loading}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="admin-productos-filtros-buttons">
          <button
            type="submit"
            className="admin-productos-filtros-btn admin-productos-filtros-btn-apply"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Aplicar filtros"}
          </button>

          <button
            type="button"
            className="admin-productos-filtros-btn admin-productos-filtros-btn-clear"
            onClick={limpiarFiltros}
            disabled={loading}
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* LISTADO */}
      <div className="admin-productos-listado">
        <h2>Listado de productos</h2>

        {loading ? (
          <div className="admin-productos-empty">
            <p>⏳ Cargando productos...</p>
          </div>
        ) : (
          <table className="admin-productos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productos.map((p) => (
                <tr key={p.id_producto}>
                  <td>{p.id_producto}</td>
                  <td>{p.nombre}</td>
                  <td>{Number(p.precio).toFixed(2)} €</td>
                  <td>{p.stock} unidades</td>
                  <td>
                    <span
                      className={
                        p.activo
                          ? "admin-productos-estado-activo"
                          : "admin-productos-estado-inactivo"
                      }
                    >
                      {p.activo ? "✓ Activo" : "✕ Inactivo"}
                    </span>
                  </td>

                  <td>
                    <div className="admin-productos-table-actions">
                      <button
                        type="button"
                        className="admin-productos-table-btn admin-productos-table-btn-edit"
                        onClick={() => editarProducto(p)}
                      >
                        ✎ Editar
                      </button>
                      <button
                        type="button"
                        className="admin-productos-table-btn admin-productos-table-btn-toggle"
                        onClick={() => toggleEstado(p)}
                      >
                        {p.activo ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        type="button"
                        className="admin-productos-table-btn admin-productos-table-btn-delete"
                        onClick={() => handleEliminar(p)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {productos.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    <div className="admin-productos-empty">
                      No hay productos para mostrar.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINACIÓN */}
      <div className="admin-productos-pagination">
        <button
          type="button"
          className="admin-productos-pagination-btn"
          onClick={irAnterior}
          disabled={loading || pagina <= 1}
        >
          ← Anterior
        </button>

        <span className="admin-productos-pagination-info">Página {pagina}</span>

        <button
          type="button"
          className="admin-productos-pagination-btn"
          onClick={irSiguiente}
          disabled={loading || !haySiguiente}
        >
          Siguiente →
        </button>
      </div>
    </main>
  );
}