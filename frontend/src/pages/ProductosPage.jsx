// frontend/src/pages/ProductosPage.jsx

import { useEffect, useMemo, useState } from "react";
import { obtenerProductos } from "../services/productos.service";
import ProductoCard from "../components/ProductoCard";
import "./ProductosPage.css";

const CATEGORIAS = [
  { id_categoria: 1, nombre: "Warhammer" },
  { id_categoria: 2, nombre: "One Piece" },
  { id_categoria: 3, nombre: "MTG" },
  { id_categoria: 4, nombre: "Pokemon" },
  { id_categoria: 5, nombre: "Lorcana" },
  { id_categoria: 6, nombre: "Juegos de mesa" },
];

export default function ProductosPage() {
  // ===== FILTROS =====
  // Estados para búsqueda, categoría, rango de precios, stock y ordenamiento
  const [busqueda, setBusqueda] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [soloConStock, setSoloConStock] = useState(false);
  const [ordenPrecio, setOrdenPrecio] = useState("");

  // ===== PAGINACIÓN =====
  const [pagina, setPagina] = useState(1);
  const LIMITE_FIJO = 8; // Productos por página

  // ===== DATOS Y CARGA =====
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Construye los parámetros de búsqueda de forma optimizada
  // Evita parámetros vacíos enviando solo los necesarios
  const params = useMemo(() => {
    const p = { pagina, limite: LIMITE_FIJO };

    if (busqueda.trim()) p.busqueda = busqueda.trim();
    if (idCategoria) p.id_categoria = idCategoria;
    if (precioMin !== "") p.precio_minimo = precioMin;
    if (precioMax !== "") p.precio_maximo = precioMax;
    if (soloConStock) p.solo_con_stock = "true";
    if (ordenPrecio) p.orden_precio = ordenPrecio;

    return p;
  }, [
    busqueda,
    idCategoria,
    precioMin,
    precioMax,
    soloConStock,
    ordenPrecio,
    pagina,
  ]);

  // Efecto para cargar productos cada vez que cambian los parámetros de búsqueda
  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);
        setError("");

        const data = await obtenerProductos(params);

        // Normaliza el formato de respuesta del backend
        const lista = data.productos || (Array.isArray(data) ? data : []);
        
        setProductos(lista);

        // Extrae el total de productos para calcular paginación
        const t = data.total;
        setTotal(t);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("No se pudieron cargar los productos.");
        setProductos([]);
        setTotal(null);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [params]);

  // Resetea la página al aplicar filtros
  function aplicarFiltros(e) {
    e.preventDefault();
    setPagina(1);
  }

  // Limpia todos los filtros y vuelve a la página 1
  function limpiarFiltros() {
    setBusqueda("");
    setIdCategoria("");
    setPrecioMin("");
    setPrecioMax("");
    setSoloConStock(false);
    setOrdenPrecio("");
    setPagina(1);
  }

  // totalPaginas si tenemos total real
  const totalPaginas =
    total != null ? Math.max(1, Math.ceil(Number(total) / LIMITE_FIJO)) : null;

  // Heurística si NO hay total:
  // - si llega exactamente el límite, puede haber siguiente
  // - si llega menos, no hay siguiente
  const puedeAnterior = pagina > 1;
  const puedeSiguiente = totalPaginas
    ? pagina < totalPaginas
    : productos.length === LIMITE_FIJO;

  // Mostrar paginación si:
  // - sabemos totalPaginas y es >1, o
  // - no sabemos total pero estamos en página>1 o hay posibilidad de siguiente
  const mostrarPaginacion = totalPaginas
    ? totalPaginas > 1
    : puedeAnterior || puedeSiguiente;

  return (
    <main className="productos-main">
      <h1 className="productos-title">Catálogo de productos</h1>

      <form
        onSubmit={aplicarFiltros}
        className="productos-filters-form"
      >
        <div className="productos-filters-grid">
          <div className="productos-filter-label">
            <label>Búsqueda</label>
            <input
              className="productos-filter-input"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre..."
            />
          </div>

          <div className="productos-filter-label">
            <label>Categoría</label>
            <select
              className="productos-filter-select"
              value={idCategoria}
              onChange={(e) => {
                setIdCategoria(e.target.value);
                setPagina(1);
              }}
            >
              <option value="">Todas</option>
              {CATEGORIAS.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="productos-filter-label">
            <label>Orden precio</label>
            <select
              className="productos-filter-select"
              value={ordenPrecio}
              onChange={(e) => setOrdenPrecio(e.target.value)}
            >
              <option value="">Sin orden</option>
              <option value="asc">Precio ascendente</option>
              <option value="desc">Precio descendente</option>
            </select>
          </div>

          <div className="productos-filter-label">
            <label>Precio mínimo</label>
            <input
              className="productos-filter-input"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              inputMode="decimal"
              placeholder="0"
            />
          </div>

          <div className="productos-filter-label">
            <label>Precio máximo</label>
            <input
              className="productos-filter-input"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              inputMode="decimal"
              placeholder="999"
            />
          </div>

          <label className="productos-filter-checkbox-label">
            <input
              type="checkbox"
              checked={soloConStock}
              onChange={(e) => setSoloConStock(e.target.checked)}
            />
            Solo con stock
          </label>
        </div>

        <div className="productos-filters-buttons">
          <button type="submit" className="productos-btn-apply">
            Aplicar
          </button>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="productos-btn-clear"
          >
            Limpiar
          </button>

          <div className="productos-filters-info">
            Mostrando {LIMITE_FIJO} por página
          </div>
        </div>
      </form>

      <div className="productos-content">
        {cargando && <p className="productos-loading">Cargando...</p>}
        {error && <p className="productos-error">{error}</p>}

        {!cargando && !error && (
          <>
            <p className="productos-count">
              Mostrando {productos.length} producto(s)
              {total != null ? ` de ${total}` : ""}.
            </p>

            {productos.length === 0 ? (
              <p className="productos-empty">No hay productos con esos filtros.</p>
            ) : (
              <div className="productos-grid">
                {productos.map((p) => (
                  <ProductoCard key={p.id_producto ?? p.id} producto={p} />
                ))}
              </div>
            )}

            {mostrarPaginacion && (
              <div className="productos-pagination">
                <button
                  type="button"
                  className="productos-pagination-btn"
                  onClick={() => setPagina(1)}
                  disabled={!puedeAnterior}
                  title="Primera página"
                >
                  «
                </button>

                <button
                  type="button"
                  className="productos-pagination-btn"
                  onClick={() => setPagina((x) => Math.max(1, x - 1))}
                  disabled={!puedeAnterior}
                  title="Anterior"
                >
                  ‹
                </button>

                <span className="productos-pagination-info">
                  Página {pagina}
                  {totalPaginas ? ` / ${totalPaginas}` : ""}
                </span>

                <button
                  type="button"
                  className="productos-pagination-btn"
                  onClick={() => setPagina((x) => x + 1)}
                  disabled={!puedeSiguiente}
                  title="Siguiente"
                >
                  ›
                </button>

                <button
                  type="button"
                  className="productos-pagination-btn"
                  onClick={() => totalPaginas && setPagina(totalPaginas)}
                  disabled={!totalPaginas || pagina === totalPaginas}
                  title="Última página"
                >
                  »
                </button>

                {totalPaginas && pagina === totalPaginas && (
                  <span className="productos-pagination-last">
                    (Última página)
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}