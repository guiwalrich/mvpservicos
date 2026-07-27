<div align="center">

# 📅 MVP Agenda

### Plataforma SaaS de Agendamento Online

Sistema completo de agendamento desenvolvido para **barbearias, salões de beleza, clínicas, consultórios e prestadores de serviços**.

Design moderno, autenticação segura e gerenciamento completo da agenda em tempo real.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)
![Node](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma)
![License](https://img.shields.io/badge/license-Proprietário-red)

</div>

---

# ✨ Sobre o projeto

O **MVP Agenda** é uma plataforma SaaS desenvolvida para automatizar o processo de agendamento de empresas prestadoras de serviços.

O sistema oferece uma experiência completa tanto para o administrador quanto para o cliente, permitindo controlar agendas, profissionais, serviços e clientes em uma única plataforma.

---

# 🚀 Funcionalidades

## Painel Administrativo

- 📅 Agenda diária em tempo real
- 👥 Gestão completa de clientes
- 💼 Cadastro de serviços
- 👨‍🔧 Gestão de profissionais
- 🕒 Horários personalizados por profissional
- 🚫 Bloqueio de datas e horários
- 💰 Preços, duração e comissão por serviço
- 📊 Histórico completo de agendamentos
- ❌ Controle de cancelamentos
- ⭐ Programa de fidelidade
- 🔐 Login seguro com JWT
- 📩 Verificação por código OTP via e-mail

---

## Área do Cliente

- 📲 Agendamento em poucos passos
- 📅 Calendário inteligente
- 👤 Escolha do profissional
- ⏰ Horários disponíveis em tempo real
- 📋 Consulta dos próprios agendamentos
- ❌ Cancelamento online
- 📱 Interface totalmente responsiva

---

# 🛠 Tecnologias

| Categoria | Tecnologia |
|------------|------------|
| Backend | Node.js |
| Framework | Express |
| Linguagem | TypeScript |
| Banco de Dados | PostgreSQL |
| ORM | Prisma |
| Front-end | HTML • CSS • JavaScript |
| Autenticação | JWT + OTP |
| Deploy | Render |
| Banco Cloud | Neon |
| Ícones | Phosphor Icons |

---

# 📂 Estrutura

```text
mvp-agenda/

├── prisma/
│   └── schema.prisma
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── agendar.html
│   └── assets/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── utils/
│   └── index.ts
│
├── .env.example
├── package.json
└── README.md
```

---

# ⚙️ Instalação

## Clone o projeto

```bash
git clone https://github.com/seu-usuario/mvp-agenda.git
```

```bash
cd mvp-agenda
```

## Instale as dependências

```bash
npm install
```

## Configure o ambiente

```bash
cp .env.example .env
```

Preencha as variáveis:

```env
DATABASE_URL=

JWT_SECRET=

EMAIL_USER=

EMAIL_PASS=
```

## Execute as migrations

```bash
npx prisma db push
```

## Inicie o projeto

```bash
npm run dev
```

---

# 📸 Interface

- Landing Page
- Login
- Cadastro
- Dashboard
- Agenda
- Serviços
- Profissionais
- Clientes
- Configurações
- Agendamento Público

> Em breve serão adicionadas capturas de tela da aplicação.

---

# 🔒 Segurança

- JWT Authentication
- Código OTP por e-mail
- Senhas criptografadas
- Proteção de rotas
- Validação de dados
- Rate Limit

---

# 🎯 Roadmap

- [x] Sistema de autenticação
- [x] Gestão de profissionais
- [x] Gestão de serviços
- [x] Agenda
- [x] Agendamento público
- [x] Cancelamento online
- [ ] Notificações WhatsApp
- [ ] Dashboard Financeiro
- [ ] Relatórios
- [ ] Assinatura SaaS
- [ ] Multiempresa
- [ ] Aplicativo Mobile

---

# 👨‍💻 Desenvolvedor

** Guilherme Lopes **

Desenvolvedor Back-end

---

# 📄 Licença

Este projeto é proprietário.

Todos os direitos reservados.
