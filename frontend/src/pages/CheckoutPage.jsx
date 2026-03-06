// frontend/src/pages/CheckoutPage.jsx

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { crearPedido } from "../services/pedidos.service";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const navigate = useNavigate();
  // Verifica si el usuario está autenticado
  const { autenticado } = useAuth();
  // Obtiene items del carrito y función para vaciarlo tras completar pedido
  const { items, totalItems, vaciarCarrito } = useCart();

  // Estados para los datos de envío
  const [nombreEnvio, setNombreEnvio] = useState("");
  const [direccionEnvio, setDireccionEnvio] = useState("");
  const [ciudadEnvio, setCiudadEnvio] = useState("");
  const [cpEnvio, setCpEnvio] = useState("");

  // Control de estado de carga y errores
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Calcula el total del pedido optimizando con useMemo
  const total = useMemo(() => {
    return items.reduce(
      (acc, p) => acc + (Number(p.precio) || 0) * (p.cantidad || 0),
      0
    );
  }, [items]);

  // Maneja el envío del formulario y creación del pedido
  async function onSubmit(e) {
    e.preventDefault();

    // Validaciones previas
    if (!autenticado) {
      setError("Debes iniciar sesión para finalizar la compra.");
      return;
    }

    if (items.length === 0) {
      setError("El carrito está vacío.");
      return;
    }

    try {
      setCargando(true);
      setError("");

      // Prepara el payload con datos de envío y líneas de pedido
      const payload = {
        nombre_envio: nombreEnvio,
        direccion_envio: direccionEnvio,
        ciudad_envio: ciudadEnvio,
        cp_envio: cpEnvio,
        // Mapea los items a formato de línea de pedido (id_producto y cantidad)
        lineas: items.map((p) => ({
          id_producto: Number(p.id_producto),
          cantidad: Number(p.cantidad),
        })),
      };

      const data = await crearPedido(payload);

      // Vacía el carrito tras crear el pedido exitósamente
      vaciarCarrito();

      // Obtiene el ID del pedido (normaliza variaciones de formato)
      const idPedido =
        data?.id_pedido ??
        data?.pedido?.id_pedido ??
        data?.id ??
        data?.pedido?.id;

      // Redirige a la página de confirmación
      if (idPedido) navigate(`/pedidos/confirmado/${idPedido}`);
      else navigate(`/pedidos/confirmado`);
    } catch (err) {
      console.error("Error creando pedido:", err);

      // Extrae mensaje de error del backend (formato ErrorPedido)
      const msg = err?.response?.data?.message;
      const det = err?.response?.data?.detalle;

      setError(
        det ? `${msg || "No se pudo crear el pedido."} (${det})` : (msg || "No se pudo crear el pedido.")
      );
    } finally {
      setCargando(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="checkout-main">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-vacio">
          <p>Tu carrito está vacío.</p>
          <Link to="/productos">Volver al catálogo</Link>
        </div>
      </main>
    );
  }

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  return (
    <main className="checkout-main">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-container">
        {/* Formulario de envío */}
        <form onSubmit={onSubmit} className="checkout-form">
          <div className="checkout-form-section">
            <h2 className="checkout-form-section-title">Datos de envío</h2>

            <div className="checkout-form-group">
              <label htmlFor="nombre-envio">Nombre</label>
              <input
                id="nombre-envio"
                type="text"
                className="checkout-form-input"
                value={nombreEnvio}
                onChange={(e) => setNombreEnvio(e.target.value)}
                required
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="checkout-form-group">
              <label htmlFor="direccion-envio">Dirección</label>
              <input
                id="direccion-envio"
                type="text"
                className="checkout-form-input"
                value={direccionEnvio}
                onChange={(e) => setDireccionEnvio(e.target.value)}
                required
                placeholder="Calle, número, piso..."
              />
            </div>

            <div className="checkout-form-group">
              <label htmlFor="ciudad-envio">Ciudad</label>
              <input
                id="ciudad-envio"
                type="text"
                className="checkout-form-input"
                value={ciudadEnvio}
                onChange={(e) => setCiudadEnvio(e.target.value)}
                required
                placeholder="Tu ciudad"
              />
            </div>

            <div className="checkout-form-group">
              <label htmlFor="cp-envio">Código postal</label>
              <input
                id="cp-envio"
                type="text"
                className="checkout-form-input"
                value={cpEnvio}
                onChange={(e) => setCpEnvio(e.target.value)}
                required
                placeholder="28001"
              />
            </div>
          </div>

          {error && <div className="checkout-error">{error}</div>}

          <button
            type="submit"
            disabled={cargando}
            className="checkout-btn-submit"
          >
            {cargando ? "Creando pedido..." : "Confirmar compra"}
          </button>
        </form>

        {/* Resumen de pedido */}
        <aside className="checkout-resumen">
          <h2 className="checkout-resumen-title">Resumen del pedido</h2>

          <div className="checkout-items">
            {items.map((p) => (
              <article key={p.id_producto} className="checkout-item">
                {p.imagen ? (
                  <img
                    src={p.imagen}
                    alt={p.nombre}
                    className="checkout-item-imagen"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}

                <div className="checkout-item-info">
                  <h3 className="checkout-item-nombre">{p.nombre}</h3>
                  <div className="checkout-item-precio">
                    {Number(p.precio).toFixed(2)} €/ud
                  </div>
                  <div className="checkout-item-cantidad">
                    Cantidad: {p.cantidad}
                  </div>
                  <div className="checkout-item-subtotal">
                    Subtotal: {(Number(p.precio) * p.cantidad).toFixed(2)} €
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="checkout-resumen-box">
            <div className="checkout-resumen-row">
              <span className="checkout-resumen-label">Artículos:</span>
              <span className="checkout-resumen-value">{totalItems}</span>
            </div>

            <div className="checkout-resumen-row total">
              <span>Total:</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}