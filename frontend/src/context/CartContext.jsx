// frontend/src/context/CartContext.jsx

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

// Extrae el ID del producto normalizando variaciones en la estructura de datos
function normalizarIdProducto(producto) {
  const id = producto?.id_producto ?? producto?.id;
  return Number(id);
}

export function CartProvider({ children }) {
  // Carrito de compra inicializado desde localStorage si existe
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("carrito");
    return saved ? JSON.parse(saved) : [];
  });

  // Persiste el carrito en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(items));
  }, [items]);

  // Añade producto al carrito o incrementa su cantidad si ya existe
  function añadirProducto(producto, cantidad = 1) {
    const id_producto = normalizarIdProducto(producto);
    // Validación: solo IDs numéricos positivos
    if (!Number.isInteger(id_producto) || id_producto <= 0) return;

    setItems((prev) => {
      // Busca si el producto ya está en el carrito
      const existente = prev.find((p) => normalizarIdProducto(p) === id_producto);

      if (existente) {
        // Si existe, incrementa su cantidad
        return prev.map((p) =>
          normalizarIdProducto(p) === id_producto
            ? { ...p, cantidad: Number(p.cantidad) + Number(cantidad) }
            : p
        );
      }

      // Si no existe, lo agrega al carrito
      return [...prev, { ...producto, id_producto, cantidad: Number(cantidad) }];
    });
  }

  // Elimina un producto específico del carrito
  function eliminarProducto(id) {
    const id_producto = Number(id);
    // Filtra el producto por ID
    setItems((prev) => prev.filter((p) => normalizarIdProducto(p) !== id_producto));
  }

  // Vacía completamente el carrito
  function vaciarCarrito() {
    setItems([]);
  }

  // Calcula el número total de items sumando todas las cantidades
  const totalItems = items.reduce((acc, p) => acc + Number(p.cantidad || 0), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        añadirProducto,
        eliminarProducto,
        vaciarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook personalizado para acceder al contexto del carrito desde cualquier componente
export function useCart() {
  const ctx = useContext(CartContext);
  // Validación: asegura que se está usando dentro del provider
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}