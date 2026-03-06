# 🚀 Guía de Deployment en Railway

## 📋 Prerequisitos

1. Cuenta en [Railway.app](https://railway.app) (puedes usar GitHub login)
2. [Railway CLI](https://docs.railway.app/develop/cli) instalado (opcional, pero recomendado)
3. Git instalado

## 🗂️ Estructura del Proyecto

Este proyecto tiene 2 componentes que se despliegan por separado:
- **Backend**: Node.js + Express + MySQL (API REST)
- **Frontend**: React + Vite (SPA)

---

## 🎯 PASO 1: Preparar el Repositorio

### 1.1 Inicializar Git (si no lo has hecho)

```bash
cd c:\Users\blasl\Desktop\tienda
git init
git add .
git commit -m "Initial commit - Tienda online proyecto"
```

### 1.2 Subir a GitHub

1. Crea un nuevo repositorio en GitHub: [github.com/new](https://github.com/new)
2. Nómbralo `tienda-online` (o como prefieras)
3. NO marques "Initialize with README"
4. Ejecuta estos comandos:

```bash
git remote add origin https://github.com/TU-USUARIO/tienda-online.git
git branch -M main
git push -u origin main
```

---

## 🔧 PASO 2: Desplegar el Backend en Railway

### 2.1 Crear Proyecto en Railway

1. Ve a [railway.app/new](https://railway.app/new)
2. Selecciona **"Deploy from GitHub repo"**
3. Autoriza Railway a acceder a tus repos
4. Selecciona el repo `tienda-online`

### 2.2 Configurar el Servicio Backend

1. Railway detectará que hay múltiples proyectos
2. En la configuración del servicio:
   - **Name**: `tienda-backend`
   - **Root Directory**: `backend`
   - **Build Command**: (dejar vacío o `npm install`)
   - **Start Command**: `npm start`

### 2.3 Agregar Base de Datos MySQL

1. En tu proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"Database"** → **"Add MySQL"**
3. Railway creará automáticamente una instancia MySQL
4. Copia la URL de conexión (la necesitarás)

### 2.4 Configurar Variables de Entorno del Backend

En el servicio `tienda-backend`, ve a **"Variables"** y agrega:

```bash
# Puerto (Railway lo asigna automáticamente)
PORT=${{ PORT }}

# CORS - URL del frontend (la configuraremos después)
CORS_ORIGIN=https://tu-frontend.up.railway.app

# JWT Secret - Genera uno seguro con: openssl rand -base64 32
JWT_SECRET=tu_clave_jwt_super_secreta_aqui

# Base de Datos - Usa las variables de Railway MySQL
DB_HOST=${{ MYSQL_HOST }}
DB_PORT=${{ MYSQL_PORT }}
DB_USER=${{ MYSQL_USER }}
DB_PASS=${{ MYSQL_PASSWORD }}
DB_NAME=${{ MYSQL_DATABASE }}

# Email (Nodemailer)
EMAIL_ENABLED=true
EMAIL_FROM="Gondor <tu-email@gmail.com>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu_app_password_aqui
```

**Nota importante**: Railway provee variables automáticas como `${{ MYSQL_HOST }}`. Usa esas en lugar de valores hardcodeados.

### 2.5 Importar la Base de Datos

1. Conéctate a la BD de Railway usando MySQL Workbench o CLI:

```bash
mysql -h <MYSQL_HOST> -P <MYSQL_PORT> -u <MYSQL_USER> -p<MYSQL_PASSWORD> <MYSQL_DATABASE>
```

2. Ejecuta tu script SQL para crear tablas y datos iniciales:

```sql
-- Crea las tablas: usuarios, productos, pedidos, lineas_pedidos
-- Inserta productos iniciales
-- (Usa tu script SQL actual de la BD local)
```

**Tip**: Puedes exportar tu BD local con:
```bash
mysqldump -u jorge -p tienda > backup_tienda.sql
```

Y luego importarlo a Railway:
```bash
mysql -h <RAILWAY_HOST> -P <PORT> -u <USER> -p<PASSWORD> <DATABASE> < backup_tienda.sql
```

### 2.6 Deploy del Backend

1. Railway hace auto-deploy al detectar cambios en `main`
2. Espera 2-3 minutos mientras se despliega
3. Copia la URL generada (ej: `https://tienda-backend-production.up.railway.app`)
4. Prueba el endpoint: `https://tu-backend.up.railway.app/auth/ping`

---

## 🎨 PASO 3: Desplegar el Frontend en Railway

### 3.1 Crear Nuevo Servicio

1. En el mismo proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"GitHub Repo"** → selecciona `tienda-online`
3. Configura el servicio:
   - **Name**: `tienda-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: (dejar vacío, Railway usará el build estático)

### 3.2 Configurar Variables de Entorno del Frontend

En el servicio `tienda-frontend`, ve a **"Variables"** y agrega:

```bash
# URL del backend (la que copiaste del paso 2.6)
VITE_API_URL=https://tienda-backend-production.up.railway.app
```

### 3.3 Configurar Railway para Servir SPA

Railway necesita un servidor simple para servir el frontend. Agrega esto:

**En `frontend/package.json`**, modifica los scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite preview --host 0.0.0.0 --port $PORT"
  },
  "dependencies": {
    "axios": "^1.13.6",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.1"
  }
}
```

### 3.4 Deploy del Frontend

1. Haz commit del cambio en `package.json`:

```bash
git add frontend/package.json
git commit -m "Add Railway start script for frontend"
git push origin main
```

2. Railway hará auto-deploy
3. Copia la URL generada (ej: `https://tienda-frontend-production.up.railway.app`)

---

## 🔄 PASO 4: Actualizar CORS en el Backend

Ahora que tienes la URL del frontend, actualiza la variable de entorno:

1. Ve al servicio `tienda-backend` en Railway
2. En **"Variables"**, actualiza:

```bash
CORS_ORIGIN=https://tienda-frontend-production.up.railway.app
```

3. Railway reiniciará automáticamente el backend

---

## ✅ PASO 5: Verificar el Deployment

### 5.1 Prueba el Backend

```bash
# Health check
curl https://tu-backend.up.railway.app/auth/ping

# Listar productos
curl https://tu-backend.up.railway.app/productos
```

### 5.2 Prueba el Frontend

1. Abre `https://tu-frontend.up.railway.app` en el navegador
2. Verifica que:
   - ✅ Se carga la página principal
   - ✅ Se muestran productos
   - ✅ Puedes registrarte/iniciar sesión
   - ✅ Puedes agregar productos al carrito
   - ✅ Puedes crear pedidos

---

## 🛠️ Comandos Útiles de Railway CLI

Instala Railway CLI:

```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# Mac/Linux
curl -fsSL https://railway.app/install.sh | sh
```

Comandos útiles:

```bash
# Login
railway login

# Ver proyectos
railway list

# Conectar al proyecto
railway link

# Ver logs del backend
railway logs --service tienda-backend

# Ver logs del frontend
railway logs --service tienda-frontend

# Abrir proyecto en navegador
railway open

# Ejecutar migraciones o scripts en Railway
railway run npm run migrate
```

---

## 📊 Monitoreo y Mantenimiento

### Variables de Entorno

- Backend: Railway Dashboard → tienda-backend → Variables
- Frontend: Railway Dashboard → tienda-frontend → Variables

### Logs

- En tiempo real: Railway Dashboard → Service → Deployments → View Logs
- CLI: `railway logs --service <nombre-servicio>`

### Base de Datos

- Conectar: Usa las credenciales de `${{ MYSQL_* }}` en MySQL Workbench
- Backups: Railway hace backups automáticos (plan Pro)
- Consola: Railway Dashboard → MySQL → Data

### Auto-Deploy

Railway hace auto-deploy en cada `git push` a la rama `main`:
- Detecta cambios en `backend/` → redeploy backend
- Detecta cambios en `frontend/` → redeploy frontend

Para desactivar auto-deploy: Service Settings → Uncheck "Auto Deploy"

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

- Verifica que las variables `DB_*` estén configuradas
- Verifica que el servicio MySQL esté running
- Chequea los logs: `railway logs --service tienda-backend`

### Error: "CORS blocked"

- Verifica que `CORS_ORIGIN` en backend tenga la URL correcta del frontend
- NO incluyas `/` al final de la URL
- Formato correcto: `https://tienda-frontend-production.up.railway.app`

### Error: "API requests fail (404/500)"

- Verifica que `VITE_API_URL` en frontend esté correcta
- Abre DevTools → Network → verifica la URL llamada
- Chequea: NO debe incluir `/` al final

### Frontend muestra página en blanco

- Verifica los logs: `railway logs --service tienda-frontend`
- Asegúrate de que el build se completó: `Build Command: npm run build`
- Verifica que `vite.config.js` esté correcto

### Imágenes no se cargan

- Verifica que la carpeta `backend/public/productos/` se subió a git
- Las imágenes se sirven desde: `https://tu-backend.up.railway.app/productos/imagen.jpg`

---

## 💰 Costos de Railway

- **Hobby Plan (Gratis)**:
  - $5 USD de crédito mensual
  - Suficiente para 2-3 servicios pequeños
  - Sin tarjeta de crédito requerida

- **Developer Plan ($5/mes)**:
  - $5 USD base + uso
  - Sin límites de servicios
  - Backups automáticos

**Estimación para este proyecto**:
- Backend: ~$2-3 USD/mes
- Frontend: ~$1-2 USD/mes
- MySQL: ~$2-3 USD/mes
- **Total**: ~$5-8 USD/mes

---

## 🔐 Seguridad

### Variables Sensibles

NUNCA subas a git:
- ❌ `.env` (está en .gitignore)
- ❌ Contraseñas de BD
- ❌ JWT_SECRET
- ❌ SMTP_PASS

Siempre usa:
- ✅ Variables de entorno de Railway
- ✅ `.env.ejemplo` (sin valores reales)

### JWT Secret

Genera uno seguro:

```bash
# En PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# En Linux/Mac
openssl rand -base64 32
```

### SSL/HTTPS

Railway provee HTTPS automáticamente en todos los servicios ✅

---

## 📚 Recursos Adicionales

- [Railway Docs](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway Templates](https://railway.app/templates)
- [Nixpacks (Build System)](https://nixpacks.com/)

---

## 🎉 ¡Listo!

Tu tienda online ya está desplegada en Railway:
- 🌐 Frontend: `https://tienda-frontend-production.up.railway.app`
- 🔌 Backend: `https://tienda-backend-production.up.railway.app`
- 🗄️ Base de Datos: MySQL en Railway

**Próximos pasos sugeridos**:
1. Configurar dominio personalizado (ej: `www.mitienda.com`)
2. Configurar backups automáticos de BD
3. Implementar CI/CD con tests
4. Agregar monitoreo (Sentry, LogRocket)
5. Optimizar imágenes (CDN, lazy loading)
