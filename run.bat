@echo off
chcp 65001 >nul
setlocal

title HRM Portal - Auto Run

cd /d "%~dp0"
set "ROOT=%cd%"

echo ============================================================
echo    HRM PORTAL - KHOI DONG TU DONG
echo    Backend (ASP.NET Core 8)  +  Frontend (React 19)
echo ============================================================
echo.

echo [1/4] Kiem tra cong cu...
where dotnet >nul 2>nul
if errorlevel 1 goto :no_dotnet
echo   [OK] .NET SDK

where node >nul 2>nul
if errorlevel 1 goto :no_node
echo   [OK] Node.js
echo.

echo [2/4] Kiem tra dependencies frontend...
if exist "frontend\node_modules" goto :deps_ok
echo   Dang cai npm packages (lan dau, 1-3 phut)...
pushd frontend
call npm install
popd
if errorlevel 1 goto :npm_fail
echo   [OK] Da cai dependencies
goto :deps_done
:deps_ok
echo   [OK] node_modules da co
:deps_done
echo.

echo [3/4] Build backend...
pushd backend
dotnet build HRM.sln -c Debug --nologo -v quiet
set "RC=%errorlevel%"
popd
if not "%RC%"=="0" goto :build_fail
echo   [OK] Build thanh cong
echo.

echo [4/4] Khoi dong Backend + Frontend...
start "HRM Backend :5100" cmd /k "chcp 65001 >nul && cd /d ""%ROOT%\backend"" && echo === BACKEND http://localhost:5100 === && dotnet run --project HRM.API --launch-profile http --no-build"
timeout /t 4 /nobreak >nul
start "HRM Frontend :5173" cmd /k "chcp 65001 >nul && cd /d ""%ROOT%\frontend"" && echo === FRONTEND http://localhost:5173 === && npm run dev"
timeout /t 7 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo ============================================================
echo    HOAN TAT!
echo    Frontend : http://localhost:5173
echo    Backend  : http://localhost:5100
echo    Swagger  : http://localhost:5100/swagger
echo    Demo     : admin / Admin@123
echo    DB Viewer: tools\db_viewer.bat
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
echo   [X] Build backend that bai.
goto :halt
:halt
echo.
pause
exit /b 1
