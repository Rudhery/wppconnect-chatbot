@echo off
title Parar WhatsApp Bot
color 0C
chcp 65001 >nul

echo.
echo  ========================================
echo  🛑 PARAR WHATSAPP BOT
echo  ========================================
echo.

echo  🔍 Procurando processos...

REM Parar PM2 se estiver rodando
pm2 stop DeliveryFacil-ChatBot >nul 2>&1
pm2 delete DeliveryFacil-ChatBot >nul 2>&1

REM Parar Node.js
taskkill /F /IM node.exe >nul 2>&1

echo  ✅ Todos os processos foram parados!
echo.
pause 