import * as wppconnect from '@wppconnect-team/wppconnect';
import { BotConfig, UserSession, ContactInfo, SyncPedidoResponse } from './types';
import { botConfig, whatsTimeNow } from './config';
import { logger } from './logger';
import * as http from 'http';
import * as dns from 'dns';

export class ChatBot {
  private client!: wppconnect.Whatsapp;
  private config: BotConfig;
  private userSessions: Map<string, UserSession> = new Map();
  private contatos: { [key: string]: number } = {}; // Sistema original de cooldown
  private readonly EXPIRATION_TIME = 60 * 60 * 1000; // 1 hora como no original

  // Estados do cliente (migrado do original)
  private clientReady = false;
  private isInitialized = false;
  private isRestarting = false;

  constructor(config: BotConfig) {
    this.config = config;
  }

  // Inicializar o bot (migrado e melhorado do original)
  async initialize(): Promise<void> {
    console.log('🤖 Iniciando WppConnect ChatBot (migrado do whatsapp-web.js)...');
    console.log('🌐 Abrindo interface web...');

    try {
      this.client = await wppconnect.create({
        session: this.config.sessionName,
        catchQR: this.handleQR.bind(this),
        statusFind: this.handleStatus.bind(this),
        headless: this.config.hideNavegador,
        devtools: false,
        useChrome: this.config.useChrome,
        debug: false,
        logQR: true,
        updatesLog: true,
        autoClose: 60000,
        createPathFileToken: false,
        // Configurações do navegador (migradas do original)
        puppeteerOptions: {
          executablePath: this.config.useChrome ? this.config.pathChrome : undefined,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-accelerated-2d-canvas',
            '--no-zygote',
            '--disable-dev-shm-usage',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--remote-debugging-port=9222',
          ],
        },
      });

      console.log('✅ Cliente WppConnect criado com sucesso!');
      this.setupEventListeners();
      this.startPeriodicTasks();
    } catch (error) {
      console.error('❌ Erro ao criar cliente:', error);
      throw error;
    }
  }

  // Configurar eventos (migrado do original)
  private setupEventListeners(): void {
    console.log('🚀 Bot iniciado e pronto para receber mensagens!');
    this.clientReady = true;
    this.isInitialized = true;

    // Escutar mensagens (migrado do message_create original)
    this.client.onMessage(this.handleMessage.bind(this));

    // Escutar mudanças de estado
    this.client.onStateChange((state) => {
      console.log('🔄 Estado alterado:', state);

      if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
        console.log('❌ Desconectado. Tentando reconectar...');
        this.restartClient();
      }
    });

    // Eventos de autenticação
    this.client.onAck((ack) => {
      console.log('📨 ACK recebido:', ack);
    });

    console.log('👂 Bot está escutando mensagens...');
  }

  // Lidar com QR Code
  private handleQR(base64Qr: string, asciiQR: string, attempts: number, urlCode?: string): void {
    console.log('📱 QR Code gerado!');
    console.log(`🔄 Tentativa: ${attempts}`);
    if (urlCode) console.log('QR Code URL:', urlCode);
  }

  // Lidar com status
  private handleStatus(statusSession: string, session: string): void {
    console.log('📊 Status da sessão:', statusSession, '| Sessão:', session);

    switch (statusSession) {
      case 'autocloseCalled':
        console.log('❌ Sessão foi fechada automaticamente');
        break;
      case 'qrReadSuccess':
        console.log('✅ QR Code lido com sucesso!');
        break;
      case 'connected':
        console.log('🎉 Conectado ao WhatsApp!');
        break;
    }
  }

  // Processar mensagens recebidas (OTIMIZADO para performance)
  private async handleMessage(message: any): Promise<void> {
    const startTime = Date.now();

    try {
      // Debug simplificado para computadores fracos
      if (!this.config.performance?.enablePerformanceMode) {
        console.log('📋 Estrutura da mensagem WppConnect:', {
          from: message.from,
          body: message.body,
          fromMe: message.fromMe,
          timestamp: message.timestamp,
          sender: message.sender,
          notifyName: message.notifyName,
          type: message.type,
        });
      } else {
        console.log(`📱 Mensagem de: ${message.from?.replace('@c.us', '')}`);
      }

      // 1. Primeiro verificar se é mensagem de sincronização (do numeroNext)
      await this.handleMessageSync(message);

      // 2. Depois processar mensagem normal (corrigido para WppConnect)
      const nomeContato = message.sender?.pushname || message.notifyName || 'Sem nome';
      const numeroContato = message.from;

      console.log(
        `Nova mensagem recebida de: ${numeroContato.replace('@c.us', '')} - Nome: ${
          nomeContato || 'Sem nome'
        }`,
      );

      // Verificar se é grupo (migrado do original)
      const hasAtGus = numeroContato.endsWith('@g.us');
      if (message.fromMe) {
        console.log('Mensagem ignorada: enviada pelo bot');
        return;
      }
      if (hasAtGus) {
        console.log('Mensagem ignorada: é de um grupo');
        return;
      }

      // Verificar timestamp (corrigido para WppConnect)
      const timestamp = message.timestamp || Math.floor(Date.now() / 1000);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeDifference = currentTime - timestamp;

      console.log(
        'timeDifference->',
        timeDifference,
        'currentTime->',
        currentTime,
        'timestamp->',
        timestamp,
      );

      // Verificar se mensagem foi criada nos últimos 60 segundos
      if (timeDifference > 60) return;

      // AUTO-RESPOSTA ATIVADA ✅
      if (!this.config.msg_automatico) {
        console.log(`🔇 Auto-resposta desabilitada (msg_auto = ${this.config.msg_automatico})`);
        console.log(`📝 Mensagem de ${nomeContato}: ${message.body}`);
        return;
      }

      // Sistema de cooldown original (MIGRADO EXATO)
      if (this.contatos[numeroContato]) {
        const lastContactTime = this.contatos[numeroContato];
        const elapsedTime = currentTime - lastContactTime;

        if (elapsedTime < this.EXPIRATION_TIME) {
          console.log(`Número ${numeroContato} já está na lista de contatos.`);
          return;
        }
      }

      const mensagem = message.body
        ?.toLowerCase()
        ?.normalize('NFD')
        ?.replace(/[\u0300-\u036f]/g, '');

      console.log(`Nome do contato: ${nomeContato}`);
      console.log(`Mensagem recebida: ${mensagem}`);
      console.log(`Número do contato: ${numeroContato}`);

      // Adicionar contato com timestamp (sistema original)
      this.contatos[numeroContato] = currentTime;
      console.log(`Número ${numeroContato} adicionado à lista de contatos.`);

      // Enviar sequência de mensagens original (MIGRADO EXATO)
      await this.sleep(1500);
      await this.client.sendText(numeroContato, whatsTimeNow());

      await this.sleep(1500);
      await this.client.sendText(
        numeroContato,
        `${this.config.mensagemBoasVindas} ${this.config.estabelecimento}`,
      );

      await this.sleep(1500);
      await this.client.sendText(
        numeroContato,
        `${this.config.mensagemCardapio} ${this.config.site}`,
      );

      console.log(`✅ Sequência de boas-vindas enviada para ${numeroContato}`);

      // Log de performance
      const processTime = Date.now() - startTime;
      if (this.config.performance?.enablePerformanceMode) {
        console.log(`⚡ Processamento: ${processTime}ms`);
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);

      // Log de performance mesmo em erro
      const processTime = Date.now() - startTime;
      if (processTime > 5000) {
        console.warn(`⚠️ Processamento lento: ${processTime}ms`);
      }
    }
  }

  // Sistema de sincronização (MIGRADO COMPLETO do original)
  private async handleMessageSync(message: any): Promise<void> {
    if (!this.config.numeroNext || !this.config.urlSync) {
      return;
    }

    const senderNumber = message.from;
    console.log('Número de quem enviou:', senderNumber);

    const normalizedSender = senderNumber.replace('@c.us', '');
    const normalizedNext = this.config.numeroNext.replace('@c.us', '');

    if (normalizedSender !== normalizedNext) {
      return; // Não é do número autorizado
    }

    console.log('Mensagem recebida de número autorizado:', senderNumber);
    console.log('Mensagem:', message.body);

    const pedidos = message.body.split('|');
    if (pedidos.length === 0) {
      console.log('Nenhum pedido recebido.');
      return;
    }

    console.log('Pedidos recebidos:', pedidos);

    for (let i = 0; i < pedidos.length; i++) {
      const pedido = pedidos[i].trim();
      if (!pedido) {
        console.log(`Pedido ${i + 1} vazio, ignorando.`);
        continue;
      }
      try {
        console.log(`Sincronizando pedido ${pedido}...`);
        await this.syncPedidosChat(pedido);
      } catch (err) {
        console.error(`Erro ao sincronizar pedido ${pedido}:`, err);
      }
    }
  }

  // Sincronizar pedidos (MIGRADO EXATO do original)
  private async syncPedidosChat(idPedido: string): Promise<any> {
    try {
      await this.sleep(1500);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      return new Promise((resolve, reject) => {
        const req = http.request(
          `${this.config.urlSync}/api/sincronizador/pedido/hook/${idPedido}`,
          options,
          (res) => {
            let data = '';

            res.on('data', (chunk) => {
              data += chunk;
            });

            res.on('end', () => {
              try {
                const response = JSON.parse(data);
                if (response.status === 200) {
                  const pedidos = response.data;
                  console.log('Pedidos realizados post ->', pedidos);
                  resolve(pedidos);
                } else {
                  console.error('Resposta com status diferente de 200:', response);
                  reject(new Error(`Erro na API: Status ${response.status}`));
                }
              } catch (error) {
                console.error('Erro ao analisar a resposta:', error);
                reject(error);
              }
            });
          },
        );

        req.on('error', (error) => {
          console.error('Erro na requisição HTTP:', error);
          reject(error);
        });

        req.end();
      });
    } catch (error) {
      console.error('Erro ao realizar a solicitação:', error);
      throw error;
    }
  }

  // Verificar se número é válido (migrado do original)
  public async checkNumber(numero: string): Promise<boolean> {
    try {
      const result = await this.client.checkNumberStatus(numero);
      if (!result || !result.numberExists) {
        console.error(`Número não registrado no WhatsApp: ${numero}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erro ao verificar número:', error);
      return false;
    }
  }

  // Obter lista de contatos (migrado do original)
  public async getContactList(limit: number = 10): Promise<ContactInfo[]> {
    try {
      const contacts = await this.client.getAllContacts();
      const contactDetails: ContactInfo[] = [];

      for (let i = 0; i < Math.min(contacts.length, limit); i++) {
        const contact = contacts[i] as any; // Casting para evitar erros de tipo
        contactDetails.push({
          name: contact.name || contact.pushname || 'Sem nome',
          number: contact.id,
          profilePicUrl: 'Sem foto de perfil', // Simplificado - WppConnect API diferente
        });
      }

      console.log('Contatos obtidos com sucesso:', contactDetails);
      return contactDetails;
    } catch (err) {
      console.error('Erro ao obter os contatos:', err);
      throw err;
    }
  }

  // Enviar mensagem simples (migrado do original)
  public async sendMessage(
    fone: string,
    message: string,
  ): Promise<{ status: string; message: string }> {
    try {
      console.log(`Enviando mensagem para ${fone}...`);
      await this.client.sendText(fone, message);
      console.log('Mensagem enviada com sucesso!');
      return { status: 'success', message: `Mensagem enviada para ${fone}` };
    } catch (error: any) {
      console.error(`Erro ao enviar mensagem para ${fone}:`, error.message);
      throw new Error(`Falha ao enviar mensagem para ${fone}: ${error.message}`);
    }
  }

  // Enviar promoção com imagens (migrado e melhorado do original)
  public async sendPromotion(
    fone: string,
    imagePaths: string[],
    caption: string,
    embed: boolean,
  ): Promise<{ status: string; message: string }> {
    try {
      if (embed) {
        let isFirstImage = true;
        for (const imagePath of imagePaths) {
          console.log(`Enviando imagem com legenda para ${fone}...`);

          try {
            // No WppConnect a API é diferente, vamos usar sendFile
            if (isFirstImage) {
              await this.client.sendFile(fone, imagePath, 'image.jpg', caption);
              isFirstImage = false;
            } else {
              await this.client.sendFile(fone, imagePath, 'image.jpg', '');
            }
            console.log('Imagem com legenda enviada com sucesso!');
          } catch (sendError: any) {
            console.log('Erro ao enviar a mensagem:', sendError.message);
          }
        }
      } else {
        for (const imagePath of imagePaths) {
          console.log(`Enviando imagem para ${fone}...`);

          try {
            await this.client.sendFile(fone, imagePath, 'image.jpg', '');
            console.log('Imagem enviada com sucesso!');
          } catch (sendError: any) {
            console.log('Erro ao enviar a mensagem:', sendError.message);
          }
        }

        console.log(`Enviando mensagem para ${fone}...`);
        try {
          await this.client.sendText(fone, caption);
          console.log('Mensagem enviada com sucesso!');
        } catch (sendError: any) {
          console.log('Erro ao enviar a mensagem:', sendError.message);
        }
      }

      return {
        status: 'success',
        message: `Imagens e mensagem enviadas para ${fone}`,
      };
    } catch (error: any) {
      console.error(`Erro ao enviar promoção para ${fone}:`, error.message);
      throw new Error(`Falha ao enviar promoção para ${fone}: ${error.message}`);
    }
  }

  // Enviar promoção com delay (migrado do original)
  public async sendPromotionWithDelay(
    fones: string[],
    imagePaths: string[],
    caption: string,
    embed: boolean,
  ): Promise<void> {
    for (const fone of fones) {
      await this.sendPromotion(fone, imagePaths, caption, embed);
      await this.sleep(this.config.delayPadrao);
    }
  }

  // Verificar saúde do cliente (migrado do original)
  public async checkClientHealth(): Promise<string> {
    try {
      if (!this.isInitialized || !this.clientReady) {
        return 'NOT_READY';
      }

      const clientStatus = await this.client.getConnectionState();
      console.log('Client status:', clientStatus);

      if (clientStatus === 'CONNECTED') {
        console.log('Client is connected.');
        return 'CONNECTED';
      } else {
        console.log('Client is not connected. Restarting client...');
        await this.restartClient();
        return 'RESTARTING';
      }
    } catch (error: any) {
      console.error('Error checking client state:', error.message);
      await this.restartClient();
      return 'ERROR';
    }
  }

  // Reiniciar cliente (migrado do original)
  public async restartClient(): Promise<void> {
    if (this.isRestarting) {
      console.log('Reinicialização já em progresso');
      return;
    }

    this.isRestarting = true;
    this.clientReady = false;
    this.isInitialized = false;

    try {
      const hasInternet = await this.checkInternetConnection();
      if (!hasInternet) {
        console.log('Aguardando a reconexão com a internet...');
        const intervalId = setInterval(async () => {
          const isConnected = await this.checkInternetConnection();
          if (isConnected) {
            this.isRestarting = false;
            clearInterval(intervalId);
            await this.client.close();
            await this.initialize();
            console.log('Cliente reinicializado com sucesso após retorno da internet');
          }
        }, 5000);
      } else {
        this.isRestarting = false;
        await this.client.close();
        await this.initialize();
        console.log('Cliente reinicializado com sucesso');
      }
    } catch (error) {
      this.isRestarting = false;
      console.error('Erro ao reiniciar o client:', error);
    }
  }

  // Verificar conexão com internet (migrado do original)
  private checkInternetConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      dns.lookup('google.com', (err) => {
        if (err && err.code === 'ENOTFOUND') {
          console.log('Sem conexão com a internet');
          resolve(false);
        } else {
          console.log('Conexão com a internet detectada');
          resolve(true);
        }
      });
    });
  }

  // Tarefas periódicas (otimizado para performance)
  private startPeriodicTasks(): void {
    const cleanupInterval = this.config.performance?.contactCleanupInterval || 14400000;
    const healthInterval = this.config.performance?.healthCheckInterval || 10000;

    console.log(`🚀 Configurando intervalos otimizados:`);
    console.log(`   - Limpeza de contatos: ${cleanupInterval / 1000 / 60}min`);
    console.log(`   - Verificação de saúde: ${healthInterval / 1000}s`);

    // Limpar contatos (intervalo ajustado para performance)
    setInterval(() => {
      const contatosCount = Object.keys(this.contatos).length;
      if (contatosCount > 0) {
        console.log(`🧹 Limpando ${contatosCount} contatos da memória`);
        this.contatos = {};
        console.log('✅ Array de contatos foi limpo');
      }
    }, cleanupInterval);

    // Verificar saúde do cliente (intervalo otimizado)
    setInterval(async () => {
      if (!this.config.performance?.enablePerformanceMode) {
        console.log('🔍 Verificando a saúde do cliente...');
      }
      await this.checkClientHealth();
    }, healthInterval);
  }

  // Função de delay
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Getters para status (para API)
  public get isClientReady(): boolean {
    return this.clientReady;
  }

  public get isClientInitialized(): boolean {
    return this.isInitialized;
  }

  public get isClientRestarting(): boolean {
    return this.isRestarting;
  }

  // Obter estatísticas
  public getStats(): any {
    return {
      totalUsers: this.userSessions.size,
      totalMessages: Array.from(this.userSessions.values()).reduce(
        (sum, session) => sum + session.messageCount,
        0,
      ),
      activeUsers: Array.from(this.userSessions.values()).filter(
        (session) => Date.now() - session.lastInteraction.getTime() < 24 * 60 * 60 * 1000,
      ).length,
      clientReady: this.clientReady,
      isInitialized: this.isInitialized,
      isRestarting: this.isRestarting,
      contatosCooldown: Object.keys(this.contatos).length,
    };
  }
}
