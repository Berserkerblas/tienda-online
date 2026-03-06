$ErrorActionPreference = "Continue"

# Base URL
$baseUrl = "http://localhost:3000"

# 1. HACER LOGIN PARA OBTENER TOKEN
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LOGIN - Obteniendo Token" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$loginData = @{
    email = "usuario@test.com"
    password = "Password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginData -UseBasicParsing
$loginResponse = $response.Content | ConvertFrom-Json
$token = $loginResponse.token

Write-Host "✓ Token obtenido para: " $loginResponse.usuario.email -ForegroundColor Green
Write-Host ""

# Headers con token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. CREAR PEDIDO
Write-Host "========================================" -ForegroundColor Green
Write-Host "2. CREAR PEDIDO - POST /pedidos" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$pedidoData = @{
    nombre_envio = "Usuario Test"
    direccion_envio = "Calle Principal 123"
    ciudad_envio = "Madrid"
    cp_envio = "28001"
    lineas = @(
        @{
            id_producto = 1
            cantidad = 2
            precio_unitario = 54.90
        },
        @{
            id_producto = 11
            cantidad = 1
            precio_unitario = 8.90
        }
    )
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri "$baseUrl/pedidos" -Method POST -Headers $headers -Body $pedidoData -UseBasicParsing
$pedidoResponse = $response.Content | ConvertFrom-Json
Write-Host $response.Content
$pedidoId = $pedidoResponse.pedido.id_pedido
Write-Host "Pedido creado con ID: $pedidoId" -ForegroundColor Yellow
Write-Host ""

# 3. LISTAR PEDIDOS DEL USUARIO
Write-Host "========================================" -ForegroundColor Green
Write-Host "3. LISTAR MIS PEDIDOS - GET /pedidos" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$response = Invoke-WebRequest -Uri "$baseUrl/pedidos" -Method GET -Headers $headers -UseBasicParsing
Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
Write-Host ""

# 4. OBTENER DETALLE DE PEDIDO
Write-Host "========================================" -ForegroundColor Green
Write-Host "4. DETALLE DE PEDIDO - GET /pedidos/$pedidoId" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$response = Invoke-WebRequest -Uri "$baseUrl/pedidos/$pedidoId" -Method GET -Headers $headers -UseBasicParsing
Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
Write-Host ""

# 5. INTENTAR ACCEDER A ADMIN (sin ser admin - debería fallar)
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "5. INTENTO DE ACCESO ADMIN (debería fallar)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Try {
    $response = Invoke-WebRequest -Uri "$baseUrl/admin/productos" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "Respuesta: " $response.Content
} Catch {
    Write-Host "❌ Error esperado:" $_.Exception.Response.StatusCode -ForegroundColor Red
    if ($_.Exception.Response) {
        $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorContent = $streamReader.ReadToEnd()
        Write-Host "Mensaje: $errorContent" -ForegroundColor Red
    }
}
Write-Host ""

# 6. LISTAR PRODUCTOS
Write-Host "========================================" -ForegroundColor Green
Write-Host "6. LISTAR UN PRODUCTO - GET /productos/1" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$response = Invoke-WebRequest -Uri "$baseUrl/productos/1" -Method GET -UseBasicParsing
Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
