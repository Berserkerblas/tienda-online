// frontend/src/router/AppRouter.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LayoutPublico from "../components/LayoutPublico";

import HomePage from "../pages/HomePage";
import ProductosPage from "../pages/ProductosPage";
import ProductoDetallePage from "../pages/ProductoDetallePage";
import AuthPage from "../pages/AuthPage";

import CarritoPage from "../pages/CarritoPage";
import CheckoutPage from "../pages/CheckoutPage";
import PedidoConfirmadoPage from "../pages/PedidoConfirmadoPage";

import ProtectedRoute from "./ProtectedRoute";
import MisPedidosPage from "../pages/MisPedidosPage";
import PedidoDetallePage from "../pages/PedidoDetallePage";

import AdminRoute from "./AdminRoute";
import AdminProductsPage from "../pages/AdminProductsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout público que incluye Header y Footer en todas las páginas */}
        <Route element={<LayoutPublico />}>
          {/* ===== RUTAS PÚBLICAS ===== */}
          {/* Página de inicio */}
          <Route path="/" element={<HomePage />} />
          {/* Listado de productos con filtros */}
          <Route path="/productos" element={<ProductosPage />} />
          {/* Detalle individual de un producto */}
          <Route path="/productos/:id" element={<ProductoDetallePage />} />
          {/* Login/Registro */}
          <Route path="/auth" element={<AuthPage />} />
          {/* Carrito de compras */}
          <Route path="/carrito" element={<CarritoPage />} />

          {/* ===== RUTAS PROTEGIDAS (solo usuarios autenticados) ===== */}
          <Route element={<ProtectedRoute />}>
            {/* Formulario de compra */}
            <Route path="/checkout" element={<CheckoutPage />} />
            {/* Confirmación de pedido (con o sin ID) */}
            <Route path="/pedidos/confirmado" element={<PedidoConfirmadoPage />} />
            <Route path="/pedidos/confirmado/:id" element={<PedidoConfirmadoPage />} />
            {/* Historial de pedidos del usuario */}
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
            {/* Detalles de un pedido específico */}
            <Route path="/mis-pedidos/:id" element={<PedidoDetallePage />} />
          </Route>

          {/* ===== RUTAS DE ADMIN (solo usuarios con rol admin) ===== */}
          <Route
            path="/admin/productos"
            element={
              <AdminRoute>
                <AdminProductsPage />
              </AdminRoute>
            }
          />
        </Route>

        {/* ===== RUTA 404 ===== */}
        {/* Cualquier ruta no definida */}
        <Route
          path="*"
          element={<h1 style={{ padding: 16 }}>404 - Página no encontrada</h1>}
        />
      </Routes>
    </BrowserRouter>
  );
}