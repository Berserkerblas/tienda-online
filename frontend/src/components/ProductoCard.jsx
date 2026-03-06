// frontend/src/components/ProductoCard.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductoCard.css";

export default function ProductoCard({ producto }) {
  // URL base de la API para construir rutas de imágenes
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Normaliza los datos del producto (compatible con diferentes estructuras de back)
  const id = producto.id_producto ?? producto.id;
  const nombre = producto.nombre ?? producto.name;
  const precio = Number(producto.precio ?? producto.price);
  const stock = typeof producto.stock === "number" ? producto.stock : null;

  // Obtiene la URL de la imagen, manteniendo compatibility con formatos diferentes
  const imagenRaw = producto.imagen ?? producto.image_url ?? null;

  // Construye la URL completa de la imagen (local o remota)
  const imagenUrl = imagenRaw
    ? imagenRaw.startsWith("http")
      ? imagenRaw
      : `${API_URL}/productos/${imagenRaw}`
    : null;

  // Estado para manejar errores al cargar la imagen
  const [imgOk, setImgOk] = useState(true);

  // Determina si el producto está sin stock
  const sinStock = stock === 0;

  return (
    <article className="producto-card">
      {/* Contenedor de imagen con badge de stock */}
      {imagenUrl && imgOk && (
        <>
          <div className="producto-image-container">
            {sinStock && (
              <div className="producto-stock-badge">SIN STOCK</div>
            )}
            {!sinStock && stock !== null && stock < 5 && (
              <div className="producto-stock-badge disponible">
                ÚLTIMAS {stock}
              </div>
            )}
            <Link to={`/productos/${id}`} className="producto-image-link">
              <img
                src={imagenUrl}
                alt={nombre}
                className="producto-image"
                onError={() => setImgOk(false)}
              />
            </Link>
          </div>
        </>
      )}

      {/* Información del producto: nombre, precio, stock */}
      <div className="producto-content">
        {/* Nombre del producto con truncamiento si es muy largo */}
        <h3 className="producto-nombre">
          {nombre && nombre.length > 40 
            ? nombre.substring(0, 37) + "..." 
            : nombre}
        </h3>

        {/* Precio formateado a 2 decimales */}
        <p className="producto-precio">
          {Number.isFinite(precio)
            ? `${precio.toFixed(2)} €`
            : "Precio no disponible"}
        </p>

        {/* Información de disponibilidad */}
        {typeof stock === "number" && (
          <p className={`producto-stock-info ${sinStock ? "sin-stock" : ""}`}>
            {sinStock ? "Sin stock" : `Stock: ${stock}`}
          </p>
        )}

        {/* Botón para ver detalles completos del producto */}
        <Link to={`/productos/${id}`} className="producto-detalle-link-full">
          Ver detalle
        </Link>
      </div>
    </article>
  );
}