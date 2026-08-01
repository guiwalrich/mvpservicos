import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  X,
  UserCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type EtapaFunil = 
  | 'lead' 
  | 'qualificacao' 
  | 'negociacao' 
  | 'agendado' 
  | 'recorrente' 
  | 'perdido';

export interface InteracaoItem {
  id: string;
  data: string;
  tipo: 'WhatsApp' | 'Telefone' | 'Presencial';
  descricao: string;
  autor: string;
}

export interface LeadOportunidade {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  email: string;
  servicoInteresse: string;
  valorEstimado: number;
  etapa: EtapaFunil;
  responsavel: string;
  dataCriacao: string;
  dataUltimoContato: string;
  dataFollowUp: string;
  motivoPerda?: string;
  interacoes: InteracaoItem[];
}

const COLUNAS_KANBAN: { id: EtapaFunil; titulo: string; corBorder: string }[] = [
  { id: 'lead', titulo: 'Novo Lead', corBorder: 'border-blue-500/40' },
  { id: 'qualificacao', titulo: 'Qualificação', corBorder: 'border-[#3B82F6]/40' },
  { id: 'negociacao', titulo: 'Negociação / Orçamento', corBorder: 'border-amber-500/40' },
  { id: 'agendado', titulo: 'Agendamento Confirmado', corBorder: 'border-emerald-500/40' },
  { id: 'recorrente', titulo: 'Cliente Fidelizado', corBorder: 'border-purple-500/40' },
  { id: 'perdido', titulo: 'Oportunidade Perdida', corBorder: 'border-red-500/40' },
];

const LEADS_DEMO: LeadOportunidade[] = [
  {
    id: 'ld-1',
    nome: 'Marcos Vinicius',
    telefone: '(11) 98111-2233',
    whatsapp: '11981112233',
    email: 'marcos.v@gmail.com',
    servicoInteresse: 'Fechamento de Costas Blackwork',
    valorEstimado: 1200.00,
    etapa: 'lead',
    responsavel: 'Juliana Lima',
    dataCriacao: '30/07/2026',
    dataUltimoContato: '30/07/2026',
    dataFollowUp: '01/08/2026',
    interacoes: [
      { id: 'i1', data: '30/07/2026 15:30', tipo: 'WhatsApp', descricao: 'Lead solicitou orçamento pelo Instagram para sessão de 6 horas.', autor: 'Juliana Lima' }
    ]
  },
  {
    id: 'ld-2',
    nome: 'Rodrigo Alcantara',
    telefone: '(11) 97222-3344',
    whatsapp: '11972223344',
    email: 'rodrigo.a@outlook.com',
    servicoInteresse: 'Pacote Dia do Noivo (Barba + Corte + Massagem)',
    valorEstimado: 350.00,
    etapa: 'qualificacao',
    responsavel: 'Carlos Silva',
    dataCriacao: '28/07/2026',
    dataUltimoContato: '29/07/2026',
    dataFollowUp: '31/07/2026',
    interacoes: [
      { id: 'i2', data: '29/07/2026 11:00', tipo: 'Telefone', descricao: 'Explicado os serviços inclusos no pacote. Aguardando confirmação da data do casamento.', autor: 'Carlos Silva' }
    ]
  },
  {
    id: 'ld-3',
    nome: 'Patrícia Amorim',
    telefone: '(11) 96333-4455',
    whatsapp: '11963334455',
    email: 'patricia.a@yahoo.com',
    servicoInteresse: 'Pacote Limpeza de Pele + Coloração',
    valorEstimado: 450.00,
    etapa: 'negociacao',
    responsavel: 'Ana Souza',
    dataCriacao: '25/07/2026',
    dataUltimoContato: '28/07/2026',
    dataFollowUp: '01/08/2026',
    interacoes: [
      { id: 'i3', data: '28/07/2026 16:20', tipo: 'WhatsApp', descricao: 'Enviado proposta com 10% de desconto para pagamento via PIX.', autor: 'Ana Souza' }
    ]
  },
  {
    id: 'ld-4',
    nome: 'Felipe Ramos',
    telefone: '(11) 95444-5566',
    whatsapp: '11954445566',
    email: 'felipe.r@gmail.com',
    servicoInteresse: 'Corte + Barba Terapia',
    valorEstimado: 80.00,
    etapa: 'agendado',
    responsavel: 'Carlos Silva',
    dataCriacao: '20/07/2026',
    dataUltimoContato: '31/07/2026',
    dataFollowUp: '31/07/2026',
    interacoes: [
      { id: 'i4', data: '31/07/2026 09:00', tipo: 'WhatsApp', descricao: 'Agendamento confirmado na agenda principal para hoje às 15h.', autor: 'Carlos Silva' }
    ]
  }
];

