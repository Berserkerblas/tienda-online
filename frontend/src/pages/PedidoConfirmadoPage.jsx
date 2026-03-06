// frontend/src/pages/PedidoConfirmadoPage.jsx

import { Link, useParams } from "react-router-dom";
import "./PedidoConfirmadoPage.css";

export default function PedidoConfirmadoPage() {
  // Obtiene el ID del pedido de la URL (si existe)
  const { id } = useParams();

  return (
    <main className="pedido-confirmado-main">
      <div className="pedido-confirmado-container">
        {/* Ícono de éxito */}
        <div className="pedido-confirmado-icon">✓</div>
        
        {/* Título de confirmación */}
        <h1 className="pedido-confirmado-h1">¡Pedido Confirmado!</h1>
        
        <p className="pedido-confirmado-message">
          Tu pedido se ha procesado correctamente. Pronto recibirás un correo de confirmación.
        </p>

        {/* Muestra el número de pedido si se pasó en la URL */}
        {id && (
          <>
            <div className="pedido-confirmado-numero-label">Número de Pedido</div>
            <div className="pedido-confirmado-numero">#{id}</div>
          </>
        )}

        {/* Información sobre los siguientes pasos */}
        <div className="pedido-confirmado-info">
          <p><strong>¿Qué sucede ahora?</strong></p>
          <p>En breve revisaremos tu pedido y te enviaremos un correo de confirmación con los detalles.</p>
          <p>Podrás seguir el estado de tu pedido en la sección "Mis Pedidos".</p>
        </div>

        {/* Enlaces de navegación: ver más pedidos o volver al catálogo */}
        <Link to="/mis-pedidos" className="pedido-confirmado-link">
          → Ver mis pedidos
        </Link>

        <Link to="/productos" className="pedido-confirmado-secundario">
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}