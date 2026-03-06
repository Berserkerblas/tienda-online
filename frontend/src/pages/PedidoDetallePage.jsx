// frontend/src/pages/PedidoDetallePage.jsx

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerPedidoPorId, descargarTicketPedido } from "../services/pedidos.service";
import "./PedidoDetallePage.css";

export default function PedidoDetallePage() {
  // Obtiene el ID del pedido de la URL
  const { id } = useParams();

  // Estados para los datos del pedido
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estados para descargar el ticket/factura
  const [descargandoTicket, setDescargandoTicket] = useState(false);
  const [errorTicket, setErrorTicket] = useState("");

  // Carga los datos del pedido al montar el componente
  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);
        setError("");

        // Obtiene los detalles del pedido del backend
        const data = await obtenerPedidoPorId(id);
        setPedido(data);
      } catch (err) {
        console.error("Error cargando pedido:", err);
        setError("No se pudo cargar el detalle del pedido.");
        setPedido(null);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [id]);

  // Descarga el ticket/factura del pedido
  async function onVerTicket() {
    try {
      setDescargandoTicket(true);
      setErrorTicket("");

      // Obtiene el blob del ticket (PDF u otro formato)
      const blob = await descargarTicketPedido(id);

      // Abre el archivo en una nueva ventana
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");

      // Libera memoria tras un tiempo prudencial
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60_000);
    } catch (err) {
      console.error("Error descargando ticket:", err);
      setErrorTicket("No se pudo generar/descargar el ticket. Inténtalo de nuevo.");
    } finally {
      setDescargandoTicket(false);
    }
  }

  if (cargando) {
    return (
      <main className="pedido-detalle-main">
        <p className="pedido-detalle-loading">⏳ Cargando detalle del pedido...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pedido-detalle-main">
        <p className="pedido-detalle-error-page">
          ❌ {error}
          <br />
          <Link to="/mis-pedidos">← Volver a mis pedidos</Link>
        </p>
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className="pedido-detalle-main">
        <p className="pedido-detalle-error-page">
          ❌ Pedido no encontrado.
          <br />
          <Link to="/mis-pedidos">← Volver a mis pedidos</Link>
        </p>
      </main>
    );
  }

  // Soporta que backend devuelva { lineas: [...] } o { lineas_pedido: [...] }
  const lineas = pedido.lineas || pedido.lineas_pedido || pedido.items || [];

  const idPedidoUI = pedido.id_pedido ?? pedido.id;

  return (
    <main className="pedido-detalle-main">
      <Link to="/mis-pedidos" className="pedido-detalle-back-link">
        ← Volver a mis pedidos
      </Link>

      <div className="pedido-detalle-header">
        <h1 className="pedido-detalle-title">
          Pedido <span className="pedido-detalle-numero">#{idPedidoUI}</span>
        </h1>

        <button
          type="button"
          onClick={onVerTicket}
          disabled={descargandoTicket}
          className="pedido-detalle-btn-ticket"
          title="Descargar ticket en PDF"
        >
          {descargandoTicket ? "📄 Generando..." : "📄 Ver ticket (PDF)"}
        </button>
      </div>

      {errorTicket && (
        <div className="pedido-detalle-error-ticket">
          ❌ {errorTicket}
        </div>
      )}

      <div className="pedido-detalle-info">
        {pedido.fecha_pedido && (
          <div className="pedido-detalle-info-item">
            <div className="pedido-detalle-info-label">Fecha del pedido</div>
            <div className="pedido-detalle-info-valor">
              {new Date(pedido.fecha_pedido).toLocaleDateString("es-ES")}
            </div>
          </div>
        )}

        {pedido.estado && (
          <div className="pedido-detalle-info-item">
            <div className="pedido-detalle-info-label">Estado</div>
            <div className={`pedido-detalle-info-valor estado`}>
              ● {pedido.estado}
            </div>
          </div>
        )}

        {pedido.total != null && (
          <div className="pedido-detalle-info-item">
            <div className="pedido-detalle-info-label">Total</div>
            <div className="pedido-detalle-info-valor total">
              {Number(pedido.total).toFixed(2)} €
            </div>
          </div>
        )}
      </div>

      {lineas.length === 0 ? (
        <div className="pedido-detalle-vacio">
          <p>Este pedido no tiene líneas asociadas.</p>
        </div>
      ) : (
        <section className="pedido-detalle-lineas-section">
          <h2 className="pedido-detalle-lineas-title">
            Artículos del pedido ({lineas.length})
          </h2>

          <div className="pedido-detalle-lineas">
            {lineas.map((l, idx) => (
              <article
                key={l.id_linea ?? `${l.id_producto}-${idx}`}
                className="pedido-detalle-linea"
              >
                <div className="pedido-detalle-linea-info">
                  <h3 className="pedido-detalle-linea-nombre">
                    {l.nombre_producto ?? `Producto #${l.id_producto}`}
                  </h3>
                  <div className="pedido-detalle-linea-cantidad">
                    Cantidad: <span className="pedido-detalle-linea-cantidad-badge">{l.cantidad}</span>
                  </div>
                </div>

                <div className="pedido-detalle-linea-precios">
                  <div className="pedido-detalle-linea-precio-unitario">
                    <span className="pedido-detalle-linea-precio-unitario-valor">
                      {Number(l.precio_unitario).toFixed(2)} €
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#999" }}>/ud</span>
                  </div>
                  <div className="pedido-detalle-linea-subtotal">
                    {(Number(l.precio_unitario) * Number(l.cantidad)).toFixed(2)} €
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}