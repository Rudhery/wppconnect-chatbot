# 🔧 Troubleshooting - Scripts CMD

## 🎯 **Scripts Disponíveis**

| Script              | Uso          | Descrição                                 |
| ------------------- | ------------ | ----------------------------------------- |
| `start.cmd`         | Manual       | Versão robusta com verificações completas |
| `start-auto.cmd`    | **Software** | Otimizado para execução automatizada      |
| `start-simples.cmd` | Manual       | Versão minimalista                        |

---

## 🚀 **Melhorias Implementadas**

### **✅ Problemas Resolvidos:**

#### **1. Codificação de Caracteres**

```cmd
chcp 65001 >nul 2>&1  # Força UTF-8
```

- **Problema:** Caracteres especiais quebram
- **Solução:** Força codificação UTF-8

#### **2. Variáveis de Ambiente**

```cmd
setlocal enabledelayedexpansion
set "WORK_DIR=C:\NEXTSISTEM\..."
```

- **Problema:** Paths com espaços falham
- **Solução:** Aspas e variáveis locais

#### **3. Verificação de Dependências**

```cmd
node --version >nul 2>&1 || exit /b 3
npm --version >nul 2>&1 || exit /b 4
pm2 --version >nul 2>&1 || exit /b 5
```

- **Problema:** Falha silenciosa se Node/PM2 não existir
- **Solução:** Verificação prévia com exit codes

#### **4. Tratamento de Erros Robusto**

```cmd
if !errorlevel! neq 0 (
    echo ERRO: Falha específica
    exit /b 6
)
```

- **Problema:** Erros não capturados
- **Solução:** Exit codes específicos para cada erro

#### **5. Redirecionamento de Output**

```cmd
pm2 start dist/index.js >nul 2>&1
```

- **Problema:** Outputs interferem com software pai
- **Solução:** Suprime outputs desnecessários

---

## 📊 **Exit Codes (start-auto.cmd)**

| Code | Significado               | Ação                        |
| ---- | ------------------------- | --------------------------- |
| `0`  | ✅ Sucesso                | Bot iniciado/reiniciado     |
| `2`  | ❌ Pasta não encontrada   | Verificar caminho           |
| `3`  | ❌ Node.js não encontrado | Instalar Node.js            |
| `4`  | ❌ NPM não encontrado     | Verificar instalação Node   |
| `5`  | ❌ PM2 não encontrado     | `npm install -g pm2`        |
| `6`  | ❌ Falha na compilação    | Verificar código TypeScript |
| `7`  | ❌ Falha no PM2           | Verificar processo PM2      |
| `8`  | ❌ Processo não iniciou   | Verificar logs do bot       |

---

## 🔍 **Diagnóstico de Problemas**

### **Problema: "Pasta não encontrada"**

```cmd
# Verificar se o caminho existe:
dir "C:\NEXTSISTEM\DeliveryFacil\delivery-facil-chat-bot"
```

**Solução:** Ajustar caminho no script

### **Problema: "Node.js não encontrado"**

```cmd
# Verificar instalação:
node --version
npm --version
```

**Solução:** Instalar Node.js ou ajustar PATH

### **Problema: "PM2 não encontrado"**

```cmd
# Instalar PM2:
npm install -g pm2
```

**Solução:** Instalar PM2 globalmente

### **Problema: "Falha na compilação"**

```cmd
# Testar manualmente:
npm run build
```

**Solução:** Verificar erros TypeScript

### **Problema: "Processo não iniciou"**

```cmd
# Verificar logs:
pm2 logs DeliveryFacil-ChatBot
```

**Solução:** Ver logs para erro específico

---

## 🛠️ **Monitoramento para Software**

### **Como o Software deve interpretar:**

```javascript
// Exemplo em qualquer linguagem:
const result = executeCommand('start-auto.cmd');

switch (result.exitCode) {
  case 0:
    console.log('✅ Bot iniciado com sucesso');
    break;
  case 2:
    console.log('❌ Pasta do bot não encontrada');
    break;
  case 3:
    console.log('❌ Node.js não instalado');
    break;
  case 5:
    console.log('❌ PM2 não instalado');
    break;
  // ... outros codes
}
```

### **Logs Estruturados:**

```
[DeliveryFacil-Bot] Compilando TypeScript...
[DeliveryFacil-Bot] INICIADO com sucesso
[DeliveryFacil-Bot] REINICIADO com sucesso
[DeliveryFacil-Bot] ERRO: Node.js não encontrado
```

---

## ⚡ **Recomendações por Cenário**

### **🖥️ Execução Manual:**

```cmd
start.cmd  # Versão completa com feedback visual
```

### **🤖 Execução por Software:**

```cmd
start-auto.cmd  # Otimizado para automação
```

### **🔧 Debug/Teste:**

```cmd
start-simples.cmd  # Versão mínima para teste
```

---

## 📋 **Checklist de Validação**

### **Antes de Deploy:**

- [ ] Caminho correto no script
- [ ] Node.js instalado
- [ ] PM2 instalado (`npm install -g pm2`)
- [ ] Pasta do bot existe
- [ ] package.json presente
- [ ] Permissões de escrita na pasta

### **Teste do Script:**

```cmd
# Teste manual:
start-auto.cmd
echo Exit Code: %errorlevel%

# Deve retornar:
# [DeliveryFacil-Bot] INICIADO com sucesso
# Exit Code: 0
```

---

## 🚨 **Cenários Críticos**

### **1. Software Pai Trava**

**Causa:** Script fica esperando input (pause)
**Solução:** Use `start-auto.cmd` (sem pause)

### **2. Caracteres Quebrados**

**Causa:** Codificação incorreta
**Solução:** `chcp 65001` implementado

### **3. Exit Code Incorreto**

**Causa:** Uso de `%errorlevel%` vs `!errorlevel!`
**Solução:** `enabledelayedexpansion` implementado

### **4. Path com Espaços**

**Causa:** Caminhos não estão entre aspas
**Solução:** `"caminhos entre aspas"` implementado

---

**🔥 Agora seus scripts são 100% confiáveis para execução automatizada! 🔥**
