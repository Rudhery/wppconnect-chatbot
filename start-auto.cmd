@echo off
setlocal enabledelayedexpansion

:: Script otimizado para execução por software automatizado
:: Sem pause, com exit codes claros e logs estruturados

:: Suprime todos os outputs desnecessários
set "LOG_PREFIX=[DeliveryFacil-Bot]"

:: Vai para pasta de trabalho
cd /d "C:\NEXTSISTEM\DeliveryFacil\delivery-facil-chat-bot" 2>nul
if !errorlevel! neq 0 (
    echo %LOG_PREFIX% ERRO: Nao foi possivel acessar a pasta do bot
    exit /b 2
)

:: Verifica dependências críticas silenciosamente
node --version >nul 2>&1 || (echo %LOG_PREFIX% ERRO: Node.js nao encontrado & exit /b 3)
npm --version >nul 2>&1 || (echo %LOG_PREFIX% ERRO: NPM nao encontrado & exit /b 4)
pm2 --version >nul 2>&1 || (echo %LOG_PREFIX% ERRO: PM2 nao encontrado & exit /b 5)

:: Compila se necessário (silencioso)
if not exist "dist\index.js" (
    echo %LOG_PREFIX% Compilando TypeScript...
    npm run build >nul 2>&1
    if !errorlevel! neq 0 (
        echo %LOG_PREFIX% ERRO: Falha na compilacao
        exit /b 6
    )
)

:: Verifica status PM2 e decide ação
pm2 jlist 2>nul | findstr /i "DeliveryFacil-ChatBot" >nul 2>&1

if !errorlevel! == 1 (
    :: Processo não existe - iniciar
    pm2 start dist/index.js --name "DeliveryFacil-ChatBot" >nul 2>&1
    set "ACTION=INICIADO"
) else (
    :: Processo existe - reiniciar
    pm2 restart DeliveryFacil-ChatBot >nul 2>&1
    set "ACTION=REINICIADO"
)

:: Verifica se a ação foi bem-sucedida
if !errorlevel! neq 0 (
    echo %LOG_PREFIX% ERRO: Falha ao executar PM2
    exit /b 7
)

:: Aguarda estabilização (3 segundos)
timeout /t 3 /nobreak >nul 2>&1

:: Verificação final
pm2 jlist 2>nul | findstr /i "DeliveryFacil-ChatBot" >nul 2>&1
if !errorlevel! neq 0 (
    echo %LOG_PREFIX% ERRO: Processo nao esta rodando apos inicializacao
    exit /b 8
)

:: Sucesso
echo %LOG_PREFIX% %ACTION% com sucesso
exit /b 0 