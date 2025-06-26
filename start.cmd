@echo off
cd "C:\NEXTSISTEM\DeliveryFacil\delivery-facil-chat-bot\"

:: Verifica se precisa compilar (se nao existe dist/index.js)
if not exist "dist\index.js" (
    echo Compilando codigo TypeScript...
    call npm run build
    if %errorlevel% neq 0 (
        echo ERRO: Falha na compilacao!
        pause
        exit /b 1
    )
    echo Codigo compilado com sucesso!
)

:: Verifica se o processo já está em execução usando pm2 jlist e findstr
pm2 jlist | findstr /i "DeliveryFacil-ChatBot" > nul

:: Se o processo não existir (findstr retorna errolevel 1 se não encontrar)
if %errorlevel% == 1 (
    echo Processo nao encontrado. Iniciando novo processo...
    pm2 start dist/index.js --name "DeliveryFacil-ChatBot"
) else (
    echo Processo encontrado. Reiniciando processo...
    pm2 restart DeliveryFacil-ChatBot
)

pause
