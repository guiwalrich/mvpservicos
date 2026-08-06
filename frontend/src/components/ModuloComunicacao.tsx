import React, { useState } from 'react';
import {
  Send,
  Clock,
  CheckCheck,
  Search,
  UserCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface AutomacaoRegra {
  id: string;
  titulo: string;
  descricao: string;
  gatilho: 'Instantâneo' | '24h Antes' | '2h Antes' | 'Pós-Atendimento' | 'Aniversário' | 'Inativo 30 dias';
  canal: 'WhatsApp' | 'SMS' | 'E-mail';
  ativo: boolean;
  template: string;
  totalEnviados: number;
}

export interface HistoricoEnvio {
  id: string;
  data: string;
  cliente: string;
  telefone: string;
  whatsapp: string;
  tipoNotificacao: string;
  mensagemFormatada: string;
  status: 'Lido' | 'Entregue' | 'Enviado' | 'Falhou';
  canal: string;
}

const AUTOMACOES_INITIAL: AutomacaoRegra[] = [
  {
    id: 'aut-1',
    titulo: 'Confirmação de Agendamento',
    descricao: 'Enviada instantaneamente após o cliente agendar um serviço.',
    gatilho: 'Instantâneo',
    canal: 'WhatsApp',
    ativo: true,
    template: 'Olá {nome_cliente}! Seu agendamento para {servico} com {profissional} foi confirmado para {data_agendamento} às {horario_agendamento}. Te esperamos!',
    totalEnviados: 0
  },
  {
    id: 'aut-2',
    titulo: 'Lembrete Pré-Atendimento (24h)',
    descricao: 'Lembrete automático disparado um dia antes do horário marcado.',
    gatilho: '24h Antes',
    canal: 'WhatsApp',
    ativo: true,
    template: 'Passando para lembrar do seu atendimento amanhã ({data_agendamento}) às {horario_agendamento} para {servico} no estabelecimento. Precisa remarcar? Acesse: {link_agendamento}',
    totalEnviados: 0
  },
  {
    id: 'aut-3',
    titulo: 'Lembrete de Última Hora (2h)',
    descricao: 'Alerta de confirmação enviado 2 horas antes para evitar no-show.',
    gatilho: '2h Antes',
    canal: 'WhatsApp',
    ativo: true,
    template: 'Seu horário é daqui a pouco! Às {horario_agendamento} com {profissional}. Endereço: Av. Principal, 1000.',
    totalEnviados: 0
  },
  {
    id: 'aut-4',
    titulo: 'Pesquisa de Satisfação (NPS)',
    descricao: 'Enviada 1 hora após a conclusão do atendimento.',
    gatilho: 'Pós-Atendimento',
    canal: 'WhatsApp',
    ativo: true,
    template: 'Olá {nome_cliente}, como foi sua experiência no atendimento com {profissional}? Responda de 1 a 10 para nos ajudar a melhorar!',
    totalEnviados: 0
  },
  {
    id: 'aut-5',
    titulo: 'Felicitações de Aniversário',
    descricao: 'Mensagem com cupom especial enviada no dia do aniversário do cliente.',
    gatilho: 'Aniversário',
    canal: 'WhatsApp',
    ativo: true,
    template: 'Parabéns {nome_cliente}! A equipe deseja um excelente aniversário. Ganhe 15% de desconto no seu próximo serviço agendando esta semana.',
    totalEnviados: 0
  },
  {
    id: 'aut-6',
    titulo: 'Reativação de Clientes Inativos',
    descricao: 'Enviada para clientes que não realizam agendamentos há mais de 30 dias.',
    gatilho: 'Inativo 30 dias',
    canal: 'WhatsApp',
    ativo: false,
    template: 'Faz um tempo que não nos vemos, {nome_cliente}! Que tal renovar seu visual? Clique no link para agendar: {link_agendamento}',
    totalEnviados: 0
  }
];

const HISTORICO_INITIAL: HistoricoEnvio[] = [];

export default function ModuloComunicacao() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Tabs
  const [activeTab, setActiveTab] = useState<'regras' | 'templates' | 'historico'>('regras');

  // State
  const [automacoes, setAutomacoes] = useState<AutomacaoRegra[]>(AUTOMACOES_INITIAL);
  const [historico] = useState<HistoricoEnvio[]>(HISTORICO_INITIAL);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Template Editor State
  const [selectedAutomacaoId, setSelectedAutomacaoId] = useState<string>('aut-1');
  const selectedAutomacao = automacoes.find(a => a.id === selectedAutomacaoId) || automacoes[0];
  const [templateText, setTemplateText] = useState(selectedAutomacao.template);

  // Alterar automação selecionada no editor
  const handleSelectAutomacaoForEdit = (id: string) => {
    setSelectedAutomacaoId(id);
    const aut = automacoes.find(a => a.id === id);
    if (aut) setTemplateText(aut.template);
  };

  // Toggle Ativo/Inativo na Automação
  const handleToggleAutomacao = (id: string) => {
    setAutomacoes(automacoes.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a));
  };

  // Salvar Template Alterado
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    setAutomacoes(automacoes.map(a => a.id === selectedAutomacaoId ? { ...a, template: templateText } : a));
    alert('Template de mensagem salvo com sucesso!');
  };

  // Inserir Variável Dinâmica no Texto
  const handleInsertVariable = (variableTag: string) => {
    setTemplateText(prev => `${prev} ${variableTag}`);
  };

  // Simular Envio de Teste no Histórico
  const handleSimulateTestSend = (hist: HistoricoEnvio) => {
    window.open(`https://wa.me/55${hist.whatsapp}?text=${encodeURIComponent(hist.mensagemFormatada)}`, '_blank');
  };

  // Filtragem do Histórico
  const filteredHistorico = historico.filter(h => {
    const matchesSearch = h.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.telefone.includes(searchQuery) ||
                          h.tipoNotificacao.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter !== 'todos' && h.status !== statusFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">

      {/* Métricas da Central de Comunicação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Disparos no Mês</span>
            <Send size={18} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold">1.892</p>
          <span className="text-xs opacity-60 mt-1 block">Notificações enviadas</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Taxa de Entrega</span>
            <CheckCheck size={18} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400">98.4%</p>
          <span className="text-xs opacity-60 mt-1 block">Entregue via WhatsApp</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Taxa de Leitura</span>
            <UserCheck size={18} className="text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400">84.2%</p>
          <span className="text-xs opacity-60 mt-1 block">Mensagens visualizadas</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Ausências Evitadas</span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-400">38</p>
          <span className="text-xs opacity-60 mt-1 block">Agendamentos confirmados</span>
        </div>
      </div>

      {/* Navegação entre Abas da Comunicação */}
      <div className={`p-1.5 rounded-2xl border flex items-center gap-2 max-w-md ${
        isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <button
          onClick={() => setActiveTab('regras')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'regras'
              ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          Automações Ativas
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'templates'
              ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          Editor de Templates
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'historico'
              ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          Histórico de Envios
        </button>
      </div>

      {/* --- ABA 1: REGRAS DE AUTOMAÇÃO ATIVAS --- */}
      {activeTab === 'regras' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automacoes.map((regra) => (
            <div
              key={regra.id}
              className={`p-6 rounded-[24px] border flex flex-col justify-between transition-all shadow-sm ${
                isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block mb-2">
                      Gatilho: {regra.gatilho}
                    </span>
                    <h3 className="text-base font-bold leading-snug">{regra.titulo}</h3>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggleAutomacao(regra.id)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 ${
                      regra.ativo ? 'bg-emerald-500' : 'bg-neutral-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      regra.ativo ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <p className="text-xs opacity-60 mb-4">{regra.descricao}</p>

                {/* Preview do Template */}
                <div className={`p-3.5 rounded-2xl border text-xs opacity-80 line-clamp-3 mb-4 font-mono ${
                  isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'
                }`}>
                  "{regra.template}"
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="opacity-60">{regra.totalEnviados} disparos efetuados</span>
                <button
                  onClick={() => {
                    handleSelectAutomacaoForEdit(regra.id);
                    setActiveTab('templates');
                  }}
                  className="font-semibold text-blue-400 hover:underline"
                >
                  Editar Mensagem →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ABA 2: EDITOR DE TEMPLATES COM VARIÁVEIS DINÂMICAS --- */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Seletor de Automação & Formulário de Edição */}
          <div className={`lg:col-span-2 p-6 sm:p-8 rounded-[28px] border space-y-6 ${
            isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
          }`}>
            <div>
              <h3 className="text-lg font-bold">Personalizar Mensagem da Automação</h3>
              <p className="text-xs opacity-60">Selecione a regra e utilize variáveis dinâmicas no texto.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1.5">Selecione a Automação</label>
              <select
                value={selectedAutomacaoId}
                onChange={(e) => handleSelectAutomacaoForEdit(e.target.value)}
                className={`w-full h-11 border rounded-2xl px-4 text-xs font-semibold focus:outline-none ${
                  isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white' : 'bg-neutral-100 border-neutral-300 text-black'
                }`}
              >
                {automacoes.map(a => (
                  <option key={a.id} value={a.id}>{a.titulo} ({a.gatilho})</option>
                ))}
              </select>
            </div>

            {/* Inserir Variáveis Dinâmicas */}
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-2">Clique para Inserir Variável Dinâmica</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Nome do Cliente', tag: '{nome_cliente}' },
                  { label: 'Data do Agendamento', tag: '{data_agendamento}' },
                  { label: 'Horário', tag: '{horario_agendamento}' },
                  { label: 'Profissional', tag: '{profissional}' },
                  { label: 'Serviço', tag: '{servico}' },
                  { label: 'Link de Agendamento', tag: '{link_agendamento}' }
                ].map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertVariable(item.tag)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                      isDark ? 'bg-[#1c1c20] border-white/10 hover:bg-white/10 text-neutral-300' : 'bg-neutral-100 border-neutral-300 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    + {item.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Campo de Texto do Template */}
            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold opacity-70 mb-1.5">Texto da Mensagem (WhatsApp)</label>
                <textarea
                  rows={5}
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  className={`w-full border rounded-2xl p-4 text-xs font-mono focus:outline-none leading-relaxed ${
                    isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white' : 'bg-neutral-100 border-neutral-300 text-black'
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                className={`px-6 h-11 rounded-2xl font-semibold text-xs transition-all shadow-md ${
                  isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                Salvar Alterações no Template
              </button>
            </form>
          </div>

          {/* Preview em Tempo Real no Estilo Bolha de WhatsApp */}
          <div className={`p-6 sm:p-8 rounded-[28px] border flex flex-col justify-between ${
            isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
          }`}>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-4">Pré-visualização da Mensagem</h4>
              
              <div className="bg-[#0b141a] p-4 rounded-2xl border border-white/10 text-white font-sans text-xs space-y-2 relative shadow-lg">
                <div className="bg-[#005c4b] p-3 rounded-xl rounded-tr-none text-xs leading-relaxed break-words">
                  {templateText
                    .replace('{nome_cliente}', 'Carlos Silva')
                    .replace('{data_agendamento}', '01/08/2026')
                    .replace('{horario_agendamento}', '15:00')
                    .replace('{profissional}', 'Carlos Silva')
                    .replace('{servico}', 'Corte Fade + Barba')
                    .replace('{link_agendamento}', 'agende.yo/barbearia/agendar')}
                </div>
                <div className="text-[9px] text-right opacity-50 flex items-center justify-end gap-1">
                  <span>14:30</span>
                  <CheckCheck size={12} className="text-teal-400" />
                </div>
              </div>
            </div>

            <div className="text-[11px] opacity-60 pt-4 border-t border-white/10 mt-6">
              As variáveis em formato de chaves serão substituídas automaticamente pelos dados reais de cada atendimento no momento do disparo.
            </div>
          </div>

        </div>
      )}

      {/* --- ABA 3: HISTÓRICO DE ENVIOS & LOGS --- */}
      {activeTab === 'historico' && (
        <div className="space-y-4">
          
          {/* Toolbar de Filtro do Histórico */}
          <div className={`p-4 rounded-[24px] border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
            isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
          }`}>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, telefone ou tipo de notificação..."
                className={`w-full h-11 border rounded-2xl pl-11 pr-4 text-xs focus:outline-none transition-all ${
                  isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white placeholder-[#6e6e73]' : 'bg-neutral-100 border-neutral-300 text-black'
                }`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`h-11 border rounded-2xl px-4 text-xs focus:outline-none font-semibold ${
                isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white' : 'bg-neutral-100 border-neutral-300 text-black'
              }`}
            >
              <option value="todos">Todos os Status</option>
              <option value="Lido">Lido</option>
              <option value="Entregue">Entregue</option>
              <option value="Enviado">Enviado</option>
              <option value="Falhou">Falhou</option>
            </select>
          </div>

          {/* Tabela do Histórico de Envios */}
          <div className={`rounded-[24px] border overflow-hidden ${
            isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className={`border-b text-xs font-semibold ${
                    isDark ? 'border-white/10 bg-white/5 text-neutral-300' : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                  }`}>
                    <th className="p-4">Data e Hora</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Notificação / Automação</th>
                    <th className="p-4">Mensagem Disparada</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredHistorico.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono opacity-70">{item.data}</td>
                      <td className="p-4 font-bold">{item.cliente}<br/><span className="text-[10px] opacity-60 font-normal">{item.telefone}</span></td>
                      <td className="p-4 opacity-80">{item.tipoNotificacao}</td>
                      <td className="p-4 max-w-xs truncate opacity-70 font-mono text-[11px]">{item.mensagemFormatada}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          item.status === 'Lido'
                            ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                            : item.status === 'Entregue'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : item.status === 'Enviado'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSimulateTestSend(item)}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors ${
                            isDark ? 'bg-white/10 border-white/10 hover:bg-white/20 text-white' : 'bg-neutral-100 border-neutral-300 hover:bg-neutral-200 text-black'
                          }`}
                        >
                          Testar no WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
