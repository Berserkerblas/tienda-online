// Test de conexión frontend -> backend
const baseURL = "http://localhost:3000";

console.log("🔍 Probando conexión frontend -> backend...");
console.log(`URL: ${baseURL}/productos`);

fetch(`${baseURL}/productos`)
  .then(response => {
    console.log("✅ Respuesta recibida:", response.status);
    return response.json();
  })
  .then(data => {
    console.log("✨ Datos de productos:", data);
    console.log(`Total de productos: ${data.total || data.length}`);
  })
  .catch(error => {
    console.error("❌ Error de conexión:", error);
    console.error("Detalles:", {
      mensaje: error.message,
      tipo: error.name,
      stack: error.stack
    });
  });
