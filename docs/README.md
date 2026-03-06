# 🛒 Tienda Online - Juegos de Mesa y Cartas

> Plataforma e-commerce full-stack para venta de juegos de mesa (Warhammer, Magic: The Gathering, Pokémon, One Piece, Lorcana)

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Railway](https://img.shields.io/badge/Deploy-Railway-blueviolet.svg)](https://railway.app/)

---

## 📋 Características

- ✅ **Catálogo de productos** con filtros (categoría, precio, búsqueda, stock)
- ✅ **Autenticación JWT** (registro, login, sesiones persistentes)
- ✅ **Carrito de compras** con localStorage
- ✅ **Gestión de pedidos** (crear, listar, ver detalles)
- ✅ **Generación de tickets PDF** automática
- ✅ **Panel de administración** (CRUD productos)
- ✅ **Email automático** con Nodemailer
- ✅ **Carga de imágenes** para productos
- ✅ **Responsive design** para móviles

---

## 🏗️ Arquitectura

```
tienda/
├── backend/          # API REST (Node.js + Express)
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── services/       # Acceso a datos
│   │   ├── routes/         # Definición de endpoints
│   │   ├── middlewares/    # Auth, validación, uploads
│   │   └── db/             # Conexión MySQL
│   └── public/             # Imágenes de productos
│
├── frontend/         # SPA (React + Vite)
│   └── src/
│       ├── components/     # Header, Footer, Cards
│       ├── pages/          # Páginas de la app
│       ├── context/        # Auth y Carrito (Context API)
│       ├── services/       # Llamadas a API
│       └── router/         # Rutas protegidas
│
└── docs/             # Documentación y pruebas
    └── Pruebas/            # Postman, scripts PowerShell
```

---

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+
- MySQL 8.0+
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU-USUARIO/tienda-online.git
cd tienda-online
```

### 2. Configurar el Backend

```bash
cd backend
npm install

# Copiar archivo de ejemplo y editarlo
cp .env.ejemplo .env
# Edita .env con tus credenciales de MySQL
```

**Crear base de datos**:

```sql
CREATE DATABASE tienda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Importa el schema SQL (tablas + datos de ejemplo):

```bash
mysql -u tu_usuario -p tienda < database/schema.sql
```

**Iniciar servidor**:

```bash
npm run dev  # Desarrollo (nodemon)
npm start    # Producción
```

El backend correrá en `http://localhost:3000`

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install

# Copiar archivo de ejemplo
cp .env.ejemplo .env
# Asegúrate de que VITE_API_URL=http://localhost:3000
```

**Iniciar aplicación**:

```bash
npm run dev
```

El frontend correrá en `http://localhost:5173`

---

## 📡 API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Crear usuario | ❌ |
| POST | `/auth/login` | Iniciar sesión | ❌ |
| GET | `/auth/me` | Datos del usuario actual | ✅ |
| GET | `/auth/ping` | Health check | ❌ |

### Productos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/productos` | Listar productos (filtros, paginación) | ❌ |
| GET | `/productos/:id` | Detalle de producto | ❌ |

### Pedidos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/pedidos` | Crear pedido | ✅ |
| GET | `/pedidos` | Listar pedidos del usuario | ✅ |
| GET | `/pedidos/:id` | Detalle de pedido | ✅ |
| GET | `/pedidos/:id/ticket` | Descargar PDF | ✅ |

### Admin (requiere rol `admin`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/admin/productos` | Listar todos los productos | 🔐 |
| POST | `/admin/productos` | Crear producto | 🔐 |
| PUT | `/admin/productos/:id` | Actualizar producto | 🔐 |
| PATCH | `/admin/productos/:id/estado` | Cambiar estado | 🔐 |

---

## 🧪 Testing

### Postman

Importa las colecciones desde `docs/Pruebas/`:
- `postman_collection.json` - 18 endpoints
- `postman_environment.json` - Variables de entorno

### PowerShell Scripts

```bash
cd docs/Pruebas

# Pruebas básicas (auth + productos)
.\test_backend.ps1

# Pruebas de pedidos
.\test_pedidos_admin.ps1

# Pruebas de admin
.\test_admin.ps1
```

---

## 🔐 Seguridad

- **JWT Tokens**: Expiran en 7 días
- **Bcrypt**: Hash de contraseñas con salt rounds = 10
- **CORS**: Configurado por variable de entorno
- **Validación**: Backend valida todos los inputs
- **SQL Injection**: Protegido con prepared statements (mysql2)
- **Middlewares**: Auth y roles separados

---

## 🌍 Deployment

### Railway (Recomendado)

Guía completa: [DEPLOYMENT_RAILWAY.md](./DEPLOYMENT_RAILWAY.md)

```bash
# 1. Crear proyecto en Railway
# 2. Conectar repositorio GitHub
# 3. Agregar servicio MySQL
# 4. Configurar variables de entorno
# 5. Deploy automático
```

### Otros proveedores

- **Heroku**: Usar Heroku Postgres en lugar de MySQL
- **Vercel**: Solo frontend (backend en Railway/Render)
- **DigitalOcean**: App Platform + Managed Database
- **AWS**: EC2 + RDS MySQL

---

## 📦 Tecnologías

### Backend
- **Node.js** 18+ con Express 5
- **MySQL2** (async/await)
- **JWT** para autenticación
- **Nodemailer** para emails
- **PDFKit** para generar tickets
- **Express-fileupload** para imágenes

### Frontend
- **React** 19 con Hooks
- **Vite** como bundler
- **React Router** v7 para navegación
- **Context API** para estado global
- **Axios** para HTTP requests
- **CSS Modules** para estilos

### Database
- **MySQL** 8.0
- Relaciones: usuarios → pedidos → lineas_pedidos → productos
- Transacciones para pedidos (ACID)

---

## 🗄️ Schema de Base de Datos

```sql
usuarios
├── id_usuario (PK)
├── nombre
├── email (UNIQUE)
├── password (HASHED)
├── telefono
├── direccion
└── rol (enum: 'cliente', 'admin')

productos
├── id_producto (PK)
├── nombre
├── categoria
├── descripcion
├── precio
├── stock
└── imagen_url

pedidos
├── id_pedido (PK)
├── id_usuario (FK)
├── fecha
├── estado (enum: 'pendiente', 'enviado', 'entregado', 'cancelado')
├── total
├── nombre_envio
├── direccion_envio
└── ciudad_envio

lineas_pedidos
├── id_linea (PK)
├── id_pedido (FK)
├── id_producto (FK)
├── cantidad
└── precio_unitario
```

---

## 👥 Usuarios de Prueba

```bash
# Cliente regular
Email: usuario@test.com
Password: Password123

# Administrador (requiere UPDATE en BD)
Email: admin@example.com
Password: Admin12345
# SQL: UPDATE usuarios SET rol='admin' WHERE email='admin@example.com';
```

---

## 📝 Roadmap

- [ ] Sistema de reseñas y valoraciones
- [ ] Recuperación de contraseña por email
- [ ] Dashboard admin con estadísticas
- [ ] Integración con pasarelas de pago (Stripe/PayPal)
- [ ] Sistema de cupones y descuentos
- [ ] Búsqueda avanzada con Elasticsearch
- [ ] Tests unitarios y e2e (Jest, Cypress)
- [ ] PWA para instalación móvil
- [ ] Notificaciones push
- [ ] Multi-idioma (i18n)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

## 📧 Contacto

- Autor: Jorge (Gondor)
- Email: blaslopezgil@gmail.com
- GitHub: [@TU-USUARIO](https://github.com/TU-USUARIO)

---

## ⭐ Agradecimientos

- Inspirado en tiendas de juegos de mesa reales
- Imágenes de productos (Warhammer, MTG, Pokemon, etc.)
- Comunidad de Railway y Vite

---

**¿Te gusta el proyecto? Dale una ⭐ en GitHub!**
