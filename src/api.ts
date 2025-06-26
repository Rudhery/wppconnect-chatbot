import express from 'express';
import { ChatBot } from './chatbot';
import { botConfig } from './config';
import { logger, setupGlobalLogging } from './logger';
import { ApiResponse, PromotionRequest, MessageRequest } from './types';

export class WhatsAppAPI {
  private app: express.Application;
  private bot: ChatBot;
  private server: any;

  constructor() {
    this.app = express();
    this.bot = new ChatBot(botConfig);
    this.setupMiddleware();
    this.setupRoutes();

    // Configurar logging global se ativado
    setupGlobalLogging(botConfig.logInFile);
  }

  private setupMiddleware(): void {
    this.app.use(express.json());

    // Middleware para logs (otimizado para performance)
    this.app.use((req, res, next) => {
      if (!botConfig.performance?.enablePerformanceMode) {
        console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
      }
      next();
    });
  }

  // Middleware para garantir que o cliente está pronto (migrado do original)
  private ensureClientReady = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (!this.bot.isClientReady) {
      console.log('Client not ready. Initializing...');
      return res.status(503).json({
        code: 503,
        msg: 'WhatsApp client not ready. Please try again later.',
      });
    }
    next();
  };

  private setupRoutes(): void {
    // Endpoint de ping (migrado do original)
    this.app.get('/ping', (req, res) => {
      try {
        return res.status(200).json({ code: 200, msg: 'pong' });
      } catch (error) {
        console.error('Erro no ping:', error);
        res.status(500).json({ code: 500, msg: 'Erro interno' });
      }
    });

    // Endpoint de health check (MIGRADO COMPLETO do original)
    this.app.get('/health', async (req, res) => {
      console.log('Verificando chat-bot via endpoint');
      let sessionClosed = false;
      let clientStatus: string;

      try {
        if (this.bot.isClientReady) {
          try {
            clientStatus = await this.bot.checkClientHealth();
            console.log('Client state:', clientStatus);

            if (clientStatus !== 'CONNECTED') {
              console.log('Client is not connected. Restarting client...');
              await this.bot.restartClient();
            }
          } catch (error: any) {
            console.error('Error getting client state:', error.message);
            sessionClosed = error.message.includes('Session closed');

            if (sessionClosed) {
              return res.status(310).json({ code: 310, msg: 'Session closed' });
            }
            return res.status(311).json({ code: 311, msg: 'Service Unavailable' });
          }
        }

        // Retornar status baseado nas condições (migrado do original)
        if (this.bot.isClientInitialized && !this.bot.isClientRestarting && !sessionClosed) {
          res.status(200).json({ code: 200, msg: clientStatus! });
        } else if (this.bot.isClientRestarting) {
          res.status(409).json({ code: 409, msg: 'Service Restarting' });
        } else if (sessionClosed) {
          res.status(310).json({ code: 310, msg: 'Session Closed' });
        } else {
          res.status(311).json({ code: 311, msg: 'Service Unavailable' });
        }
      } catch (error: any) {
        console.error('Unhandled error in /health endpoint:', error);
        res.status(500).json({ code: 500, msg: 'Internal Server Error' });
      }
    });

    // Endpoint para obter contatos (migrado do original)
    this.app.get('/get-contacts', this.ensureClientReady, async (req, res) => {
      try {
        const contacts = await this.bot.getContactList();
        res.status(200).json({ status: 'success', contacts });
      } catch (error: any) {
        console.error('Erro ao obter os contatos:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
      }
    });

    // Endpoint para enviar mensagem (migrado do original)
    this.app.post('/send-message', this.ensureClientReady, async (req, res) => {
      const { fone, mensagem }: MessageRequest = req.body;

      try {
        const result = await this.bot.sendMessage(fone, mensagem);
        res.status(200).json(result);
      } catch (error: any) {
        console.error('Erro ao enviar mensagem:', error.message);
        res.status(500).json({
          status: 'error',
          message: error.message,
        });
      }
    });

    // Endpoint para enviar promoção (MIGRADO COMPLETO do original)
    this.app.post('/send-promotion', this.ensureClientReady, async (req, res) => {
      console.log('send-promocao');

      const { embed, phone, message, image }: PromotionRequest = req.body;

      console.log('Dados recebidos:', embed, phone, image);

      try {
        const results: any[] = [];

        for (const numero of phone) {
          console.log(`Verificando número: ${numero}`);

          // Verificar se o número está registrado
          const isValidNumber = await this.bot.checkNumber(numero);
          if (!isValidNumber) {
            console.error(`Número não registrado no WhatsApp: ${numero}`);
            results.push({
              numero,
              status: 'failed',
              error: 'Número não registrado no WhatsApp',
            });
            continue;
          }

          console.log(`Enviando promoção para: ${numero}`);

          try {
            // Enviar promoção
            const result = await this.bot.sendPromotion(numero, image, message, embed);
            results.push({ numero, status: 'success', result });
          } catch (sendError: any) {
            console.error(`Falha ao enviar promoção para ${numero}:`, sendError.message);
            results.push({
              numero,
              status: 'failed',
              error: `Falha ao enviar promoção: ${sendError.message}`,
            });
          }
        }

        res.status(200).json(results);
      } catch (error: any) {
        console.error('Erro geral no send-promotion:', error.message);
        res.status(500).json({
          status: 'error',
          message: error.message,
        });
      }
    });

    // Endpoint para restart (migrado do original)
    this.app.post('/restart', async (req, res) => {
      if (this.bot.isClientRestarting) {
        return res.status(409).json({ code: 409, msg: 'Restart already in progress' });
      }

      try {
        await this.bot.restartClient();
        res.status(200).json({ code: 200, msg: 'Client restart initiated' });
      } catch (error: any) {
        console.error('Erro ao reiniciar o client:', error.message);
        res.status(500).json({ code: 500, msg: 'Erro ao reiniciar o client' });
      }
    });

    // Endpoint para estatísticas (novo - não existia no original)
    this.app.get('/stats', this.ensureClientReady, (req, res) => {
      try {
        const stats = this.bot.getStats();
        res.status(200).json({ status: 'success', data: stats });
      } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
      }
    });

    // Middleware de tratamento de erros (migrado do original)
    this.app.use(
      (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error('Unhandled error:', err);
        if (err.message && err.message.includes('Session closed')) {
          res.status(310).json({
            code: 310,
            msg: 'Session Closed. Please restart the service.',
          });
        } else {
          res.status(500).json({
            code: 500,
            msg: 'An internal server error occurred.\n' + err.message,
          });
        }
      },
    );
  }

  // Inicializar bot e servidor
  public async start(port: number = 3000): Promise<void> {
    try {
      // Verificar conexão com internet antes de iniciar
      const hasInternet = await this.checkInternetConnection();

      if (!hasInternet) {
        console.log('Aguardando conexão com a internet para iniciar a aplicação...');
        await this.waitForInternet();
      }

      // Inicializar o bot
      await this.bot.initialize();

      // Iniciar servidor
      await this.startServer(port);

      console.log('🎉 API e cliente iniciados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar aplicação:', error);
      throw error;
    }
  }

  // Iniciar servidor HTTP
  private startServer(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, () => {
        console.log(`🌐 API rodando na porta ${port}`);
        resolve();
      });

      this.server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.error('❌ Porta já está em uso. Escolha uma porta diferente.');
        } else {
          console.error('❌ Erro ao iniciar servidor:', err);
        }
        reject(err);
      });
    });
  }

  // Verificar conexão com internet (migrado do original)
  private checkInternetConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const dns = require('dns');
      dns.lookup('google.com', (err: any) => {
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

  // Aguardar internet (migrado do original)
  private waitForInternet(): Promise<void> {
    return new Promise((resolve) => {
      const intervalId = setInterval(async () => {
        const isConnected = await this.checkInternetConnection();
        if (isConnected) {
          clearInterval(intervalId);
          resolve();
        }
      }, 5000);
    });
  }

  // Fechar aplicação
  public async close(): Promise<void> {
    if (this.server) {
      this.server.close();
    }
    logger.close();
  }
}