export default function CrmComercial() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State
  const [leads, setLeads] = useState<LeadOportunidade[]>(LEADS_DEMO);
  const [searchQuery, setSearchQuery] = useState('');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('todos');

  // Modais
  const [isNovoLeadModalOpen, setIsNovoLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadOportunidade | null>(null);

  // Form State Novo Lead
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [servicoInteresse, setServicoInteresse] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');
  const [responsavel, setResponsavel] = useState('Carlos Silva');
  const [dataFollowUp, setDataFollowUp] = useState('');

  // Form State Nova Interação
  const [novaInteracaoTexto, setNovaInteracaoTexto] = useState('');
  const [novaInteracaoTipo, setNovaInteracaoTipo] = useState<'WhatsApp' | 'Telefone' | 'Presencial'>('WhatsApp');

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (novaEtapa: EtapaFunil) => {
    const leadId = window.localStorage.getItem('dragged_lead_id');
    if (!leadId) return;

    setLeads(leads.map(l => l.id === leadId ? { ...l, etapa: novaEtapa } : l));
  };

  // Salvar Novo Lead
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !servicoInteresse) return;

    const novo: LeadOportunidade = {
      id: `ld-${Date.now()}`,
      nome,
      telefone: telefone || '(11) 90000-0000',
      whatsapp: telefone.replace(/\D/g, '') || '11900000000',
      email: email || 'lead@email.com',
      servicoInteresse,
      valorEstimado: parseFloat(valorEstimado) || 100.00,
      etapa: 'lead',
      responsavel,
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      dataUltimoContato: new Date().toLocaleDateString('pt-BR'),
      dataFollowUp: dataFollowUp || new Date().toLocaleDateString('pt-BR'),
      interacoes: [
        {
          id: `i-${Date.now()}`,
          data: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          tipo: 'WhatsApp',
          descricao: 'Oportunidade cadastrada no CRM Comercial.',
          autor: responsavel
        }
      ]
    };

    setLeads([novo, ...leads]);
    setIsNovoLeadModalOpen(false);
    resetForm();
  };

  // Adicionar Nota de Interação
  const handleAddInteracao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !novaInteracaoTexto) return;

    const novaInt: InteracaoItem = {
      id: `i-${Date.now()}`,
      data: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      tipo: novaInteracaoTipo,
      descricao: novaInteracaoTexto,
      autor: selectedLead.responsavel
    };

    const leadAtualizado = {
      ...selectedLead,
      dataUltimoContato: new Date().toLocaleDateString('pt-BR'),
      interacoes: [novaInt, ...selectedLead.interacoes]
    };

    setLeads(leads.map(l => l.id === selectedLead.id ? leadAtualizado : l));
    setSelectedLead(leadAtualizado);
    setNovaInteracaoTexto('');
  };

  // Mover Etapa do Lead no Modal
  const handleChangeLeadEtapa = (novaEtapa: EtapaFunil) => {
    if (!selectedLead) return;
    const leadAtualizado = { ...selectedLead, etapa: novaEtapa };
    setLeads(leads.map(l => l.id === selectedLead.id ? leadAtualizado : l));
    setSelectedLead(leadAtualizado);
  };

  const resetForm = () => {
    setNome('');
    setTelefone('');
    setEmail('');
    setServicoInteresse('');
    setValorEstimado('');
    setResponsavel('Carlos Silva');
    setDataFollowUp('');
  };

  // Métricas do Funil
  const totalLeadsAtivos = leads.filter(l => l.etapa !== 'perdido').length;
  const valorTotalPipeline = leads.filter(l => l.etapa !== 'perdido').reduce((acc, curr) => acc + curr.valorEstimado, 0);
  const leadsConvertidos = leads.filter(l => l.etapa === 'agendado' || l.etapa === 'recorrente').length;
  const taxaConversao = totalLeadsAtivos > 0 ? ((leadsConvertidos / leads.length) * 100).toFixed(1) : '0';

  // Filtragem dos Leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.servicoInteresse.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.telefone.includes(searchQuery);
    if (!matchesSearch) return false;

    if (responsavelFilter !== 'todos' && l.responsavel !== responsavelFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Cards (Espaçamento Respirável) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Oportunidades em Aberto</span>
            <UserCheck size={18} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold">{totalLeadsAtivos}</p>
          <span className="text-xs opacity-60 mt-1 block">Leads em negociação</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Faturamento no Pipeline</span>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400">R$ {valorTotalPipeline.toFixed(2)}</p>
          <span className="text-xs opacity-60 mt-1 block">Valor estimado em vendas</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Taxa de Conversão</span>
            <CheckCircle2 size={18} className="text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400">{taxaConversao}%</p>
          <span className="text-xs opacity-60 mt-1 block">Leads convertidos em agendamentos</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Follow-ups para Hoje</span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-400">2</p>
          <span className="text-xs opacity-60 mt-1 block">Contatos com retorno agendado</span>
        </div>
      </div>

      {/* Toolbar: Busca, Filtro por Responsável e Botão Nova Oportunidade */}
      <div className={`p-4 rounded-[24px] border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome do lead, serviço de interesse ou telefone..."
            className={`w-full h-11 border rounded-2xl pl-11 pr-4 text-xs focus:outline-none transition-all ${
              isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white placeholder-[#6e6e73]' : 'bg-neutral-100 border-neutral-300 text-black'
            }`}
          />
        </div>

        {/* Filter Responsável & Action */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={responsavelFilter}
            onChange={(e) => setResponsavelFilter(e.target.value)}
            className={`h-11 border rounded-2xl px-4 text-xs focus:outline-none font-semibold ${
              isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white' : 'bg-neutral-100 border-neutral-300 text-black'
            }`}
          >
            <option value="todos">Todos os Responsáveis</option>
            <option value="Carlos Silva">Carlos Silva</option>
            <option value="Ana Souza">Ana Souza</option>
            <option value="Juliana Lima">Juliana Lima</option>
          </select>

          <button
            onClick={() => { resetForm(); setIsNovoLeadModalOpen(true); }}
            className={`h-11 px-5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-[0.98] ${
              isDark ? 'bg-white text-black hover:bg-neutral-200 border-white' : 'bg-black text-white hover:bg-neutral-800 border-black'
            }`}
          >
            <Plus size={16} /> Nova Oportunidade
          </button>
        </div>

      </div>

      {/* --- QUADRO KANBAN (DRAG & DROP DE OPORTUNIDADES) --- */}
      <div className="flex gap-5 overflow-x-auto pb-4 pt-1 items-start min-h-[550px]">
        {COLUNAS_KANBAN.map((coluna) => {
          const leadsDaColuna = filteredLeads.filter(l => l.etapa === coluna.id);
          const valorColuna = leadsDaColuna.reduce((acc, curr) => acc + curr.valorEstimado, 0);

          return (
            <div
              key={coluna.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(coluna.id)}
              className={`w-80 shrink-0 rounded-[24px] border flex flex-col max-h-[700px] ${
                isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
              }`}
            >
              {/* Header da Coluna */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDark ? 'border-white/10 bg-white/5' : 'border-neutral-200 bg-neutral-50'
              } rounded-t-[23px]`}>
                <div>
                  <h3 className="text-xs font-bold leading-snug flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full border ${coluna.corBorder}`} />
                    {coluna.titulo}
                  </h3>
                  <span className="text-[11px] opacity-60 font-semibold mt-0.5 block">
                    R$ {valorColuna.toFixed(2)}
                  </span>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-neutral-200 border-neutral-300 text-black'
                }`}>
                  {leadsDaColuna.length}
                </span>
              </div>

              {/* Lista de Cards da Coluna (Arrastáveis) */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {leadsDaColuna.map((lead) => (
                  <motion.div
                    key={lead.id}
                    layoutId={lead.id}
                    draggable
                    onDragStart={() => window.localStorage.setItem('dragged_lead_id', lead.id)}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] shadow-sm relative ${
                      isDark ? 'bg-[#1c1c20] border-white/10 hover:border-white/20' : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-bold truncate pr-2">{lead.nome}</h4>
                      <span className="text-xs font-extrabold text-emerald-400 whitespace-nowrap">
                        R$ {lead.valorEstimado.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs opacity-75 line-clamp-1 mb-3 font-medium">{lead.servicoInteresse}</p>

                    <div className="space-y-1 text-[11px] opacity-60 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span>Responsável:</span>
                        <span className="font-semibold text-current">{lead.responsavel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Follow-up:</span>
                        <span className="font-semibold text-amber-400">{lead.dataFollowUp}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {leadsDaColuna.length === 0 && (
                  <div className="h-32 border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-xs opacity-40">
                    Nenhuma oportunidade
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL: DETALHES DO LEAD & HISTÓRICO DE INTERAÇÕES --- */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl max-h-[90vh] flex flex-col">
                <div className={`rounded-[27px] p-6 sm:p-8 relative overflow-y-auto ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => setSelectedLead(null)} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={20} />
                  </button>

                  {/* Lead Header */}
                  <div className="flex items-start justify-between mb-6 border-b border-white/10 pb-5">
                    <div>
                      <h2 className="text-xl font-bold">{selectedLead.nome}</h2>
                      <p className="text-xs opacity-60 mt-0.5">{selectedLead.email} • {selectedLead.telefone}</p>
                      <p className="text-xs font-semibold text-emerald-400 mt-2">
                        Interesse: {selectedLead.servicoInteresse} (R$ {selectedLead.valorEstimado.toFixed(2)})
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/55${selectedLead.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <MessageSquare size={14} /> Abrir WhatsApp
                    </a>
                  </div>

                  {/* Alterar Etapa do Funil */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold opacity-70 mb-2">Mover Etapa no Funil Comercial</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {COLUNAS_KANBAN.map(col => (
                        <button
                          key={col.id}
                          onClick={() => handleChangeLeadEtapa(col.id)}
                          className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                            selectedLead.etapa === col.id
                              ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                              : 'opacity-60 border-white/10 hover:opacity-100'
                          }`}
                        >
                          {col.titulo}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Registrar Nova Nota de Interação */}
                  <form onSubmit={handleAddInteracao} className="mb-6 space-y-3">
                    <label className="block text-xs font-semibold opacity-70">Registrar Nova Interação com o Lead</label>
                    <div className="flex gap-2">
                      <select
                        value={novaInteracaoTipo}
                        onChange={(e) => setNovaInteracaoTipo(e.target.value as any)}
                        className={`h-11 border rounded-2xl px-3 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Telefone">Telefone</option>
                        <option value="Presencial">Presencial</option>
                      </select>

                      <input
                        type="text"
                        value={novaInteracaoTexto}
                        onChange={(e) => setNovaInteracaoTexto(e.target.value)}
                        placeholder="Descreva o retorno ou conversa recente..."
                        className={`flex-1 h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                      />

                      <button
                        type="submit"
                        className={`px-4 h-11 rounded-2xl font-semibold text-xs transition-all ${
                          isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white'
                        }`}
                      >
                        Registrar
                      </button>
                    </div>
                  </form>

                  {/* Histórico de Interações */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold opacity-70">Histórico de Conversas & Acompanhamento</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedLead.interacoes.map(int => (
                        <div key={int.id} className={`p-3.5 rounded-2xl border text-xs ${
                          isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'
                        }`}>
                          <div className="flex items-center justify-between mb-1.5 text-[10px] opacity-60">
                            <span>{int.tipo} • por {int.autor}</span>
                            <span>{int.data}</span>
                          </div>
                          <p className="opacity-90">{int.descricao}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: NOVA OPORTUNIDADE (CADASTRAR LEAD) --- */}
      <AnimatePresence>
        {isNovoLeadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl">
                <div className={`rounded-[27px] p-6 sm:p-8 relative ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => { setIsNovoLeadModalOpen(false); resetForm(); }} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>

                  <h3 className="text-xl font-bold mb-1">Cadastrar Nova Oportunidade</h3>
                  <p className="text-xs opacity-60 mb-6">Adicione novos leads para acompanhamento no Funil Comercial.</p>

                  <form onSubmit={handleCreateLead} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Nome do Lead / Cliente *</label>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Rodrigo Alcantara"
                        className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Telefone / WhatsApp</label>
                        <input
                          type="text"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          placeholder="(11) 98888-7777"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Valor Estimado (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={valorEstimado}
                          onChange={(e) => setValorEstimado(e.target.value)}
                          placeholder="350.00"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Serviço de Interesse *</label>
                      <input
                        type="text"
                        value={servicoInteresse}
                        onChange={(e) => setServicoInteresse(e.target.value)}
                        placeholder="Ex: Pacote Dia do Noivo, Fechamento de Braço Tatuagem"
                        className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Responsável *</label>
                        <select
                          value={responsavel}
                          onChange={(e) => setResponsavel(e.target.value)}
                          className={`w-full h-11 border rounded-2xl px-3 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        >
                          <option value="Carlos Silva">Carlos Silva</option>
                          <option value="Ana Souza">Ana Souza</option>
                          <option value="Juliana Lima">Juliana Lima</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Data do Follow-up</label>
                        <input
                          type="text"
                          value={dataFollowUp}
                          onChange={(e) => setDataFollowUp(e.target.value)}
                          placeholder="DD/MM/AAAA"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full font-semibold text-xs h-11 rounded-2xl transition-all mt-2 shadow-md ${
                        isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                      }`}
                    >
                      Cadastrar Oportunidade no Funil
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
