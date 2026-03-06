# Checklist de Deployment - Railway

## ✅ Pre-Deployment

- [ ] Git inicializado (`git init`)
- [ ] .gitignore creados (raíz, backend, frontend)
- [ ] .env NO están en Git
- [ ] .env.ejemplo creados con variables necesarias
- [ ] Backend tiene script `start` en package.json
- [ ] Frontend tiene scripts `build` y `start` en package.json
- [ ] Todos los cambios committed a Git
- [ ] Repositorio subido a GitHub

## ✅ Railway - Configuración Inicial

- [ ] Cuenta creada en [railway.app](https://railway.app)
- [ ] Proyecto nuevo creado
- [ ] Repositorio GitHub conectado

## ✅ Railway - Backend

- [ ] Servicio backend creado
- [ ] Root Directory configurado: `backend`
- [ ] Servicio MySQL agregado
- [ ] Variables de entorno configuradas:
  - [ ] `PORT`
  - [ ] `CORS_ORIGIN`
  - [ ] `JWT_SECRET`
  - [ ] `DB_HOST` (de Railway MySQL)
  - [ ] `DB_PORT` (de Railway MySQL)
  - [ ] `DB_USER` (de Railway MySQL)
  - [ ] `DB_PASS` (de Railway MySQL)
  - [ ] `DB_NAME` (de Railway MySQL)
  - [ ] `EMAIL_*` (Nodemailer)
- [ ] Deploy exitoso
- [ ] URL pública asignada
- [ ] Health check funciona: `/auth/ping`

## ✅ Railway - Base de Datos

- [ ] MySQL provisionado
- [ ] Conectado con cliente MySQL (Workbench/CLI)
- [ ] Schema importado (CREATE TABLE)
- [ ] Datos de prueba importados
- [ ] Verificado: tablas creadas correctamente
- [ ] Usuario admin creado y rol asignado

## ✅ Railway - Frontend

- [ ] Servicio frontend creado
- [ ] Root Directory configurado: `frontend`
- [ ] Build Command: `npm run build`
- [ ] Start Command: (auto o `npm start`)
- [ ] Variables de entorno configuradas:
  - [ ] `VITE_API_URL` (URL del backend de Railway)
- [ ] Deploy exitoso
- [ ] URL pública asignada

## ✅ Configuración Final

- [ ] CORS_ORIGIN del backend actualizado con URL del frontend
- [ ] Backend reiniciado
- [ ] Dominio personalizado configurado (opcional)

## ✅ Verificación Post-Deployment

- [ ] **Backend**:
  - [ ] `/auth/ping` retorna "pong"
  - [ ] `/productos` lista productos
  - [ ] POST `/auth/register` crea usuario
  - [ ] POST `/auth/login` devuelve token
- [ ] **Frontend**:
  - [ ] Página principal carga
  - [ ] Productos se muestran correctamente
  - [ ] Imágenes cargan (desde backend)
  - [ ] Registro funciona
  - [ ] Login funciona
  - [ ] Carrito funciona
  - [ ] Crear pedido funciona
- [ ] **Admin**:
  - [ ] Login como admin funciona
  - [ ] Panel admin accesible
  - [ ] CRUD productos funciona

## ✅ Monitoreo

- [ ] Logs del backend sin errores
- [ ] Logs del frontend sin errores
- [ ] Métricas de Railway revisadas
- [ ] Uso de recursos bajo control

## 🐛 Troubleshooting Checklist

Si algo falla:

- [ ] Revisar logs en Railway Dashboard
- [ ] Verificar variables de entorno (typos, valores correctos)
- [ ] Verificar CORS_ORIGIN (sin `/` al final)
- [ ] Verificar VITE_API_URL (sin `/` al final)
- [ ] Probar endpoints con curl/Postman
- [ ] Verificar conexión a BD (credenciales correctas)
- [ ] Revisar que imágenes estén en backend/public/

## 📊 Costos Estimados

- Backend: ~$2-3 USD/mes
- Frontend: ~$1-2 USD/mes  
- MySQL: ~$2-3 USD/mes
- **Total**: ~$5-8 USD/mes

Plan Hobby (gratis): $5 crédito mensual incluido ✅

---

**Fecha de deployment**: _________________

**URLs de producción**:
- Backend: _________________________________
- Frontend: _________________________________
- Admin: ___________________________________

**Notas adicionales**:
________________________________________
________________________________________
________________________________________
