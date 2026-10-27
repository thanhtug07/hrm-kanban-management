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
taskkill /F /IM dotnet.exe >nul 2>nul
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
timeout /t 5 /nobreak >nul
start "HRM Frontend :5173" cmd /k "chcp 65001 >nul && cd /d ""%ROOT%\frontend"" && echo === FRONTEND http://localhost:5173 === && npm run dev"
timeout /t 8 /nobreak >nul
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