# ============================================
# COMANDOS ÚTILES PARA DEPLOYMENT EN RAILWAY
# ============================================

Write-Host "🚀 Comandos útiles para Railway Deployment" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. PREPARACIÓN DE GIT
# ============================================
Write-Host "📦 1. PREPARACIÓN DE GIT" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Inicializar Git (si no lo has hecho)" -ForegroundColor Gray
Write-Host "git init" -ForegroundColor White
Write-Host ""
Write-Host "# Agregar todos los archivos" -ForegroundColor Gray
Write-Host "git add ." -ForegroundColor White
Write-Host ""
Write-Host "# Hacer commit" -ForegroundColor Gray
Write-Host "git commit -m 'Initial commit - Ready for Railway deployment'" -ForegroundColor White
Write-Host ""
Write-Host "# Conectar con GitHub (crea el repo primero en github.com)" -ForegroundColor Gray
Write-Host "git remote add origin https://github.com/TU-USUARIO/tienda-online.git" -ForegroundColor White
Write-Host "git branch -M main" -ForegroundColor White
Write-Host "git push -u origin main" -ForegroundColor White
Write-Host ""

# ============================================
# 2. RAILWAY CLI
# ============================================
Write-Host "🚄 2. RAILWAY CLI (Opcional pero recomendado)" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Instalar Railway CLI (PowerShell)" -ForegroundColor Gray
Write-Host "iwr https://railway.app/install.ps1 | iex" -ForegroundColor White
Write-Host ""
Write-Host "# Login en Railway" -ForegroundColor Gray
Write-Host "railway login" -ForegroundColor White
Write-Host ""
Write-Host "# Ver proyectos" -ForegroundColor Gray
Write-Host "railway list" -ForegroundColor White
Write-Host ""
Write-Host "# Conectar proyecto actual a Railway" -ForegroundColor Gray
Write-Host "railway link" -ForegroundColor White
Write-Host ""
Write-Host "# Ver logs del backend" -ForegroundColor Gray
Write-Host "railway logs --service tienda-backend" -ForegroundColor White
Write-Host ""
Write-Host "# Ver logs del frontend" -ForegroundColor Gray
Write-Host "railway logs --service tienda-frontend" -ForegroundColor White
Write-Host ""
Write-Host "# Abrir Railway Dashboard" -ForegroundColor Gray
Write-Host "railway open" -ForegroundColor White
Write-Host ""

# ============================================
# 3. BACKUP DE BASE DE DATOS
# ============================================
Write-Host "💾 3. BACKUP DE BASE DE DATOS" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Exportar BD local" -ForegroundColor Gray
Write-Host "mysqldump -u jorge -p tienda > backup_tienda.sql" -ForegroundColor White
Write-Host ""
Write-Host "# Importar a Railway (reemplaza con tus credenciales)" -ForegroundColor Gray
Write-Host "mysql -h <RAILWAY_HOST> -P <PORT> -u <USER> -p<PASSWORD> <DATABASE> < backup_tienda.sql" -ForegroundColor White
Write-Host ""

# ============================================
# 4. GENERAR JWT SECRET
# ============================================
Write-Host "🔐 4. GENERAR JWT SECRET SEGURO" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Generar clave aleatoria segura (PowerShell)" -ForegroundColor Gray
Write-Host "Para generar una clave JWT segura, ejecuta:" -ForegroundColor White
Write-Host ""
$jwtSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor Green
Write-Host ""
Write-Host "Copia esta clave y úsala en las variables de entorno de Railway" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 5. VERIFICAR DEPLOYMENT
# ============================================
Write-Host "✅ 5. VERIFICAR DEPLOYMENT" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Verificar backend health" -ForegroundColor Gray
Write-Host "curl https://tu-backend.up.railway.app/auth/ping" -ForegroundColor White
Write-Host ""
Write-Host "# Listar productos" -ForegroundColor Gray
Write-Host "curl https://tu-backend.up.railway.app/productos" -ForegroundColor White
Write-Host ""
Write-Host "# Verificar frontend (en navegador)" -ForegroundColor Gray
Write-Host "start https://tu-frontend.up.railway.app" -ForegroundColor White
Write-Host ""

# ============================================
# 6. COMANDOS DE MANTENIMIENTO
# ============================================
Write-Host "🔧 6. MANTENIMIENTO" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Ver status de servicios" -ForegroundColor Gray
Write-Host "railway status" -ForegroundColor White
Write-Host ""
Write-Host "# Forzar rebuild" -ForegroundColor Gray
Write-Host "railway up --detach" -ForegroundColor White
Write-Host ""
Write-Host "# Reiniciar servicio" -ForegroundColor Gray
Write-Host "# (Desde Railway Dashboard -> Service -> Settings -> Restart)" -ForegroundColor White
Write-Host ""

# ============================================
# 7. ACTUALIZAR DESPUÉS DE CAMBIOS
# ============================================
Write-Host "🔄 7. ACTUALIZAR DEPLOYMENT" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Hacer cambios en el código, luego:" -ForegroundColor Gray
Write-Host "git add ." -ForegroundColor White
Write-Host "git commit -m 'Descripción de cambios'" -ForegroundColor White
Write-Host "git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "Railway detectará el push y hará auto-deploy" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 8. ASIGNAR ROL ADMIN
# ============================================
Write-Host "👑 8. ASIGNAR ROL ADMIN A USUARIO" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Conecta a la BD de Railway y ejecuta:" -ForegroundColor Gray
Write-Host "UPDATE usuarios SET rol='admin' WHERE email='tu-email@example.com';" -ForegroundColor White
Write-Host ""

# ============================================
# RESUMEN
# ============================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 ORDEN RECOMENDADO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. .\verificar-deployment.ps1  (verificar que todo esté listo)" -ForegroundColor White
Write-Host "2. git push origin main  (subir a GitHub)" -ForegroundColor White
Write-Host "3. Crear proyecto en railway.app" -ForegroundColor White
Write-Host "4. Conectar repo + configurar servicios" -ForegroundColor White
Write-Host "5. Agregar MySQL + configurar variables" -ForegroundColor White
Write-Host "6. Importar backup de BD" -ForegroundColor White
Write-Host "7. Verificar que funcione todo" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación completa: DEPLOYMENT_RAILWAY.md" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
