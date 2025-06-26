@echo off
setlocal enabledelayedexpansion

:: Força codificação para evitar problemas de caracteres
chcp 65001 >nul 2>&1

:: Define pasta de trabalho (mais robusto)
set "WORK_DIR=C:\NEXTSISTEM\DeliveryFacil\delivery-facil-chat-bot"
cd /d "%WORK_DIR%"

:: Verifica se a pasta existe
if not exist "%WORK_DIR%" (
    echo ERRO: Pasta nao encontrada: %WORK_DIR%
    exit /b 1
)

:: Verifica se package.json existe
if not exist "package.json" (
    echo ERRO: package.json nao encontrado na pasta
    exit /b 1
)

:: Verifica se Node.js está disponível
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Node.js nao encontrado no PATH
    exit /b 1
)

:: Verifica se NPM está disponível
npm --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: NPM nao encontrado no PATH
    exit /b 1
)

:: Verifica se PM2 está disponível
pm2 --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: PM2 nao encontrado. Instale com: npm install -g pm2
    exit /b 1
)

:: Verifica se precisa compilar
if not exist "dist\index.js" (
    echo Compilando codigo TypeScript...
    call npm run build
    if !errorlevel! neq 0 (
        echo ERRO: Falha na compilacao TypeScript
        exit /b 1
    )
    echo Codigo compilado com sucesso
)

:: Verifica se o processo já está em execução
pm2 jlist 2>nul | findstr /i "DeliveryFacil-ChatBot" >nul 2>&1
set "PM2_RUNNING=!errorlevel!"

:: Inicia ou reinicia baseado no status
if !PM2_RUNNING! == 1 (
    echo Iniciando novo processo PM2...
    pm2 start dist/index.js --name "DeliveryFacil-ChatBot" >nul 2>&1
    if !errorlevel! neq 0 (
        echo ERRO: Falha ao iniciar processo PM2
        exit /b 1
    )
    echo Processo iniciado com sucesso
) else (
    echo Reiniciando processo existente...
    pm2 restart DeliveryFacil-ChatBot >nul 2>&1
    if !errorlevel! neq 0 (
        echo ERRO: Falha ao reiniciar processo PM2
        exit /b 1
    )
    echo Processo reiniciado com sucesso
)

:: Verifica se o processo está realmente rodando
timeout /t 3 /nobreak >nul 2>&1
pm2 jlist 2>nul | findstr /i "DeliveryFacil-ChatBot" >nul 2>&1
if !errorlevel! neq 0 (
    echo AVISO: Processo pode nao ter iniciado corretamente
    exit /b 1
)

echo Bot DeliveryFacil iniciado com sucesso
exit /b 0
