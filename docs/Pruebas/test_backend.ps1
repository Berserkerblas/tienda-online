$ErrorActionPreference = "Continue"

# Base URL
$baseUrl = "http://localhost:3000"

# 1. PRUEBA: PING
Write-Host "========================================" -ForegroundColor Green
Write-Host "1. PRUEBA: GET /auth/ping" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
$response = Invoke-WebRequest -Uri "$baseUrl/auth/ping" -Method GET -UseBasicParsing
Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
Write-Host ""

# 2. PRUEBA: REGISTER
Write-Host "========================================" -ForegroundColor Green
Write-Host "2. PRUEBA: POST /auth/register" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$registerData = @{
    nombre = "Usuario Test"
    email = "usuario@test.com"
    password = "Password123"
    telefono = "1234567890"
    direccion = "Calle Test 123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -ContentType "application/json" -Body $registerData -UseBasicParsing
$registerResponse = $response.Content | ConvertFrom-Json
Write-Host $response.Content

# Guardar token
$token = $registerResponse.token
Write-Host "Token obtenido: $token" -ForegroundColor Yellow
Write-Host ""

# 3. PRUEBA: GET /productos
Write-Host "========================================" -ForegroundColor Green
Write-Host "3. PRUEBA: GET /productos (sin token)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
$response = Invoke-WebRequest -Uri "$baseUrl/productos" -Method GET -UseBasicParsing
Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
Write-Host ""

# 4. PRUEBA: LOGIN
Write-Host "========================================" -ForegroundColor Green
Write-Host "4. PRUEBA: POST /auth/login" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$loginData = @{
    email = "usuario@test.com"
    password = "Password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginData -UseBasicParsing
$loginResponse = $response.Content | ConvertFrom-Json
Write-Host $response.Content

$token = $loginResponse.token
Write-Host "Token de login: $token" -ForegroundColor Yellow
Write-Host ""

# 5. PRUEBA: GET /auth/me
Write-Host "========================================" -ForegroundColor Green
Write-Host "5. PRUEBA: GET /auth/me (con token)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
}

$response = Invoke-WebRequest -Uri "$baseUrl/auth/me" -Method GET -Headers $headers -UseBasicParsing
Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
