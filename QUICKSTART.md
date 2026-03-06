# 🚀 Quick Start Guide

Este es un resumen rápido para poner en marcha el proyecto.

## ⚡ Setup Rápido (5 minutos)

### 1. Backend

```bash
cd backend
npm install
cp .env.ejemplo .env

# Edita .env con tus datos de MySQL
# Luego inicia:
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.ejemplo .env

# Inicia:
npm run dev
```

### 3. Base de Datos

```sql
CREATE DATABASE tienda;
-- Importa el schema SQL
```

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API Docs**: Ver `/docs/Pruebas/postman_collection.json`

## 📖 Documentación Completa

- [README.md](./README.md) - Documentación completa del proyecto
- [DEPLOYMENT_RAILWAY.md](./DEPLOYMENT_RAILWAY.md) - Guía de deployment

## 🐛 Problemas Comunes

### Puerto 5173 ocupado
```bash
# En .env del backend cambia:
CORS_ORIGIN=http://localhost:5174
```

### Error de conexión a BD
```bash
# Verifica .env del backend tenga:
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASS=tu_password
DB_NAME=tienda
```

### Frontend no conecta con backend
```bash
# En frontend/.env verifica:
VITE_API_URL=http://localhost:3000
```

## ✅ Verificar que todo funciona

1. Backend: http://localhost:3000/auth/ping → debe retornar "pong"
2. Frontend: http://localhost:5173 → debe mostrar página principal
3. Productos: http://localhost:3000/productos → debe listar productos

¡Listo! 🎉
