import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Star,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  X,
  UserCheck,
  UserX,
  ChevronRight,
  User,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface AgendamentoHistorico {
  id: string;
  servico: string;
  data: string;
  horario: string;
  valor: string;
  profissional: string;
  status: string;
}

export interface TransacaoFinanceira {
  id: string;
  data: string;
  descricao: string;
  valor: string;
  metodo: string;
}

export interface MensagemHistorico {
  id: string;
  data: string;
  canal: 'WhatsApp' | 'E-mail' | 'SMS';
  texto: string;
}

export interface ClienteCRM {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  endereco: string;
  observacoes: string;
  foto?: string;
  tags: string[];
  origem: string; // Ex: "Instagram", "Indicação", "Google", "Passante"
  favorito: boolean;
  inativo: boolean; // Sem agendamentos há > 30 dias
  dataCadastro: string;
  ultimaVisita: string;
  totalAgendamentos: number;
  totalGastoLtv: string;
  historicoAgendamentos: AgendamentoHistorico[];
  historicoFinanceiro: TransacaoFinanceira[];
  historicoMensagens: MensagemHistorico[];
  anotacoesInternas: string[];
}

export const CLIENTES_DEMO: ClienteCRM[] = [];

export default function CrmClientes() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const empresaLogada = JSON.parse(localStorage.getItem('empresa') || '{}');
  const userAccountKey = empresaLogada.email ? empresaLogada.email.replace(/[^a-zA-Z0-9]/g, '_') : 'default_account';

  // State
  const [clientes, setClientes] = useState<ClienteCRM[]>(() => {
    const saved = localStorage.getItem(`clientes_${userAccountKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem(`clientes_${userAccountKey}`, JSON.stringify(clientes));
  }, [clientes, userAccountKey]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'mais_rentaveis' | 'inativos'>('todos');

  // Modais
  const [isNovoClienteModalOpen, setIsNovoClienteModalOpen] = useState(false);
  const [selectedClienteDossie, setSelectedClienteDossie] = useState<ClienteCRM | null>(null);
  const [dossieTab, setDossieTab] = useState<'visao_geral' | 'agendamentos' | 'financeiro' | 'mensagens' | 'anotacoes'>('visao_geral');

  // Form State para Novo Cliente
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [origem, setOrigem] = useState('Instagram');
  const [tagInput, setTagInput] = useState('VIP');
  const [observacoes, setObservacoes] = useState('');

  // Toggle Favorito
  const handleToggleFavorito = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClientes(clientes.map(c => c.id === id ? { ...c, favorito: !c.favorito } : c));
  };

  // Cadastrar Cliente
  const handleCreateCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !telefone) return;

    const novo: ClienteCRM = {
      id: `c-${Date.now()}`,
      nome,
      telefone,
      whatsapp: telefone.replace(/\D/g, ''),
      email: email || 'cliente@email.com',
      cpf: cpf || '000.000.000-00',
      dataNascimento: nascimento || '01/01/1990',
      endereco: endereco || 'Não informado',
      observacoes: observacoes || 'Sem observações iniciais.',
      tags: tagInput ? [tagInput] : ['Novo Cliente'],
      origem: origem || 'Balcão',
      favorito: false,
      inativo: false,
      dataCadastro: new Date().toLocaleDateString('pt-BR'),
      ultimaVisita: 'Sem agendamentos',
      totalAgendamentos: 0,
      totalGastoLtv: 'R$ 0,00',
      historicoAgendamentos: [],
      historicoFinanceiro: [],
      historicoMensagens: [],
      anotacoesInternas: ['Cliente cadastrado no sistema.']
    };

    setClientes([novo, ...clientes]);
    setIsNovoClienteModalOpen(false);
    // Limpar campos
    setNome('');
    setTelefone('');
    setEmail('');
    setCpf('');
    setNascimento('');
    setEndereco('');
    setObservacoes('');
  };

  // Filtragem dos Clientes
  const filteredClientes = clientes.filter(c => {
    // Filtro por termo de busca (Nome, Telefone, Email, CPF)
    const matchesQuery = 
      c.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.telefone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cpf.includes(searchQuery);

    if (!matchesQuery) return false;

    // Filtro por Categoria de Status
    if (activeFilter === 'mais_rentaveis' && !c.favorito) return false;
    if (activeFilter === 'inativos' && !c.inativo) return false;

    return true;
  });

  // Métricas Rápidas
  const totalClientesCount = clientes.length;
  const favoritosCount = clientes.filter(c => c.favorito).length;
  const inativosCount = clientes.filter(c => c.inativo).length;

  return (
    <div className="space-y-6">
      
      {/* Cards de Métricas do CRM */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium opacity-70">Total de Clientes</span>
            <UserCheck size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold">{totalClientesCount}</p>
          <span className="text-[11px] opacity-60">Base de dados ativa</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium opacity-70">Clientes Mais Rentáveis (Top LTV)</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold">{favoritosCount}</p>
          <span className="text-[11px] opacity-60">Maior receita acumulada</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium opacity-70">Inativos (&gt; 30 dias)</span>
            <UserX size={16} className="text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">{inativosCount}</p>
          <span className="text-[11px] opacity-60">Prontos para reconquista</span>
        </div>
      </div>

      {/* Toolbar de Pesquisa Inteligente e Filtros */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por Nome, Telefone, E-mail ou CPF..."
            className={`w-full h-10 border rounded-xl pl-10 pr-4 text-xs focus:outline-none transition-all ${
              isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white placeholder-[#6e6e73]' : 'bg-neutral-100 border-neutral-300 text-black'
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center border rounded-xl p-1 ${
            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-200'
          }`}>
            <button
              onClick={() => setActiveFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'todos'
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Todos ({clientes.length})
            </button>

            <button
              onClick={() => setActiveFilter('mais_rentaveis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'mais_rentaveis'
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <TrendingUp size={12} className="text-emerald-400" /> Mais Rentáveis ($) ({favoritosCount})
            </button>

            <button
              onClick={() => setActiveFilter('inativos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'inativos'
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <UserX size={12} className="text-red-400" /> Inativos ({inativosCount})
            </button>
          </div>

          {/* Primary Add Client Button */}
          <button
            onClick={() => setIsNovoClienteModalOpen(true)}
            className={`h-10 px-4 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-[0.98] ${
              isDark ? 'bg-white text-black hover:bg-neutral-200 border-white' : 'bg-black text-white hover:bg-neutral-800 border-black'
            }`}
          >
            <Plus size={16} /> Novo Cliente
          </button>
        </div>

      </div>

      {/* Grid de Cards de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.map((cliente) => (
          <div
            key={cliente.id}
            onClick={() => setSelectedClienteDossie(cliente)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] relative flex flex-col justify-between shadow-sm ${
              isDark ? 'bg-[#121215]/90 border-white/10 hover:border-white/20' : 'bg-white border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {/* Header: Avatar, Nome e Botão de Favorito */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold text-sm ${
                    isDark ? 'bg-[#1c1c20] border-white/10 text-white' : 'bg-neutral-100 border-neutral-300 text-black'
                  }`}>
                    {cliente.nome.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold leading-snug">{cliente.nome}</h3>
                    <p className="text-xs opacity-60 flex items-center gap-1">
                      <Phone size={12} /> {cliente.telefone}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleToggleFavorito(cliente.id, e)}
                  title={cliente.favorito ? "Cliente Mais Rentável (Top LTV)" : "Marcar como Mais Rentável"}
                  className="p-1.5 rounded-lg opacity-80 hover:opacity-100 transition-transform active:scale-90"
                >
                  <TrendingUp
                    size={18}
                    className={cliente.favorito ? "text-emerald-400" : "text-neutral-500 opacity-40"}
                  />
                </button>
              </div>

              {/* Tags do Cliente */}
              <div className="flex items-center gap-1.5 flex-wrap mb-4">
                {cliente.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
                {cliente.inativo && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/20">
                    Inativo (&gt; 30 dias)
                  </span>
                )}
              </div>
            </div>

            {/* Footer Stats & Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="opacity-60 text-[10px] block">LTV Gasto</span>
                <span className="font-bold text-sm">{cliente.totalGastoLtv}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/55${cliente.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`p-2 rounded-xl border transition-colors ${
                    isDark ? 'bg-[#1c1c20] border-white/[0.06] text-emerald-400 hover:bg-emerald-500/10' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                  title="Abrir WhatsApp"
                >
                  <MessageSquare size={14} />
                </a>

                <button 
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isDark ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-neutral-100 border-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  Dossiê 360° <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL: NOVO CLIENTE (CADASTRO COMPLETO) --- */}
      <AnimatePresence>
        {isNovoClienteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl max-h-[90vh] flex flex-col">
                <div className={`rounded-[27px] p-6 sm:p-8 relative overflow-y-auto ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => setIsNovoClienteModalOpen(false)} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>

                  <h3 className="text-xl font-bold mb-1">Cadastrar Novo Cliente</h3>
                  <p className="text-xs opacity-60 mb-6">Ficha de cadastro completa com segmentação por Tags e Origem.</p>

                  <form onSubmit={handleCreateCliente} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Gabriel Monteiro"
                        className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Telefone / WhatsApp *</label>
                        <input
                          type="text"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">E-mail</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="cliente@email.com"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">CPF</label>
                        <input
                          type="text"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value)}
                          placeholder="000.000.000-00"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Data de Nascimento</label>
                        <input
                          type="text"
                          value={nascimento}
                          onChange={(e) => setNascimento(e.target.value)}
                          placeholder="DD/MM/AAAA"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Origem do Cliente</label>
                        <select
                          value={origem}
                          onChange={(e) => setOrigem(e.target.value)}
                          className={`w-full h-11 border rounded-2xl px-3 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        >
                          <option value="Instagram">Instagram</option>
                          <option value="Indicação">Indicação de Amigos</option>
                          <option value="Google Meu Negócio">Google Meu Negócio</option>
                          <option value="Passante">Passante / Fachada</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Tag de Segmentação</label>
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Ex: VIP, Cabelo, Barba"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Endereço Completo</label>
                      <input
                        type="text"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        placeholder="Rua, Número, Bairro, Cidade"
                        className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Observações Técnicas / Preferências</label>
                      <textarea
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Ex: Alergia a lâmina, preferência por café expresso, toalha quente."
                        rows={2}
                        className={`w-full border rounded-2xl p-3 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full font-semibold text-xs h-11 rounded-2xl transition-all mt-2 shadow-md ${
                        isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                      }`}
                    >
                      Salvar Cadastro de Cliente
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: DOSSIÊ PERFIL 360° DO CLIENTE --- */}
      <AnimatePresence>
        {selectedClienteDossie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-3xl">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl flex flex-col max-h-[90vh]">
                <div className={`rounded-[27px] p-6 sm:p-8 relative overflow-y-auto flex-1 ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  
                  {/* Close Button */}
                  <button onClick={() => setSelectedClienteDossie(null)} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={20} />
                  </button>

                  {/* Top Dossier Header */}
                  <div className="flex items-start gap-4 mb-6 border-b border-white/10 pb-6">
                    <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center font-bold text-xl ${
                      isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-black text-white'
                    }`}>
                      {selectedClienteDossie.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">{selectedClienteDossie.nome}</h2>
                        {selectedClienteDossie.favorito && <Star size={18} className="text-amber-400 fill-amber-400" />}
                      </div>
                      <p className="text-xs opacity-60 mt-0.5">{selectedClienteDossie.email} • {selectedClienteDossie.telefone}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/10">Origem: {selectedClienteDossie.origem}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">LTV: {selectedClienteDossie.totalGastoLtv}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dossier Tabs */}
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 overflow-x-auto">
                    {[
                      { id: 'visao_geral', label: 'Visão Geral', icon: User },
                      { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
                      { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
                      { id: 'mensagens', label: 'Mensagens', icon: MessageSquare },
                      { id: 'anotacoes', label: 'Anotações', icon: FileText },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = dossieTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setDossieTab(tab.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isActive
                              ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Icon size={14} /> {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* TAB CONTENT */}
                  {dossieTab === 'visao_geral' && (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'}`}>
                          <span className="opacity-60 block text-[10px]">CPF</span>
                          <span className="font-semibold">{selectedClienteDossie.cpf}</span>
                        </div>
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'}`}>
                          <span className="opacity-60 block text-[10px]">Data de Nascimento</span>
                          <span className="font-semibold">{selectedClienteDossie.dataNascimento}</span>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'}`}>
                        <span className="opacity-60 block text-[10px]">Endereço</span>
                        <span className="font-semibold">{selectedClienteDossie.endereco}</span>
                      </div>

                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'}`}>
                        <span className="opacity-60 block text-[10px] mb-1">Observações do Cliente</span>
                        <p className="opacity-90 leading-relaxed">{selectedClienteDossie.observacoes}</p>
                      </div>
                    </div>
                  )}

                  {dossieTab === 'agendamentos' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold opacity-70">Histórico de Atendimentos Realizados</h4>
                      <div className="divide-y divide-white/10">
                        {selectedClienteDossie.historicoAgendamentos.map(h => (
                          <div key={h.id} className="py-3 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold">{h.servico}</p>
                              <p className="opacity-60 text-[11px]">{h.data} às {h.horario} • Profissional: {h.profissional}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold block">{h.valor}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{h.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dossieTab === 'financeiro' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold opacity-70">Histórico Financeiro & Cobranças</h4>
                      <div className="divide-y divide-white/10">
                        {selectedClienteDossie.historicoFinanceiro.map(f => (
                          <div key={f.id} className="py-3 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold">{f.descricao}</p>
                              <p className="opacity-60 text-[11px]">{f.data} • Método: {f.metodo}</p>
                            </div>
                            <span className="font-bold text-emerald-400">{f.valor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dossieTab === 'mensagens' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold opacity-70">Histórico de Mensagens Enviadas</h4>
                      <div className="space-y-2">
                        {selectedClienteDossie.historicoMensagens.map(m => (
                          <div key={m.id} className={`p-3 rounded-xl border text-xs ${isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'}`}>
                            <div className="flex items-center justify-between mb-1 text-[10px] opacity-60">
                              <span>{m.canal}</span>
                              <span>{m.data}</span>
                            </div>
                            <p>{m.texto}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dossieTab === 'anotacoes' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold opacity-70">Bloco de Notas Interno</h4>
                      <div className="space-y-2">
                        {selectedClienteDossie.anotacoesInternas.map((nota, i) => (
                          <div key={i} className={`p-3 rounded-xl border text-xs ${isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'}`}>
                            <p>{nota}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
