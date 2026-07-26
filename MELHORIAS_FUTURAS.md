# 🚀 Backlog & Melhorias Futuras do Projeto MVP

Documento de referência contendo todas as melhorias técnicas, arquiteturais e funcionais mapeadas durante a revisão do projeto.

---

## 1. 🗄️ Otimizaciones no Banco de Dados (Prisma ORM)

### A. Adicionar Índices para Performance Multi-Tenant
Adicionar `@@index` nas tabelas principais em `prisma/schema.prisma` para acelerar pesquisas à medida que o volume de dados crescer:

```prisma
model Agendamento {
  // ...
  @@index([empresa_id, data_hora])
  @@index([profissional_id, data_hora])
}

model Cliente {
  // ...
  @@index([empresa_id, telefone])
}

model Profissional {
  // ...
  @@index([empresa_id, ativo])
}

model Servico {
  // ...
  @@index([empresa_id, ativo])
}
```

---

## 2. 🛡️ Segurança & Validações Backend

### A. Validação de Schemas com Zod
Substituir verificações manuais de `req.body` por schemas tipados usando a biblioteca `zod`:
- Validar formato de e-mail, senhas fortes e formato de telefone.
- Validar formato de datas `YYYY-MM-DD` e horários `HH:MM`.

### B. Endurecimento do JWT em Produção
- Exigir que a variável `JWT_SECRET` seja obrigatoriamente informada via `.env` em ambiente de produção (lançando erro na inicialização caso ausente).
- Adicionar tempo de expiração configurável e suporte a refresh tokens caso necessário.

### C. Rate Limiting (Proteção contra Brute Force / Spam)
- Adicionar `express-rate-limit` nas rotas públicas de login/registro (`/auth/login`) e no endpoint de agendamento público (`/agendar-api/:slug`).

---

## 3. 💼 Funcionalidades & Regras de Negócio

### A. Gestão Financeira e Relatórios no Dashboard
- Adicionar no `dashboard.html` indicadores de:
  - Faturamento total por período (dia, semana, mês).
  - Cálculo automático de comissões por profissional.
  - Relatório de serviços mais agendados e clientes mais frequentes.

### B. Reagendamento e Cancelamento pelo Cliente
- Criar link/página pública com hash único para que o próprio cliente possa visualizar, cancelar ou reagendar o seu horário sem depender de contato manual.

---

## 4. 🧪 Testes Automatizados & CI/CD

### A. Testes Unitários e de Integração
- Configurar `Vitest` ou `Jest` para testar:
  - Algoritmo de cálculo de slots vagos (`agendapublicaRoutes.ts`).
  - Bloqueio de sobreposição de agendamentos.
  - Autenticação e isolamento de tenants.

### B. Scripts de Banco de Dados
- Adicionar scripts no `package.json` para facilidade de desenvolvimento:
  - `"db:push": "prisma db push"`
  - `"db:studio": "prisma studio"`
  - `"db:migrate": "prisma migrate dev"`

---

## 5. 💳 Modelo de Planos Mensais & Trial de 7 Dias (Monetização SaaS)

### A. Estrutura de Planos e Precificação
- **Free Trial**: 7 dias de degustação gratuita no cadastro de novas empresas.
- **Plano Solo (R$ 49,90/mês)**: 1 profissional cadastrado, agendamentos ilimitados, link público exclusivo.
- **Plano Equipe (R$ 99,90/mês)**: Até 5 profissionais, lembretes automáticos no WhatsApp (24h e 1h antes), relatórios e comissões.
- **Plano Premium (R$ 149,90/mês)**: Profissionais ilimitados, suporte prioritário e relatórios avançados.

### B. Fluxo de Bloqueio Automático e Cobrança Manual
1. **Cadastro**: Novas empresas recebem `status_assinatura = "trial"` e `trial_expira_em = DataAtual + 7 dias`.
2. **Expiração**: Após os 7 dias (ou se o pagamento vencer), a API intercepta as requisições e retorna status HTTP `402 Payment Required`.
3. **Tela de Bloqueio no Dashboard**:
   - Exibe a modal com opções de planos e a Chave PIX do sistema.
   - Botão direto: 📲 **"Enviar Comprovante de Pagamento via WhatsApp"** pré-preenchido com o ID da empresa.
4. **Desbloqueio Manual pelo Administrador**:
   - Rota administrativa segura (`PUT /admin/empresas/:id/desbloquear`) para alterar o status para `"ativo"`, definir o plano escolhido e renovar a vigência por +30 dias após conferir o comprovante PIX no WhatsApp.
