@echo off
chcp 65001 >nul
setlocal

title HRM Portal - Build ^& Run

cd /d "%~dp0"
set "ROOT=%cd%"

echo ============================================================
echo    HRM PORTAL - BUILD ^& RUN
echo    Backend (ASP.NET Core 8)  +  Frontend (React 19)
echo ============================================================
echo.

REM ============================================================
REM 0. DON TIEN TRINH CU (tranh lock file / trung port)
REM ============================================================
echo [0/4] Don tien trinh cu (neu co)...
taskkill /F /IM HRM.API.exe >nul 2>nul
REM Chi kill tien trinh dang giu cong 5100 / 5173 (tranh kill nham dotnet/node khac)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5100" ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>nul
echo   [OK] Da don
echo.

REM ============================================================
REM 1. KIEM TRA CONG CU
REM ============================================================
echo [1/4] Kiem tra cong cu...
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
echo [2/4] Build backend...
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
echo [3/4] Build frontend...
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

REM ============================================================
REM 4. KHOI DONG BACKEND + FRONTEND
REM ============================================================
if not exist "backend\HRM.API\bin\Debug\net8.0\HRM.API.dll" (
    echo   [!] Backend chua build. Hay chay lai run.bat.
    goto :halt
)
if not exist "frontend\node_modules" (
    echo   [!] Frontend chua cai dependencies. Hay chay lai run.bat.
    goto :halt
)
echo [4/4] Khoi dong Backend + Frontend...
start "HRM Backend :5100" cmd /k "chcp 65001 >nul && cd /d ""%ROOT%\backend"" && echo === BACKEND http://localhost:5100 === && dotnet run --project HRM.API --launch-profile http --no-build"
REM Doi backend san sang (toi da ~60s) roi moi mo trinh duyet
echo   Dang doi backend khoi dong...
set "READY="
for /l %%i in (1,1,30) do (
    if not defined READY (
        powershell -NoProfile -Command "try { Invoke-WebRequest -Uri 'http://localhost:5100/api/healthcheck/database' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { if ($_.Exception.Response) { exit 0 } else { exit 1 } }" >nul 2>nul
        if not errorlevel 1 set "READY=1"
        if not defined READY timeout /t 2 /nobreak >nul
    )
)
if not defined READY echo   [!] Backend chua phan hoi sau 60s - van tiep tuc.
start "HRM Frontend :5173" cmd /k "chcp 65001 >nul && cd /d ""%ROOT%\frontend"" && echo === FRONTEND http://localhost:5173 === && npm run dev"
REM Doi frontend (Vite) san sang (toi da ~30s) roi moi mo trinh duyet
echo   Dang doi frontend khoi dong...
set "FE_READY="
for /l %%i in (1,1,15) do (
    if not defined FE_READY (
        powershell -NoProfile -Command "try { Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { if ($_.Exception.Response) { exit 0 } else { exit 1 } }" >nul 2>nul
        if not errorlevel 1 set "FE_READY=1"
        if not defined FE_READY timeout /t 2 /nobreak >nul
    )
)
if not defined FE_READY echo   [!] Frontend chua phan hoi sau 30s - van tiep tuc.
start "" "http://localhost:5173"

echo.
echo ============================================================
echo    HOAN TAT!
echo    Frontend : http://localhost:5173
echo    Backend  : http://localhost:5100
echo    Swagger  : http://localhost:5100/swagger
echo    Demo     : admin / Admin@123
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
