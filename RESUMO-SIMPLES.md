# 🚀 WhatsApp Bot - DeliveryFácil

## ⚡ Como Usar (SIMPLES!)

### **1. Instalar dependências:**

```bash
npm install
```

### **2. Iniciar o bot:**

```bash
🖱️ INICIAR-BOT.bat
```

- Escolha [1] para NPM normal
- Escolha [2] para PM2 (melhor para produção)

### **3. Parar o bot:**

```bash
🖱️ PARAR-BOT.bat
```

### **4. Instalar como serviço (opcional):**

```bash
🖱️ INSTALAR-SERVICO.bat (como Admin)
```

---

## 📋 Scripts Disponíveis

| Script          | Função              |
| --------------- | ------------------- |
| `npm run build` | Compilar TypeScript |
| `npm start`     | Iniciar bot normal  |
| `npm run dev`   | Desenvolvimento     |
| `npm run pm2`   | Iniciar com PM2     |

---

## 🔧 PM2 Comandos

```bash
pm2 start dist/index.js --name "DeliveryFacil-ChatBot"
pm2 status
pm2 logs DeliveryFacil-ChatBot
pm2 restart DeliveryFacil-ChatBot
pm2 stop DeliveryFacil-ChatBot
```

---

## ⚙️ Configuração

Edite `src/config.ts`:

- `msg_automatico: true` - Ativar auto-resposta
- `urlSync` - Seu endpoint
- `numeroNext` - Seu número

---

**🔥 Pronto! Só isso que precisa! 🔥**
