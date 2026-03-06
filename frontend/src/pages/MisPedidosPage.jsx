// frontend/src/pages/MisPedidosPage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerMisPedidos } from "../services/pedidos.service";
import "./MisPedidosPage.css";

export default function MisPedidosPage() {
  // Cantidad de pedidos a mostrar por página
  const PEDIDOS_POR_PAGINA = 6;

  // Estados de pedidos y control
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);

  // Carga el historial de pedidos del usuario autenticado
  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);
        setError("");

        const data = await obtenerMisPedidos();
        // Normaliza el formato de respuesta
        const lista = Array.isArray(data) ? data : data.pedidos || data.items || [];
        setPedidos(lista);
      } catch (err) {
        console.error("Error cargando pedidos:", err);
        setError("No se pudieron cargar tus pedidos.");
        setPedidos([]);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  // Resetea la página cuando cambia el número total de pedidos
  useEffect(() => {
    setPagina(1);
  }, [pedidos.length]);

  // Calcula la paginación: total de páginas, índice inicial y lista paginada
  const totalPaginas = Math.max(1, Math.ceil(pedidos.length / PEDIDOS_POR_PAGINA));
  const inicio = (pagina - 1) * PEDIDOS_POR_PAGINA;
  const pedidosPaginados = pedidos.slice(inicio, inicio + PEDIDOS_POR_PAGINA);

  // Navega a página anterior
  function irAnterior() {
    setPagina((prev) => Math.max(1, prev - 1));
  }

  // Navega a página siguiente
  function irSiguiente() {
    setPagina((prev) => Math.min(totalPaginas, prev + 1));
  }

  return (
    <main className="mispedidos-main">
      <h1 className="mispedidos-title">Mis pedidos</h1>

      {cargando && (
        <div className="mispedidos-loading">
          <p>⏳ Cargando tu historial de pedidos...</p>
        </div>
      )}

      {error && (
        <div className="mispedidos-error">
          <p>❌ {error}</p>
        </div>
      )}

      {!cargando && !error && (
        <>
          {pedidos.length === 0 ? (
            <div className="mispedidos-vacio">
              <p>No tienes pedidos todavía.</p>
              <p>¡Comienza tu compra ahora!</p>
              <Link to="/productos">Ir al catálogo</Link>
            </div>
          ) : (
            <>
              <div className="mispedidos-list">
                {pedidosPaginados.map((p) => {
                  const idPedido = p.id_pedido ?? p.id;
                  const fecha = p.fecha_pedido
                    ? new Date(p.fecha_pedido).toLocaleDateString("es-ES")
                    : "Fecha no disponible";
                  const estado = p.estado || "Sin estado";
                  const total = p.total != null ? Number(p.total).toFixed(2) : "0.00";

                  return (
                    <article
                      key={idPedido}
                      className="mispedidos-card"
                    >
                      <div className="mispedidos-card-header">
                        <div className="mispedidos-card-info">
                          <h2 className="mispedidos-card-titulo">
                            <span className="mispedidos-card-numero">
                              Pedido #{idPedido}
                            </span>
                          </h2>
                          <div className="mispedidos-card-fecha">
                            📅 {fecha}
                          </div>
                          <div
                            className={`mispedidos-card-estado ${estado.toLowerCase().replace(" ", "-")}`}
                          >
                            ● {estado}
                          </div>
                        </div>

                        <div className="mispedidos-card-acciones">
                          <div className="mispedidos-card-total">
                            <div className="mispedidos-card-total-label">
                              Total
                            </div>
                            <div className="mispedidos-card-total-valor">
                              {total} €
                            </div>
                          </div>
                          <Link
                            to={`/mis-pedidos/${idPedido}`}
                            className="mispedidos-card-link"
                          >
                            Ver detalle
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {pedidos.length > PEDIDOS_POR_PAGINA && (
                <div className="mispedidos-pagination" aria-label="Paginación de pedidos">
                  <button
                    type="button"
                    className="mispedidos-pagination-btn"
                    onClick={irAnterior}
                    disabled={pagina === 1}
                  >
                    ← Anterior
                  </button>

                  <span className="mispedidos-pagination-info">
                    Página {pagina} de {totalPaginas}
                  </span>

                  <button
                    type="button"
                    className="mispedidos-pagination-btn"
                    onClick={irSiguiente}
                    disabled={pagina === totalPaginas}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}