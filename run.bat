@echo off
chcp 65001 >nul
setlocal

title HRM Portal - Build

cd /d "%~dp0"
set "ROOT=%cd%"

echo ============================================================
echo    HRM PORTAL - BUILD (khong khoi dong server)
echo    Backend (ASP.NET Core 8)  +  Frontend (React 19)
echo ============================================================
echo.

REM ============================================================
REM 0. DON TIEN TRINH CU (tranh lock file khi build)
REM ============================================================
echo [0/3] Don tien trinh cu (neu co)...
taskkill /F /IM HRM.API.exe >nul 2>nul
taskkill /F /IM dotnet.exe >nul 2>nul
echo   [OK] Da don
echo.

REM ============================================================
REM 1. KIEM TRA CONG CU
REM ============================================================
echo [1/3] Kiem tra cong cu...
where dotnet >nul 2>nul
if errorlevel 1 goto :no_dotnet
echo   [OK] .NET SDK

where node >nul 2>nul
if errorlevel 1 goto :no_node
echo   [OK] Node.js
echo.

REM ============================================================
REM 2. CAI DEPENDENCIES + BUILD BACKEND
REM ============================================================
echo [2/3] Build backend...
pushd backend
dotnet build HRM.sln -c Debug --nologo
set "RC=%errorlevel%"
popd
if not "%RC%"=="0" goto :build_fail
echo   [OK] Backend build thanh cong
echo.

REM ============================================================
REM 3. CAI DEPENDENCIES + BUILD FRONTEND
REM ============================================================
echo [3/3] Build frontend...
if exist "frontend\node_modules" goto :deps_ok
echo   Dang cai npm packages (lan dau, 1-3 phut)...
pushd frontend
call npm install
popd
if errorlevel 1 goto :npm_fail
echo   [OK] Da cai dependencies
:deps_ok
pushd frontend
call npm run build
set "RC=%errorlevel%"
popd
if not "%RC%"=="0" goto :fe_build_fail
echo   [OK] Frontend build thanh cong
echo.

echo ============================================================
echo    BUILD HOAN TAT!
echo    Backend  : backend\HRM.API\bin\Debug\net8.0\
echo    Frontend : frontend\dist\
echo.
echo    De CHAY server: nhat dup start.bat
echo ============================================================
exit /b 0

:no_dotnet
echo   [X] Chua cai .NET SDK. Tai: https://dotnet.microsoft.com/download/dotnet/8.0
goto :halt
:no_node
echo   [X] Chua cai Node.js. Tai: https://nodejs.org/
goto :halt
:npm_fail
echo   [X] npm install that bai.
goto :halt
:build_fail
echo   [X] Build backend that bai. Xem loi ben tren.
echo   [i] Goi y: dong cac cua so HRM dang chay roi thu lai.
goto :halt
:fe_build_fail
echo   [X] Build frontend that bai. Xem loi ben tren.
goto :halt
:halt
echo.
pause
exit /b 1