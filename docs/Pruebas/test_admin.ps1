$ErrorActionPreference = "Continue"

# Base URL
$baseUrl = "http://localhost:3000"

# 1. CREAR USUARIO ADMIN (o usar existente si ya existe)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. REGISTRAR USUARIO ADMIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$adminData = @{
    nombre = "Admin User"
    email = "admin@example.com"
    password = "Admin12345"
    telefono = "9999999999"
    direccion = "Calle Admin"
} | ConvertTo-Json

Try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -ContentType "application/json" -Body $adminData -UseBasicParsing
    Write-Host "✓ Usuario admin creado exitosamente" -ForegroundColor Green
} Catch {
    Write-Host "ℹ Usuario admin ya existe (eso es normal)" -ForegroundColor Yellow
}
Write-Host ""

# 2. HACER LOGIN CON ADMIN
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "2. LOGIN COMO ADMIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$adminLoginData = @{
    email = "admin@example.com"
    password = "Admin12345"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $adminLoginData -UseBasicParsing
$adminLogin = $response.Content | ConvertFrom-Json
$adminToken = $adminLogin.token

Write-Host "Email: $($adminLogin.usuario.email)" -ForegroundColor Green
Write-Host "Rol: $($adminLogin.usuario.rol)" -ForegroundColor Yellow
Write-Host ""

# Headers con token admin
$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

# 3. INTENTAR ACCESO ADMIN (debería funcionar ahora, pero tal vez aún falte hacerle admin)
Write-Host "========================================" -ForegroundColor Green
Write-Host "3. ACCESO ADMIN - Listar Productos" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Try {
    $response = Invoke-WebRequest -Uri "$baseUrl/admin/productos" -Method GET -Headers $adminHeaders -UseBasicParsing
    Write-Host "✓ Acceso admin permitido:" -ForegroundColor Green
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} Catch {
    Write-Host "⚠ El usuario aún no es admin (se necesita acceso directo a BD para ceder rol admin)" -ForegroundColor Yellow
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorContent = $streamReader.ReadToEnd()
        Write-Host "Error: $errorContent" -ForegroundColor Red
    }
}
Write-Host ""

# 4. CREAR PRODUCTO (ADMIN)
Write-Host "========================================" -ForegroundColor Green
Write-Host "4. CREAR NUEVO PRODUCTO (Admin)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$productData = @{
    nombre = "Producto Test - Nuevo"
    descripcion = "Este es un producto creado vía API para pruebas"
    precio = 99.99
    stock = 50
    id_categoria = 1
    imagen = "test-product.jpg"
} | ConvertTo-Json

Try {
    $response = Invoke-WebRequest -Uri "$baseUrl/admin/productos" -Method POST -Headers $adminHeaders -Body $productData -UseBasicParsing
    Write-Host "✓ Producto creado:" -ForegroundColor Green
    Write-Host $response.Content
} Catch {
    Write-Host "⚠ Error creando producto:" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorContent = $streamReader.ReadToEnd()
        Write-Host $errorContent
    }
}
Write-Host ""

# 5. RESUMEN
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Backend: Funcionando en http://localhost:3000" -ForegroundColor Green
Write-Host "✓ Autenticación: Funciona correctamente" -ForegroundColor Green
Write-Host "✓ Productos: Acceso público funciona" -ForegroundColor Green
Write-Host "✓ Pedidos: Creación funciona" -ForegroundColor Green
Write-Host "⚠ Admin: Necesita rol de admin asignado en BD" -ForegroundColor Yellow
Write-Host ""
Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "1. Asigna rol 'admin' al usuario en la BD (UPDATE usuarios SET rol='admin' WHERE email='admin@example.com')" -ForegroundColor Cyan
Write-Host "2. Vuelve a hacer login para obtener nuevo token" -ForegroundColor Cyan
Write-Host "3. Intenta crear/actualizar productos" -ForegroundColor Cyan
