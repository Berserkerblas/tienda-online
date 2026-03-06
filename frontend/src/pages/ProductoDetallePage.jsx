// frontend/src/pages/ProductoDetallePage.jsx

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { obtenerProductoPorId } from "../services/productos.service";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./ProductoDetallePage.css";

export default function ProductoDetallePage() {
  // Obtiene el ID del producto de la URL
  const { id } = useParams();
  // Contexto del carrito para agregar productos
  const { añadirProducto, items } = useCart();
  // Contexto de autenticación
  const { autenticado } = useAuth();
  // Hook para redirigir
  const navigate = useNavigate();

  // URL base de la API para construir URLs de imágenes
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Estados del producto y cantidad a añadir
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  // Control de carga y mensajes
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Carga los datos del producto al montar el componente
  useEffect(() => {
    async function cargarDetalle() {
      try {
        setCargando(true);
        setError("");
        setMensaje("");

        const data = await obtenerProductoPorId(id);
        // Normaliza el formato de respuesta
        const obj = data?.producto ? data.producto : data;

        setProducto(obj);
        setCantidad(1);
      } catch (err) {
        console.error("Error al cargar detalle:", err);
        setError("No se pudo cargar el detalle del producto.");
        setProducto(null);
      } finally {
        setCargando(false);
      }
    }

    cargarDetalle();
  }, [id]);

  // Valida y añade el producto al carrito
  function onAñadir() {
    if (!producto) return;

    // Validación: debe estar autenticado
    if (!autenticado) {
      setMensaje("Debes iniciar sesión para añadir productos al carrito.");
      // Redirige a la página de login después de 1.5 segundos
      setTimeout(() => {
        navigate("/auth");
      }, 1500);
      return;
    }

    // Validación de stock disponible
    const stock = Number(producto.stock ?? 0);
    if (stock <= 0) {
      setMensaje("Sin stock disponible.");
      return;
    }

    // Validación de cantidad ingresada
    const cant = Number(cantidad);
    if (!Number.isFinite(cant) || cant < 1) {
      setMensaje("Cantidad inválida.");
      return;
    }

    // Calcula stock disponible restando lo que ya está en el carrito
    const idProducto = producto.id_producto ?? producto.id;
    const enCarrito = items.find((p) => (p.id_producto ?? p.id) === idProducto);
    const cantidadEnCarrito = Number(enCarrito?.cantidad ?? 0);
    const stockDisponible = stock - cantidadEnCarrito;

    if (cant > stockDisponible) {
      setMensaje(
        `Solo hay ${stockDisponible} unidad${stockDisponible !== 1 ? "es" : ""} disponible${stockDisponible !== 1 ? "s" : ""} (ya tienes ${cantidadEnCarrito} en el carrito).`
      );
      return;
    }

    // Construye la URL completa de la imagen para guardarla en el carrito
    const imagenRaw = producto.imagen ?? producto.image_url ?? null;
    const imagenUrlGuardada = imagenRaw
      ? imagenRaw.startsWith("http")
        ? imagenRaw
        : `${API_URL}/productos/${imagenRaw}`
      : null;

    // Prepara el item para el carrito con datos normalizados
    const itemCarrito = {
      id_producto: producto.id_producto ?? producto.id,
      nombre: producto.nombre ?? producto.name,
      precio: Number(producto.precio ?? producto.price),
      stock: stock,
      imagen: imagenUrlGuardada,
    };

    // Añade al carrito y muestra confirmación
    añadirProducto(itemCarrito, cant);
    setMensaje("Producto añadido al carrito.");
  }

  if (cargando) return <p className="detalle-main">Cargando detalle...</p>;

  if (error) {
    return (
      <main className="detalle-main">
        <div className="detalle-error-container">
          <p>{error}</p>
          <Link to="/productos">Volver al catálogo</Link>
        </div>
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="detalle-main">
        <div className="detalle-error-container">
          <p>Producto no encontrado.</p>
          <Link to="/productos">Volver al catálogo</Link>
        </div>
      </main>
    );
  }

  const nombre = producto.nombre ?? producto.name;
  const descripcion = producto.descripcion ?? producto.description;
  const precio = Number(producto.precio ?? producto.price);
  const stock = Number(producto.stock ?? 0);

  // Calcular stock disponible (stock total - cantidad en carrito)
  const idProducto = producto.id_producto ?? producto.id;
  const enCarrito = items.find((p) => (p.id_producto ?? p.id) === idProducto);
  const cantidadEnCarrito = Number(enCarrito?.cantidad ?? 0);
  const stockDisponible = stock - cantidadEnCarrito;

  const imagenRaw = producto.imagen ?? producto.image_url ?? null;
  const imagenUrl = imagenRaw
    ? imagenRaw.startsWith("http")
      ? imagenRaw
      : `${API_URL}/productos/${imagenRaw}`
    : null;

  return (
    <main className="detalle-main">
      <Link to="/productos" className="detalle-back-link">
        ← Volver al catálogo
      </Link>

      <h1 className="detalle-title">{nombre}</h1>

      <section className="detalle-content">
        <div className="detalle-image-container">
          {imagenUrl ? (
            <img
              src={imagenUrl}
              alt={nombre}
              className="detalle-image"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span style={{ color: "#999" }}>Sin imagen</span>
          )}
        </div>

        <div className="detalle-info">
          <p className="detalle-precio">
            {Number.isFinite(precio)
              ? `${precio.toFixed(2)} €`
              : "Precio no disponible"}
          </p>

          <span
            className={`detalle-stock ${
              stockDisponible === 0 ? "sin-stock" : stockDisponible < 5 ? "bajo-stock" : ""
            }`}
          >
            {stockDisponible === 0
              ? "Sin stock"
              : stockDisponible < 5
                ? `Solo ${stockDisponible} unidades`
                : `Stock disponible (${stockDisponible})`}
            {cantidadEnCarrito > 0 && (
              <span className="stock-en-carrito"> (-{cantidadEnCarrito} en carrito)</span>
            )}
          </span>

          <p
            className={`detalle-descripcion ${
              !descripcion ? "vacio" : ""
            }`}
          >
            {descripcion || "Sin descripción disponible."}
          </p>

          <div className="detalle-acciones">
            <div className="detalle-cantidad-label">
              <label htmlFor="cantidad-input">Cantidad</label>
              <input
                id="cantidad-input"
                type="number"
                min={1}
                max={stockDisponible || 1}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="detalle-cantidad-input"
              />
            </div>

            <button
              type="button"
              onClick={onAñadir}
              disabled={stockDisponible <= 0}
              className="detalle-btn-añadir"
            >
              {stockDisponible <= 0 ? "Sin stock" : "Añadir al carrito"}
            </button>
          </div>

          {mensaje && (
            <p
              className={`detalle-mensaje ${
                mensaje.includes("Error") || mensaje.includes("supera")
                  ? "error"
                  : "exito"
              }`}
            >
              {mensaje}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}