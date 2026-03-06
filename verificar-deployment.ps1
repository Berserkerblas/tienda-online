# ============================================
# SCRIPT DE VERIFICACIÓN PRE-DEPLOYMENT
# ============================================
# Este script verifica que todo esté listo para desplegar en Railway

Write-Host "🔍 Verificando configuración para Railway..." -ForegroundColor Cyan
Write-Host ""

$errores = 0

# ============================================
# 1. VERIFICAR GIT
# ============================================
Write-Host "📦 Verificando Git..." -ForegroundColor Yellow

if (Test-Path ".git") {
    Write-Host "✅ Repositorio Git inicializado" -ForegroundColor Green
} else {
    Write-Host "❌ No hay repositorio Git. Ejecuta: git init" -ForegroundColor Red
    $errores++
}

# Verificar .gitignore
if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  No hay .gitignore en la raíz" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 2. VERIFICAR BACKEND
# ============================================
Write-Host "🔧 Verificando Backend..." -ForegroundColor Yellow

# Verificar package.json
if (Test-Path "backend/package.json") {
    $packageJson = Get-Content "backend/package.json" -Raw | ConvertFrom-Json
    
    if ($packageJson.scripts.start) {
        Write-Host "✅ Script 'start' encontrado: $($packageJson.scripts.start)" -ForegroundColor Green
    } else {
        Write-Host "❌ Falta script 'start' en backend/package.json" -ForegroundColor Red
        $errores++
    }
} else {
    Write-Host "❌ No se encuentra backend/package.json" -ForegroundColor Red
    $errores++
}

# Verificar .env.ejemplo
if (Test-Path "backend/.env.ejemplo") {
    Write-Host "✅ .env.ejemplo encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Falta backend/.env.ejemplo" -ForegroundColor Red
    $errores++
}

# Verificar .gitignore backend
if (Test-Path "backend/.gitignore") {
    Write-Host "✅ backend/.gitignore encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  No hay backend/.gitignore" -ForegroundColor Yellow
}

# Verificar que .env NO esté en git
$gitStatus = git ls-files "backend/.env" 2>$null
if ($gitStatus) {
    Write-Host "❌ PELIGRO: backend/.env está en Git. Ejecútalo: git rm --cached backend/.env" -ForegroundColor Red
    $errores++
} else {
    Write-Host "✅ .env no está trackeado en Git" -ForegroundColor Green
}

# Verificar nixpacks.toml
if (Test-Path "backend/nixpacks.toml") {
    Write-Host "✅ nixpacks.toml encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  nixpacks.toml no encontrado (opcional)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 3. VERIFICAR FRONTEND
# ============================================
Write-Host "🎨 Verificando Frontend..." -ForegroundColor Yellow

# Verificar package.json
if (Test-Path "frontend/package.json") {
    $packageJson = Get-Content "frontend/package.json" -Raw | ConvertFrom-Json
    
    if ($packageJson.scripts.build) {
        Write-Host "✅ Script 'build' encontrado: $($packageJson.scripts.build)" -ForegroundColor Green
    } else {
        Write-Host "❌ Falta script 'build' en frontend/package.json" -ForegroundColor Red
        $errores++
    }
    
    if ($packageJson.scripts.start) {
        Write-Host "✅ Script 'start' encontrado: $($packageJson.scripts.start)" -ForegroundColor Green
    } else {
        Write-Host "❌ Falta script 'start' en frontend/package.json" -ForegroundColor Red
        $errores++
    }
} else {
    Write-Host "❌ No se encuentra frontend/package.json" -ForegroundColor Red
    $errores++
}

# Verificar .env.ejemplo
if (Test-Path "frontend/.env.ejemplo") {
    Write-Host "✅ .env.ejemplo encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Falta frontend/.env.ejemplo" -ForegroundColor Red
    $errores++
}

# Verificar que .env NO esté en git
$gitStatus = git ls-files "frontend/.env" 2>$null
if ($gitStatus) {
    Write-Host "❌ PELIGRO: frontend/.env está en Git. Ejecuta: git rm --cached frontend/.env" -ForegroundColor Red
    $errores++
} else {
    Write-Host "✅ .env no está trackeado en Git" -ForegroundColor Green
}

Write-Host ""

# ============================================
# 4. VERIFICAR DOCUMENTACIÓN
# ============================================
Write-Host "📚 Verificando Documentación..." -ForegroundColor Yellow

if (Test-Path "README.md") {
    Write-Host "✅ README.md encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  No hay README.md" -ForegroundColor Yellow
}

if (Test-Path "DEPLOYMENT_RAILWAY.md") {
    Write-Host "✅ DEPLOYMENT_RAILWAY.md encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  No hay guía de deployment" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 5. VERIFICAR CONTENIDO EN GIT
# ============================================
Write-Host "📋 Verificando estado de Git..." -ForegroundColor Yellow

$status = git status --porcelain 2>$null
if ($status) {
    Write-Host "⚠️  Hay cambios sin commitear:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    Write-Host "   Ejecuta: git add . && git commit -m 'Preparar para deployment'" -ForegroundColor Cyan
} else {
    Write-Host "✅ No hay cambios pendientes" -ForegroundColor Green
}

Write-Host ""

# ============================================
# 6. RESUMEN
# ============================================
Write-Host "============================================" -ForegroundColor Cyan
if ($errores -eq 0) {
    Write-Host "✅ TODO LISTO PARA DEPLOYMENT" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. git push origin main" -ForegroundColor White
    Write-Host "2. Ir a railway.app y crear proyecto" -ForegroundColor White
    Write-Host "3. Conectar repositorio GitHub" -ForegroundColor White
    Write-Host "4. Ver DEPLOYMENT_RAILWAY.md para más detalles" -ForegroundColor White
} else {
    Write-Host "❌ HAY $errores ERROR(ES) QUE CORREGIR" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa los mensajes arriba y corrige los problemas antes de desplegar." -ForegroundColor Yellow
}
Write-Host "============================================" -ForegroundColor Cyan
