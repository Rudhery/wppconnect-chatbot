import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private logDir: string;
  private logStream: fs.WriteStream | null = null;

  constructor(logDir: string = path.join(__dirname, 'logs')) {
    this.logDir = logDir;
    this.ensureLogDir();
  }

  // Criar pasta de logs se não existir
  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Formatar data no formato original (migrado do api-log.js)
  private formatDate(date: Date): string {
    const offset = -0 * 60 * 60 * 1000; // UTC-3 em milissegundos (ajuste conforme necessário)
    const localDate = new Date(date.getTime() + offset);

    const dia = String(localDate.getDate()).padStart(2, '0');
    const mes = String(localDate.getMonth() + 1).padStart(2, '0');
    const ano = localDate.getFullYear();
    const horas = String(localDate.getHours()).padStart(2, '0');
    const minutos = String(localDate.getMinutes()).padStart(2, '0');
    const segundos = String(localDate.getSeconds()).padStart(2, '0');

    return `${ano}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;
  }

  // Obter nome do arquivo de log (formato diamesano.log como original)
  private getLogFileName(): string {
    const now = new Date();
    const dia = String(now.getDate()).padStart(2, '0');
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const ano = now.getFullYear();

    return `${dia}${mes}${ano}.log`;
  }

  // Obter caminho completo do arquivo de log
  private getLogFilePath(): string {
    return path.join(this.logDir, this.getLogFileName());
  }

  // Escrever log no arquivo
  private writeLog(level: string, message: string): void {
    const newLogFilePath = this.getLogFilePath();

    // Verificar se precisa trocar de arquivo (novo dia)
    if (!this.logStream || this.logStream.path !== newLogFilePath) {
      if (this.logStream) {
        this.logStream.end();
      }
      this.logStream = fs.createWriteStream(newLogFilePath, { flags: 'a' });
    }

    const formattedMessage = `${this.formatDate(new Date())} [${level}] - ${message}`;

    this.logStream.write(formattedMessage + '\n');
    process.stdout.write(formattedMessage + '\n');
  }

  // Métodos públicos de logging
  public log(...args: any[]): void {
    this.writeLog('LOG', args.join(' '));
  }

  public info(...args: any[]): void {
    this.writeLog('INFO', args.join(' '));
  }

  public error(...args: any[]): void {
    this.writeLog('ERROR', args.join(' '));
  }

  public warn(...args: any[]): void {
    this.writeLog('WARN', args.join(' '));
  }

  // Fechar stream
  public close(): void {
    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
  }
}

// Instância global do logger
export const logger = new Logger();

// Sobrescrever console (como no original) se logInFile estiver ativo
export function setupGlobalLogging(enabled: boolean): void {
  if (enabled) {
    console.log = (...args) => logger.log(...args);
    console.info = (...args) => logger.info(...args);
    console.error = (...args) => logger.error(...args);
    console.warn = (...args) => logger.warn(...args);
  }
}
