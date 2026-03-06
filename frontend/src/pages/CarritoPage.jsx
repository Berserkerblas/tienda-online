// frontend/src/pages/CarritoPage.jsx

import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./CarritoPage.css";

export default function CarritoPage() {
  // Obtiene items del carrito y funciones de manipulación desde el contexto
  const { items, totalItems, eliminarProducto, vaciarCarrito } = useCart();

  // Calcula el total del carrito multiplicando precio × cantidad de cada item
  const total = items.reduce(
    (acc, p) => acc + (Number(p.precio) || 0) * (p.cantidad || 0),
    0
  );

  return (
    <main className="carrito-main">
      <h1 className="carrito-title">Carrito de compras</h1>

      {items.length === 0 ? (
        // Mostrar mensaje cuando el carrito está vacío
        <div className="carrito-vacio">
          <p>Tu carrito está vacío.</p>
          <Link to="/productos">Volver al catálogo</Link>
        </div>
      ) : (
        <>
          {/* Listado de items en el carrito */}
          <div className="carrito-items">
            {items.map((p) => (
              <article key={p.id_producto} className="carrito-item">
                {p.imagen ? (
                  <img
                    src={p.imagen}
                    alt={p.nombre}
                    className="carrito-item-imagen"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}

                <div className="carrito-item-info">
                  <strong className="carrito-item-nombre">{p.nombre}</strong>
                  <div className="carrito-item-precio">
                    <strong>{Number(p.precio).toFixed(2)} €</strong> × {p.cantidad}{" "}
                    = <strong>{(Number(p.precio) * p.cantidad).toFixed(2)} €</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="carrito-item-btn-eliminar"
                  onClick={() => eliminarProducto(p.id_producto)}
                >
                  Eliminar
                </button>
              </article>
            ))}
          </div>

          <hr className="carrito-separador" />

          <div className="carrito-total">
            <p>Total: {total.toFixed(2)} €</p>
          </div>

          <div className="carrito-acciones">
            <button
              type="button"
              className="carrito-btn-vaciar"
              onClick={vaciarCarrito}
            >
              Vaciar carrito
            </button>

            <Link to="/checkout" className="carrito-checkout-link">
              Proceder a pagar
            </Link>
          </div>
        </>
      )}
    </main>
  );
}