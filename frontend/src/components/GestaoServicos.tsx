import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Clock,
  Flame,
  X,
  Edit2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface ServicoItem {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  duracaoMin: number;
  comissaoPct: number;
  corHex: string;
  descricao: string;
  observacoesTecnicas: string;
  ativo: boolean;
  maisVendido: boolean;
  totalAgendamentos: number;
}

const SERVICOS_DEMO: ServicoItem[] = [
  {
    id: 's1',
    nome: 'Corte Fade Navalhado',
    categoria: 'Barbearia',
    preco: 50.00,
    duracaoMin: 35,
    comissaoPct: 50,
    corHex: '#3B82F6', // Blue
    descricao: 'Degradê perfeito com acabamento na navalha e finalização com pomada matte.',
    observacoesTecnicas: 'Utilizar lâmina descartável e higienizar couro cabeludo.',
    ativo: true,
    maisVendido: true,
    totalAgendamentos: 142
  },
  {
    id: 's2',
    nome: 'Barba Terapia Completa',
    categoria: 'Barbearia',
    preco: 40.00,
    duracaoMin: 30,
    comissaoPct: 45,
    corHex: '#EAB308', // Yellow
    descricao: 'Modelagem de barba com toalha quente, óleos essenciais e balm hidratante.',
    observacoesTecnicas: 'Toalha aquecida a 45°C. Verificar sensibilidade do cliente.',
    ativo: true,
    maisVendido: false,
    totalAgendamentos: 88
  },
  {
    id: 's3',
    nome: 'Tatuagem Blackwork 10cm',
    categoria: 'Tatuagem',
    preco: 350.00,
    duracaoMin: 120,
    comissaoPct: 60,
    corHex: '#A855F7', // Purple
    descricao: 'Sessão de tatuagem autoral estilo Blackwork de até 10cm com agulhas mágnum.',
    observacoesTecnicas: 'Exige decalque impresso prévio e biossegurança completa.',
    ativo: true,
    maisVendido: true,
    totalAgendamentos: 64
  },
  {
    id: 's4',
    nome: 'Limpeza de Pele Profunda',
    categoria: 'Estética',
    preco: 150.00,
    duracaoMin: 60,
    comissaoPct: 40,
    corHex: '#22C55E', // Green
    descricao: 'Higienização, esfoliação, extração de cravos, máscara calmante e LED terapia.',
    observacoesTecnicas: 'Não aplicar ácido se o cliente for se expor ao sol.',
    ativo: true,
    maisVendido: false,
    totalAgendamentos: 45
  },
  {
    id: 's5',
    nome: 'Coloração & Escova',
    categoria: 'Salão de Beleza',
    preco: 180.00,
    duracaoMin: 90,
    comissaoPct: 45,
    corHex: '#EC4899', // Pink
    descricao: 'Aplicação de tintura profissional com matização e escova modeladora.',
    observacoesTecnicas: 'Teste de mecha obrigatório 24h antes.',
    ativo: true,
    maisVendido: false,
    totalAgendamentos: 39
  }
];

const PRESETS_CORES = [
  '#3B82F6', '#A855F7', '#22C55E', '#EAB308', '#EC4899', '#EF4444', '#6366F1', '#14B8A6'
];

