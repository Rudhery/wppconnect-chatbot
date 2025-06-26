@echo off
title Instalar como Serviço
color 0B
chcp 65001 >nul

echo.
echo  ========================================
echo  🔧 INSTALAR COMO SERVIÇO WINDOWS
echo  ========================================
echo.
echo  ⚠️ Execute como ADMINISTRADOR!
echo.
pause

echo  📦 Instalando PM2...
npm install -g pm2

echo.
echo  🚀 Compilando e iniciando...
call npm run build
pm2 start dist/index.js --name "DeliveryFacil-ChatBot"

echo.
echo  💾 Salvando configuração...
pm2 save

echo.
echo  🔧 Configurando startup...
pm2 startup

echo.
echo  ✅ SERVIÇO CONFIGURADO!
echo.
echo  🎯 Agora o bot:
echo     ✅ Inicia automaticamente com Windows
echo     ✅ Reinicia se der erro
echo     ✅ Roda sempre em background
echo.
echo  💡 Comandos úteis:
echo     pm2 status
echo     pm2 logs DeliveryFacil-ChatBot
echo.
pause 