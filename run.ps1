<#
    run.ps1 — Khoi dong HRM Portal (Backend + Frontend) tu dong.
    Cach dung:  .\run.ps1
#>

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   HRM PORTAL - KHOI DONG TU DONG" -ForegroundColor Cyan
Write-Host "   Backend (.NET 8)  +  Frontend (React 19)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

function Fail($msg) {
    Write-Host "[X] $msg" -ForegroundColor Red
    exit 1
}

# 1. Kiem tra cong cu
Write-Host "[1/4] Kiem tra cong cu..." -ForegroundColor Yellow
try { $dn = dotnet --version; Write-Host "  [OK] .NET SDK $dn" -ForegroundColor Green } catch { Fail ".NET SDK chua cai. Tai: https://dotnet.microsoft.com/download/dotnet/8.0" }
try { $nv = node --version; Write-Host "  [OK] Node.js $nv" -ForegroundColor Green } catch { Fail "Node.js chua cai. Tai: https://nodejs.org/" }

# 2. Kiem tra DB
Write-Host ""
Write-Host "[2/4] Kiem tra co so du lieu QUANLYNHANSU..." -ForegroundColor Yellow
$sqlcmd = Get-Command sqlcmd -ErrorAction SilentlyContinue
if ($sqlcmd) {
    $check = & sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "IF DB_ID('QUANLYNHANSU') IS NOT NULL SELECT 1" -h -1 2>$null
    if ($check -match "1") {
        Write-Host "  [OK] Database da ton tai" -ForegroundColor Green
    } else {
        Write-Host "  DB chua co - dang tao tu QUANLYNHANSU.sql..." -ForegroundColor Yellow
        & sqlcmd -S "(localdb)\MSSQLLocalDB" -i (Join-Path $Root "QUANLYNHANSU.sql") -f 65001 | Out-Null
        Write-Host "  [OK] Da tao database" -ForegroundColor Green
    }
} else {
    Write-Host "  [!] Khong co sqlcmd - bo qua kiem tra DB" -ForegroundColor DarkYellow
}

# 3. npm install neu thieu
Write-Host ""
Write-Host "[3/4] Kiem tra dependencies frontend..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $Frontend "node_modules"))) {
    Write-Host "  Dang cai npm packages (lan dau)..." -ForegroundColor Yellow
    Push-Location $Frontend; npm install; Pop-Location
    Write-Host "  [OK] Da cai xong" -ForegroundColor Green
} else {
    Write-Host "  [OK] node_modules da co" -ForegroundColor Green
}

# 4. Build backend
Write-Host ""
Write-Host "[4/4] Build backend..." -ForegroundColor Yellow
Push-Location $Backend
dotnet build HRM.sln -c Debug --nologo -v quiet | Out-Null
$rc = $LASTEXITCODE
Pop-Location
if ($rc -ne 0) { Fail "Build backend that bai" }
Write-Host "  [OK] Build thanh cong" -ForegroundColor Green

# 5. Chay 2 service
Write-Host ""
Write-Host "Khoi dong Backend + Frontend..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k", "chcp 65001 >nul && cd /d `"$Backend`" && echo === BACKEND http://localhost:5100 === && dotnet run --project HRM.API --launch-profile http --no-build"
Start-Sleep -Seconds 4
Start-Process cmd -ArgumentList "/k", "chcp 65001 >nul && cd /d `"$Frontend`" && echo === FRONTEND http://localhost:5173 === && npm run dev"
Start-Sleep -Seconds 6
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "   HOAN TAT!" -ForegroundColor Green
Write-Host "   Frontend : http://localhost:5173" -ForegroundColor Green
Write-Host "   Backend  : http://localhost:5100" -ForegroundColor Green
Write-Host "   Swagger  : http://localhost:5100/swagger" -ForegroundColor Green
Write-Host "   Demo     : admin / Admin@123" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
