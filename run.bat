@echo off
title Hospital System - Local Dev Server
echo.
echo  Starting Hospital System...
echo  Opening browser at http://localhost:5173
echo.

:: Open the browser after a short delay
start "" timeout /t 2 >nul
start "" "http://localhost:5173"

:: Start the dev server
npm run dev

pause
