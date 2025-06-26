import { BotConfig } from './types';
import * as path from 'path';
import * as os from 'os';

// Estender o tipo Process para incluir pkg (usado pelo PKG)
declare global {
  namespace NodeJS {
    interface Process {
      pkg?: {
        entrypoint: string;
        defaultEntrypoint: string;
      };
    }
  }
}

// Detectar se o computador é "fraco" baseado na RAM
function isLowEndMachine(): boolean {
  const totalMemory = os.totalmem() / (1024 * 1024 * 1024); // GB
  return totalMemory < 4; // Menos de 4GB = computador fraco
}

// Função para detectar o Chrome automaticamente (compatível com PKG)
function getChromePath(): string | undefined {
  const platform = os.platform();

  const chromePaths = {
    win32: [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      'C:/Users/' + os.userInfo().username + '/AppData/Local/Google/Chrome/Application/chrome.exe',
      // Edge como fallback
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
    ],
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ],
  };

  const paths = chromePaths[platform as keyof typeof chromePaths] || [];

  // Tenta encontrar o primeiro que existe
  const fs = require('fs');
  for (const chromePath of paths) {
    try {
      if (fs.existsSync(chromePath)) {
        console.log('🌐 Chrome encontrado em:', chromePath);
        return chromePath;
      }
    } catch (error) {
      // Continua tentando
    }
  }

  console.log('⚠️ Chrome não encontrado nos caminhos padrão, usando automático');
  return undefined; // Deixa o Puppeteer encontrar automaticamente
}

// Função para obter saudação baseada no horário (migrada do const.js original)
export function whatsTimeNow(): string {
  const agora = new Date();
  const horas = agora.getHours();

  if (horas >= 6 && horas < 12) {
    return 'Bom dia! 🌅';
  } else if (horas >= 12 && horas < 18) {
    return 'Boa tarde! ☀️';
  } else if (horas >= 18 && horas < 24) {
    return 'Boa noite! 🌜';
  } else {
    return 'Olá 👋';
  }
}

// Função para obter o diretório de trabalho (compatível com PKG)
function getWorkingDirectory(): string {
  // Se executando com PKG, usa o diretório do executável
  if (process.pkg) {
    return path.dirname(process.execPath);
  }
  // Senão usa o diretório atual do projeto
  return process.cwd();
}

// 🚀 CONFIGURAÇÕES OTIMIZADAS PARA PERFORMANCE
const isLowEnd = isLowEndMachine();
console.log(
  `💻 Computador detectado: ${isLowEnd ? 'BÁSICO' : 'NORMAL'} (${(
    os.totalmem() /
    (1024 * 1024 * 1024)
  ).toFixed(1)}GB RAM)`,
);

export const botConfig: BotConfig = {
  sessionName: 'meu-bot-session',

  // Configurações originais migradas + PKG compatível
  urlSync: 'http://10.0.0.4:5070',
  numeroNext: '554435286207@c.us',
  msg_automatico: true, // ⚠️ COLOQUE true para ativar auto-resposta
  logInFile: true,
  hideNavegador: isLowEnd, // 🚀 Esconder navegador em PCs fracos
  useChrome: true,
  pathChrome: getChromePath(), // 🚀 Detecção automática compatível com PKG

  // Configurações do estabelecimento
  site: 'https://boa-pizza.deliveryfacil.net.br/',
  estabelecimento: 'Boa Pizza Pizzaria LTDA!',
  mensagemBoasVindas: 'Seja bem-vindo à',
  mensagemCardapio: 'Faça seu pedido pelo nosso site exclusivo: ',
  delayPadrao: isLowEnd ? 15000 : 10000, // 🚀 Delay maior em PCs fracos

  // 🚀 Caminho dinâmico compatível com PKG
  caminhoImagens: path.join(getWorkingDirectory(), 'images'),

  // 🚀 CONFIGURAÇÕES DE PERFORMANCE (novas)
  performance: {
    isLowEndMachine: isLowEnd,
    healthCheckInterval: isLowEnd ? 30000 : 10000, // 30s vs 10s
    contactCleanupInterval: isLowEnd ? 21600000 : 14400000, // 6h vs 4h
    webUIUpdateInterval: isLowEnd ? 60000 : 30000, // 1min vs 30s
    maxMessageQueueSize: isLowEnd ? 10 : 50,
    enablePerformanceMode: isLowEnd,
  },

  // Números específicos que recebem respostas automáticas (do arquivo original)

  // Comandos especiais
};
