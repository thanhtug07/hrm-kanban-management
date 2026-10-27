@echo off
chcp 65001 >nul
title HRM Health Check
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0HEALTH_CHECK.ps1" %*
pause