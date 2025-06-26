@echo off
title WhatsApp Bot - DeliveryFacil
color 0A
chcp 65001 >nul

echo.
echo  ========================================
echo  🚀 WHATSAPP BOT - DELIVERYFACIL
echo  ========================================
echo.

cd /d "%~dp0"

echo  📋 Compilando codigo...
call npm run build

if %errorlevel% neq 0 (
    echo  ❌ ERRO na compilacao!
    pause
    exit /b 1
)

echo.
echo  ⚡ Escolha como iniciar:
echo.
echo  [1] Normal (npm start)
echo  [2] PM2 (pm2 start)
echo.
set /p choice="Digite 1 ou 2: "

if "%choice%"=="2" (
    echo.
    echo  🚀 Iniciando com PM2...
    pm2 stop DeliveryFacil-ChatBot >nul 2>&1
    pm2 delete DeliveryFacil-ChatBot >nul 2>&1
    pm2 start dist/index.js --name "DeliveryFacil-ChatBot"
    
    if %errorlevel% neq 0 (
        echo  ❌ PM2 falhou, usando NPM...
        npm start
    ) else (
        echo  ✅ Bot rodando com PM2!
        echo  💡 pm2 status - ver status
        echo  💡 pm2 logs DeliveryFacil-ChatBot - ver logs
        pause
    )
) else (
    echo.
    echo  🚀 Iniciando com NPM...
    echo  📱 Aguarde o QR Code aparecer...
    npm start
)

echo.
echo  ❌ Bot foi encerrado.
pause 