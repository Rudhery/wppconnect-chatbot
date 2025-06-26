/**
 * @fileoverview Ponto de entrada principal do WhatsApp Bot
 * @description Bot migrado do whatsapp-web.js para WppConnect + TypeScript
 */

import { WhatsAppAPI } from './api';

// ===========================
// CONSTANTES
// ===========================

const DEFAULT_PORT = 3000;
const APP_NAME = 'WhatsApp Bot - WppConnect + TypeScript';

// ===========================
// TRATAMENTO DE ERROS GLOBAIS
// ===========================

/**
 * Configura handlers globais para erros não capturados
 */
function setupGlobalErrorHandlers(): void {
  process.on('uncaughtException', (err) => {
    console.error('❌ Erro não capturado:', err);
    console.error('📊 Stack trace:', err.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada:', reason);
    console.error('📍 Promise:', promise);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 Recebido SIGINT. Encerrando aplicação...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Recebido SIGTERM. Encerrando aplicação...');
    process.exit(0);
  });
}

// ===========================
// FUNÇÕES AUXILIARES
// ===========================

/**
 * Obtém a porta do ambiente ou usa a padrão
 */
function getPort(): number {
  const envPort = process.env.PORT;
  if (envPort) {
    const port = parseInt(envPort, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      console.warn(
        `⚠️ Porta inválida no ambiente: ${envPort}. Usando porta padrão: ${DEFAULT_PORT}`,
      );
      return DEFAULT_PORT;
    }
    return port;
  }
  return DEFAULT_PORT;
}

/**
 * Exibe banner de inicialização
 */
function showStartupBanner(): void {
  console.log('');
  console.log('🚀 ========================================');
  console.log(`🔥 ${APP_NAME}`);
  console.log('🍕 Boa Pizza - Sistema de Automação');
  console.log('🚀 ========================================');
  console.log('');
}

// ===========================
// FUNÇÃO PRINCIPAL
// ===========================

/**
 * Função principal da aplicação
 */
async function main(): Promise<void> {
  try {
    // Configurar tratamento global de erros
    setupGlobalErrorHandlers();

    // Exibir banner
    showStartupBanner();

    // Obter porta
    const port = getPort();
    console.log(`📡 Configurando servidor na porta: ${port}`);

    // Inicializar API
    const api = new WhatsAppAPI();
    await api.start(port);

    console.log('✅ Aplicação iniciada com sucesso!');
    console.log(`🌐 API disponível em: http://localhost:${port}`);
    console.log('📱 Aguarde o QR Code para conectar o WhatsApp...');
  } catch (error) {
    console.error('💥 Erro fatal ao inicializar aplicação:');
    console.error('📋 Detalhes:', error);

    if (error instanceof Error) {
      console.error('📊 Stack trace:', error.stack);
    }

    console.error('🔄 Tente reiniciar a aplicação.');
    process.exit(1);
  }
}

// ===========================
// EXECUÇÃO
// ===========================

// Executar aplicação
main().catch((error) => {
  console.error('💀 Erro crítico na execução:', error);
  process.exit(1);
});
