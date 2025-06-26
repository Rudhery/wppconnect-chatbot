@echo off
cd "C:\NEXTSISTEM\DeliveryFacil\delivery-facil-chat-bot\"

if not exist "dist\index.js" npm run build

pm2 jlist | findstr /i "DeliveryFacil-ChatBot" > nul

if %errorlevel% == 1 (
    pm2 start dist/index.js --name "DeliveryFacil-ChatBot"
) else (
    pm2 restart DeliveryFacil-ChatBot
)

pm2 status
pause 