export default function GestaoServicos() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State
  const [servicos, setServicos] = useState<ServicoItem[]>(SERVICOS_DEMO);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas');
  const [sortBy, setSortBy] = useState<'relevancia' | 'preco_desc' | 'preco_asc' | 'duracao'>('relevancia');

  // Modais
  const [isNovoServicoModalOpen, setIsNovoServicoModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<ServicoItem | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Barbearia');
  const [preco, setPreco] = useState('');
  const [duracaoMin, setDuracaoMin] = useState('30');
  const [comissaoPct, setComissaoPct] = useState('50');
  const [corHex, setCorHex] = useState('#3B82F6');
  const [descricao, setDescricao] = useState('');
  const [observacoesTecnicas, setObservacoesTecnicas] = useState('');

  // Toggle Ativo/Inativo
  const handleToggleAtivo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setServicos(servicos.map(s => s.id === id ? { ...s, ativo: !s.ativo } : s));
  };

  // Salvar / Criar Serviço
  const handleSaveServico = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !preco) return;

    if (editingServico) {
      setServicos(servicos.map(s => s.id === editingServico.id ? {
        ...s,
        nome,
        categoria,
        preco: parseFloat(preco),
        duracaoMin: parseInt(duracaoMin, 10),
        comissaoPct: parseFloat(comissaoPct),
        corHex,
        descricao,
        observacoesTecnicas,
      } : s));
      setEditingServico(null);
    } else {
      const novo: ServicoItem = {
        id: `s-${Date.now()}`,
        nome,
        categoria,
        preco: parseFloat(preco),
        duracaoMin: parseInt(duracaoMin, 10) || 30,
        comissaoPct: parseFloat(comissaoPct) || 50,
        corHex: corHex || '#3B82F6',
        descricao: descricao || 'Serviço cadastrado no catálogo.',
        observacoesTecnicas: observacoesTecnicas || '',
        ativo: true,
        maisVendido: false,
        totalAgendamentos: 0
      };
      setServicos([...servicos, novo]);
    }

    setIsNovoServicoModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNome('');
    setCategoria('Barbearia');
    setPreco('');
    setDuracaoMin('30');
    setComissaoPct('50');
    setCorHex('#3B82F6');
    setDescricao('');
    setObservacoesTecnicas('');
    setEditingServico(null);
  };

  const handleOpenEdit = (servico: ServicoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingServico(servico);
    setNome(servico.nome);
    setCategoria(servico.categoria);
    setPreco(servico.preco.toString());
    setDuracaoMin(servico.duracaoMin.toString());
    setComissaoPct(servico.comissaoPct.toString());
    setCorHex(servico.corHex);
    setDescricao(servico.descricao);
    setObservacoesTecnicas(servico.observacoesTecnicas);
    setIsNovoServicoModalOpen(true);
  };

  // Categorias Únicas para o Filtro
  const categoriasLista = ['todas', ...Array.from(new Set(servicos.map(s => s.categoria)))];

  // Filtrar e Ordenar
  const filteredServicos = servicos
    .filter(s => {
      const matchesSearch = s.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.descricao.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (selectedCategoria !== 'todas' && s.categoria !== selectedCategoria) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'preco_desc') return b.preco - a.preco;
      if (sortBy === 'preco_asc') return a.preco - b.preco;
      if (sortBy === 'duracao') return a.duracaoMin - b.duracaoMin;
      return b.totalAgendamentos - a.totalAgendamentos; // Relevância
    });

  // Métricas
  const totalServicos = servicos.length;
  const ativosCount = servicos.filter(s => s.ativo).length;
  const mediaPreco = (servicos.reduce((acc, curr) => acc + curr.preco, 0) / (totalServicos || 1)).toFixed(2);
  const campeaoVendas = servicos.reduce((prev, current) => (prev.totalAgendamentos > current.totalAgendamentos) ? prev : current, servicos[0]);

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <span className="text-xs font-medium opacity-70 block mb-1">Catálogo de Serviços</span>
          <p className="text-2xl font-bold">{totalServicos}</p>
          <span className="text-[11px] opacity-60">{ativosCount} serviços ativos</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <span className="text-xs font-medium opacity-70 block mb-1">Ticket Médio</span>
          <p className="text-2xl font-bold">R$ {mediaPreco}</p>
          <span className="text-[11px] opacity-60">Valor médio por serviço</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium opacity-70">Mais Vendido</span>
            <Flame size={16} className="text-amber-400 fill-amber-400" />
          </div>
          <p className="text-sm font-bold truncate">{campeaoVendas?.nome || 'N/A'}</p>
          <span className="text-[11px] opacity-60">{campeaoVendas?.totalAgendamentos || 0} agendamentos</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <span className="text-xs font-medium opacity-70 block mb-1">Média de Comissão</span>
          <p className="text-2xl font-bold text-emerald-400">50%</p>
          <span className="text-[11px] opacity-60">Repasse aos profissionais</span>
        </div>
      </div>

      {/* Toolbar: Search, Category Filter, Sorting & Add Button */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do serviço ou descrição..."
            className={`w-full h-10 border rounded-xl pl-10 pr-4 text-xs focus:outline-none transition-all ${
              isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white placeholder-[#6e6e73]' : 'bg-neutral-100 border-neutral-300 text-black'
            }`}
          />
        </div>

        {/* Category Pills & Sorting */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Categoria Selector */}
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className={`h-10 border rounded-xl px-3 text-xs focus:outline-none font-medium ${
              isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white' : 'bg-neutral-100 border-neutral-200 text-black'
            }`}
          >
            {categoriasLista.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'todas' ? 'Todas as Categorias' : cat}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`h-10 border rounded-xl px-3 text-xs focus:outline-none font-medium ${
              isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white' : 'bg-neutral-100 border-neutral-200 text-black'
            }`}
          >
            <option value="relevancia">Ordenar: Mais Vendidos</option>
            <option value="preco_desc">Maior Preço</option>
            <option value="preco_asc">Menor Preço</option>
            <option value="duracao">Menor Duração</option>
          </select>

          {/* Add Service Button */}
          <button
            onClick={() => { resetForm(); setIsNovoServicoModalOpen(true); }}
            className={`h-10 px-4 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-[0.98] ${
              isDark ? 'bg-white text-black hover:bg-neutral-200 border-white' : 'bg-black text-white hover:bg-neutral-800 border-black'
            }`}
          >
            <Plus size={16} /> Novo Serviço
          </button>
        </div>

      </div>

      {/* Grid de Cards de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServicos.map((servico) => (
          <div
            key={servico.id}
            className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between shadow-sm ${
              isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200'
            } ${!servico.ativo ? 'opacity-50 grayscale-[40%]' : ''}`}
          >
            <div>
              {/* Header: Categoria, Tag Mais Vendido e Toggle Ativo */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/10 border border-white/10">
                  {servico.categoria}
                </span>

                <div className="flex items-center gap-2">
                  {servico.maisVendido && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Flame size={11} className="fill-amber-400" /> Mais Vendido
                    </span>
                  )}

                  {/* Toggle Ativo Switch */}
                  <button
                    onClick={(e) => handleToggleAtivo(servico.id, e)}
                    title={servico.ativo ? "Desativar Serviço" : "Ativar Serviço"}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors relative ${
                      servico.ativo ? 'bg-emerald-500' : 'bg-neutral-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      servico.ativo ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Color Bar Indicator & Title */}
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm" 
                  style={{ backgroundColor: servico.corHex }}
                />
                <h3 className="text-base font-bold leading-snug">{servico.nome}</h3>
              </div>

              <p className="text-xs opacity-70 line-clamp-2 mb-4">{servico.descricao}</p>
            </div>

            {/* Footer Stats & Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-lg font-bold text-emerald-400">R$ {servico.preco.toFixed(2)}</span>
                <span className="text-[11px] opacity-60 block">
                  <Clock size={11} className="inline mr-1" /> {servico.duracaoMin} min • Comissão: {servico.comissaoPct}%
                </span>
              </div>

              <button
                onClick={(e) => handleOpenEdit(servico, e)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isDark ? 'bg-[#1c1c20] border-white/[0.06] text-neutral-300 hover:text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-black'
                }`}
                title="Editar Parâmetros do Serviço"
              >
                <Edit2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL: NOVO / EDITAR SERVIÇO --- */}
      <AnimatePresence>
        {isNovoServicoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl max-h-[90vh] flex flex-col">
                <div className={`rounded-[27px] p-6 sm:p-8 relative overflow-y-auto ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => { setIsNovoServicoModalOpen(false); resetForm(); }} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>

                  <h3 className="text-xl font-bold mb-1">
                    {editingServico ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
                  </h3>
                  <p className="text-xs opacity-60 mb-6">Configure preço, duração, comissão e cor de identificação visual.</p>

                  <form onSubmit={handleSaveServico} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Nome do Serviço *</label>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Corte Fade Navalhado, Tatuagem Realista 10cm"
                        className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Categoria *</label>
                        <select
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value)}
                          className={`w-full h-11 border rounded-2xl px-3 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        >
                          <option value="Barbearia">Barbearia</option>
                          <option value="Estúdio Tatuagem">Estúdio Tatuagem</option>
                          <option value="Salão de Beleza">Salão de Beleza</option>
                          <option value="Estética">Estética & Cuidados</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Preço (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={preco}
                          onChange={(e) => setPreco(e.target.value)}
                          placeholder="80.00"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Duração (Minutos) *</label>
                        <input
                          type="number"
                          value={duracaoMin}
                          onChange={(e) => setDuracaoMin(e.target.value)}
                          placeholder="30"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Comissão Profissional (%)</label>
                        <input
                          type="number"
                          value={comissaoPct}
                          onChange={(e) => setComissaoPct(e.target.value)}
                          placeholder="50"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Selector de Cores Presets */}
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-2">Cor de Identificação na Agenda</label>
                      <div className="flex items-center gap-2.5">
                        {PRESETS_CORES.map(cor => (
                          <button
                            type="button"
                            key={cor}
                            onClick={() => setCorHex(cor)}
                            className={`w-7 h-7 rounded-full transition-transform ${
                              corHex === cor ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: cor }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Descrição para o Cliente</label>
                      <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Explicativo curto exibido na página de agendamento."
                        rows={2}
                        className={`w-full border rounded-2xl p-3 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Observações Técnicas Internas</label>
                      <textarea
                        value={observacoesTecnicas}
                        onChange={(e) => setObservacoesTecnicas(e.target.value)}
                        placeholder="Instruções para o profissional (ex: higienização, toalha aquecida)."
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
                      {editingServico ? 'Salvar Alterações' : 'Cadastrar Serviço'}
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
