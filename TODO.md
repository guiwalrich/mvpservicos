# TODO - Implementação de Gestão de Horários e Disponibilidade

## ✅ Passo 1: Modelos do Banco de Dados (schema.prisma)

- [x] Adicionar modelo `HorarioFuncionamento`
- [x] Adicionar modelo `DisponibilidadeProfissional`
- [x] Adicionar modelo `ProfissionalServico` (duração personalizada)

## ⬜ Passo 2: Backend - Novas Rotas

- [x] Criar `src/routes/horariosRoutes.ts` (CRUD horários empresa)
- [x] Criar `src/routes/disponibilidadeRoutes.ts` (CRUD disponibilidade profissional)
- [x] Adicionar sub-rotas de serviços por profissional em `profissionaisRoutes.ts`
- [x] Adicionar endpoint de horários disponíveis em `agendapublicaRoutes.ts`
- [x] Adicionar verificação de conflito em `agendamentosRoutes.ts`
- [x] Registrar novas rotas em `src/index.ts`

## ⬜ Passo 3: Frontend - Dashboard (dashboard.html)

- [x] Adicionar nova aba "Horários" com grade semanal
- [x] Adicionar gerenciamento de disponibilidade por profissional
- [x] Modal de agendamento com verificação de horários
- [x] Editar duração por profissional/serviço

## ⬜ Passo 4: Frontend - Página Pública (agendar.html)

- [x] Calendário interativo com dias disponíveis
- [x] Seleção de horário baseado na disponibilidade
- [x] Validação de duração personalizada

## ⬜ Passo 5: Build e Testes

- [x] Executar `npm run build` e corrigir erros
- [x] Testar fluxo completo
