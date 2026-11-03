@echo off
chcp 65001 >nul
setlocal

title HRM Portal - Start (Backend + Frontend)

cd /d "%~dp0"
set "ROOT=%cd%"

echo ============================================================
echo    HRM PORTAL - KHOI DONG (Backend + Frontend)
echo ============================================================
echo.

REM Don tien trinh cu tranh trung port
echo [1/2] Don tien trinh cu (neu co)...
taskkill /F /IM HRM.API.exe >nul 2>nul
REM Chi kill tien trinh dang giu cong 5100 / 5173 (tranh kill nham dotnet/node khac)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5100" ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>nul
echo   [OK] Da don
echo.

REM Kiem tra da build chua
if not exist "backend\HRM.API\bin\Debug\net8.0\HRM.API.dll" (
    echo   [!] Backend chua build. Hay chay run.bat truoc.
    goto :halt
)
if not exist "frontend\node_modules" (
    echo   [!] Frontend chua cai dependencies. Hay chay run.bat truoc.
    goto :halt
)
echo [2/2] Khoi dong Backend + Frontend...
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

:halt
echo.
pause
exit /b 1