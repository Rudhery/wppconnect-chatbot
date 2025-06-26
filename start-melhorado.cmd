@echo off
title DeliveryFacil ChatBot - Iniciar
color 0A

echo.
echo  ========================================
echo  🚀 DELIVERYFACIL CHATBOT - START
echo  ========================================
echo.

cd "C:\NEXTSISTEM\DeliveryFacil\delivery-facil-chat-bot\"

:: Verifica se está na pasta correta
if not exist "package.json" (
    echo ERRO: Pasta incorreta ou package.json nao encontrado!
    pause
    exit /b 1
)

:: Verifica se node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

:: Verifica se precisa compilar
if not exist "dist\index.js" (
    echo Compilando codigo TypeScript...
    call npm run build
    if %errorlevel% neq 0 (
        echo ERRO: Falha na compilacao!
        pause
        exit /b 1
    )
    echo ✅ Codigo compilado!
) else (
    echo ✅ Codigo ja compilado
)

echo.
echo Verificando PM2...

:: Verifica se o processo já está rodando
pm2 jlist | findstr /i "DeliveryFacil-ChatBot" > nul

if %errorlevel% == 1 (
    echo 🚀 Iniciando novo processo...
    pm2 start dist/index.js --name "DeliveryFacil-ChatBot"
    
    if %errorlevel% == 0 (
        echo ✅ Bot iniciado com sucesso!
        echo 💡 pm2 logs DeliveryFacil-ChatBot - para ver logs
        echo 💡 pm2 status - para ver status
    ) else (
        echo ❌ Erro ao iniciar bot!
    )
) else (
    echo 🔄 Reiniciando processo existente...
    pm2 restart DeliveryFacil-ChatBot
    
    if %errorlevel% == 0 (
        echo ✅ Bot reiniciado com sucesso!
    ) else (
        echo ❌ Erro ao reiniciar bot!
    )
)

echo.
echo 📊 Status atual:
pm2 status

echo.
pause 