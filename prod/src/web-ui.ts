import express from 'express';
import path from 'path';

export function setupWebUI(app: express.Application): void {
  // Servir arquivos estáticos (se tiver)
  app.use('/static', express.static(path.join(__dirname, '../public')));

  // Página principal de controle
  app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🍕 Boa Pizza - WhatsApp Bot</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0; 
            padding: 20px; 
            color: white;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 30px;
            backdrop-filter: blur(10px);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .status {
            background: rgba(255,255,255,0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .btn {
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin: 10px;
            font-size: 16px;
            transition: all 0.3s;
        }
        .btn:hover { background: #45a049; }
        .btn.danger { background: #f44336; }
        .btn.danger:hover { background: #da190b; }
        .btn.info { background: #2196F3; }
        .btn.info:hover { background: #0b7dda; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .logs {
            background: #1a1a1a;
            color: #00ff00;
            padding: 20px;
            border-radius: 8px;
            height: 200px;
            overflow-y: scroll;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
        }
        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍕 Boa Pizza WhatsApp Bot</h1>
            <h3>Painel de Controle</h3>
        </div>

        <div class="status" id="status">
            <h3>📊 Status do Bot</h3>
            <p id="statusText">Verificando...</p>
            <p><strong>API:</strong> http://localhost:3000</p>
        </div>

        <div class="grid">
            <div>
                <h3>🎮 Controles</h3>
                <button class="btn" onclick="checkStatus()">🔍 Verificar Status</button>
                <button class="btn danger" onclick="restartBot()">🔄 Reiniciar Bot</button>
                <button class="btn info" onclick="viewLogs()">📋 Ver Logs</button>
            </div>
            <div>
                <h3>📱 Ações Rápidas</h3>
                <button class="btn" onclick="getContacts()">👥 Ver Contatos</button>
                <button class="btn" onclick="sendTest()">📤 Teste de Mensagem</button>
                <button class="btn info" onclick="openAPI()">🌐 Abrir API</button>
            </div>
        </div>

        <div class="logs" id="logs">
            <p>📋 Logs aparecerão aqui...</p>
        </div>
    </div>

    <script>
        async function checkStatus() {
            try {
                const response = await fetch('/health');
                const data = await response.json();
                document.getElementById('statusText').innerHTML = 
                    '✅ Bot Online - Status: ' + data.msg;
            } catch (error) {
                document.getElementById('statusText').innerHTML = 
                    '❌ Bot Offline ou com problemas';
            }
        }

        async function restartBot() {
            if(confirm('Tem certeza que quer reiniciar o bot?')) {
                try {
                    await fetch('/restart', { method: 'POST' });
                    alert('✅ Reinicialização iniciada!');
                    setTimeout(checkStatus, 5000);
                } catch (error) {
                    alert('❌ Erro ao reiniciar');
                }
            }
        }

        async function getContacts() {
            try {
                const response = await fetch('/get-contacts');
                const data = await response.json();
                alert('📱 Contatos: ' + data.contacts?.length || 0);
            } catch (error) {
                alert('❌ Erro ao buscar contatos');
            }
        }

        function sendTest() {
            const phone = prompt('📱 Digite o número (ex: 5511999999999):');
            if(phone) {
                fetch('/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fone: phone,
                        mensagem: '🤖 Teste do bot! Boa Pizza funcionando!'
                    })
                }).then(() => alert('✅ Mensagem enviada!'))
                .catch(() => alert('❌ Erro ao enviar'));
            }
        }

        function viewLogs() {
            document.getElementById('logs').innerHTML = 
                '📋 Logs do sistema...\\n' +
                '🚀 Bot iniciado em ' + new Date().toLocaleString() + '\\n' +
                '📱 Aguardando conexão WhatsApp...\\n' +
                '✅ API rodando na porta 3000\\n';
        }

        function openAPI() {
            window.open('/health', '_blank');
        }

        // Verificar status a cada 30 segundos
        setInterval(checkStatus, 30000);
        checkStatus(); // Verificar ao carregar
    </script>
</body>
</html>
    `);
  });
}
