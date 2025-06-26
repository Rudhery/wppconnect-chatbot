/**
 * @fileoverview Tipos e interfaces para o WhatsApp Bot (WppConnect + TypeScript)
 * @author Sistema migrado do whatsapp-web.js para WppConnect
 */

// ===========================
// CONFIGURAÇÃO PRINCIPAL
// ===========================

/**
 * Configuração principal do bot WhatsApp
 */
export interface BotConfig {
  // Sessão e conexão
  sessionName: string;
  hideNavegador: boolean;
  useChrome: boolean;
  pathChrome: string | undefined;

  // API e integração
  urlSync: string;
  numeroNext: string;

  // Comportamento do bot
  msg_automatico: boolean;
  logInFile: boolean;
  delayPadrao: number;

  // Estabelecimento
  site: string;
  estabelecimento: string;
  mensagemBoasVindas: string;
  mensagemCardapio: string;
  caminhoImagens: string;

  autoResponses?: AutoResponse[];
}

// ===========================
// MENSAGENS E RESPOSTAS
// ===========================

/**
 * Configuração de resposta automática
 */
export interface AutoResponse {
  /** Palavras que ativam a resposta */
  triggers: string[];
  /** Lista de respostas possíveis */
  responses: string[];
  /** Delay entre mensagens (ms) */
  delay?: number;
}

/**
 * Configuração para números específicos
 */
export interface SpecificNumberConfig {
  /** Número WhatsApp (ex: "5511999999999@c.us") */
  number: string;
  /** Nome para identificação */
  name?: string;
  /** Lista de respostas */
  responses: string[];
  /** Delay entre respostas (ms) */
  delay?: number;
  /** Responder apenas uma vez */
  onlyOnce?: boolean;
}

/**
 * Comando disponível no bot
 */
export interface Command {
  /** Comando (ex: "/status") */
  command: string;
  /** Descrição do comando */
  description: string;
  /** Respostas do comando */
  responses: string[];
  /** Apenas administradores */
  adminOnly?: boolean;
}

// ===========================
// SESSÕES E USUÁRIOS
// ===========================

/**
 * Sessão de usuário ativa
 */
export interface UserSession {
  /** Número do usuário */
  number: string;
  /** Última interação */
  lastInteraction: Date;
  /** Contador de mensagens */
  messageCount: number;
  /** Recebeu mensagem de boas-vindas */
  hasReceivedWelcome: boolean;
  /** Timestamp do último contato (sistema cooldown) */
  lastContactTime?: number;
}

/**
 * Informações de contato
 */
export interface ContactInfo {
  /** Nome do contato */
  name: string;
  /** Número WhatsApp */
  number: string;
  /** URL da foto de perfil */
  profilePicUrl?: string;
}

// ===========================
// API E REQUESTS
// ===========================

/**
 * Resposta padrão da API
 */
export interface ApiResponse {
  /** Status da operação */
  status: 'success' | 'error';
  /** Mensagem descritiva */
  message?: string;
  /** Dados retornados */
  data?: any;
  /** Mensagem de erro */
  error?: string;
}

/**
 * Request para envio de mensagem
 */
export interface MessageRequest {
  /** Número de destino */
  fone: string;
  /** Texto da mensagem */
  mensagem: string;
}

/**
 * Request para envio de promoção
 */
export interface PromotionRequest {
  /** Usar embed nas imagens */
  embed: boolean;
  /** Lista de números destino */
  phone: string[];
  /** Texto da promoção */
  message: string;
  /** Lista de caminhos das imagens */
  image: string[];
}

/**
 * Resposta da sincronização de pedidos
 */
export interface SyncPedidoResponse {
  /** Status HTTP */
  status: number;
  /** Dados do pedido */
  data: any;
}

// ===========================
// ESTATÍSTICAS E LOGS
// ===========================

/**
 * Estatísticas do bot
 */
export interface BotStats {
  /** Bot está online */
  isOnline: boolean;
  /** Tempo de atividade */
  uptime: number;
  /** Mensagens processadas */
  messagesProcessed: number;
  /** Último restart */
  lastRestart: Date;
  /** Status da conexão */
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
}
