# 🚀 Guia Completo de Deploy no Render (Render.com)

Este guia explica como colocar a sua aplicação **MVP Agenda** no ar gratuitamente no **Render.com** com PostgreSQL e hospedagem Node.js.

---

## 🛠️ Passo a Passo para Deploy no Render

### Passo 1: Subir o Projeto para o GitHub
1. Crie um repositório no seu GitHub (ex: `mvp-agenda`).
2. No terminal da pasta do seu projeto, execute os comandos:
   ```bash
   git init
   git add .
   git commit -m "Projeto MVP Agenda pronto para deploy no Render"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/mvp-agenda.git
   git push -u origin main
   ```

---

### Passo 2: Criar a Conta e Conectar no Render
1. Acesse **[Render.com](https://render.com/)** e faça login (pode usar o login direto com sua conta do GitHub).
2. Clique no botão **"New +"** no topo superior direito e selecione **"Blueprint"** (ou **"Web Service"**).

---

### Opção A: Deploy Automático via Blueprint (`render.yaml`) — ⭐ Recomendado
1. Selecione a opção **"Blueprint"**.
2. Conecte o repositório do seu GitHub `mvp-agenda`.
3. O Render lerá automaticamente o arquivo [render.yaml](file:///c:/Users/User/Documents/MVP/render.yaml) já preparado no seu projeto.
4. Clique em **"Apply"**.
5. O Render criará o banco de dados PostgreSQL e o Web Service automaticamente!

---

### Opção B: Deploy Manual no Render (Passo a Passo)

#### 1. Criar o Banco de Dados PostgreSQL no Render
- No painel do Render, clique em **New +** -> **PostgreSQL**.
- Nome: `mvp-agenda-db`
- Plan: **Free**
- Clique em **Create Database**.
- Copie a **Internal Database URL** (ou External Database URL).

#### 2. Criar o Web Service no Render
- Clique em **New +** -> **Web Service**.
- Conecte o seu repositório do GitHub.
- **Name**: `mvp-agenda`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx prisma db push && npm run start`
- Na seção **Environment Variables**, adicione:
  - `DATABASE_URL`: *(Cole a URL do PostgreSQL copiada no passo anterior)*
  - `JWT_SECRET`: `uma_chave_secreta_e_longa_aqui`
  - `ADMIN_SECRET`: `admin_mvp_secret_2025`
  - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (opcionais para envio real de e-mails)

---

## 🎯 Testando seu App no Ar

Após a conclusão do build (cerca de 2 a 3 minutos), o Render fornecerá a sua URL pública:
- 🌐 **Landing Page**: `https://seu-app.onrender.com/`
- 🔐 **Painel Login**: `https://seu-app.onrender.com/login.html`
- 📅 **Página de Agendamento Pública**: `https://seu-app.onrender.com/agendar/slug-da-barbearia`
