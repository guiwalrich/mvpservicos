import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Clock,
  DollarSign,
  Percent,
  TrendingUp,
  UserCheck,
  X,
  Edit2,
  Palmtree,
  MessageSquare,
  Upload,
  Camera,
  Trash2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface ProfissionalCompleto {
  id: string;
  nome: string;
  avatar: string;
  fotoUrl?: string;
  especialidade: string;
  telefone: string;
  whatsapp: string;
  email: string;
  cpf: string;
  comissaoPct: number;
  horarioEntrada: string;
  horarioSaida: string;
  intervaloAlmoco: string;
  diasTrabalho: string[]; // ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  emFerias: boolean;
  feriasInicio?: string;
  feriasFim?: string;
  ativo: boolean;
  faturamentoMes: string;
  comissaoMes: string;
  totalAtendimentos: number;
}

const PROFISSIONAIS_DEMO: ProfissionalCompleto[] = [
  {
    id: 'p1',
    nome: 'Carlos Silva',
    avatar: 'CS',
    fotoUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=150&auto=format&fit=crop&q=80',
    especialidade: 'Barbeiro Specialist & Visagismo',
    telefone: '(11) 98765-4321',
    whatsapp: '11987654321',
    email: 'carlos.barber@agende.yo',
    cpf: '123.456.789-10',
    comissaoPct: 50,
    horarioEntrada: '09:00',
    horarioSaida: '19:00',
    intervaloAlmoco: '12:00 às 13:00',
    diasTrabalho: ['Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    emFerias: false,
    ativo: true,
    faturamentoMes: 'R$ 7.840,00',
    comissaoMes: 'R$ 3.920,00',
    totalAtendimentos: 98
  },
  {
    id: 'p2',
    nome: 'Ana Souza',
    avatar: 'AS',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    especialidade: 'Esteticista & Design Facial',
    telefone: '(11) 97654-3210',
    whatsapp: '11976543210',
    email: 'ana.estetica@agende.yo',
    cpf: '987.654.321-20',
    comissaoPct: 45,
    horarioEntrada: '08:00',
    horarioSaida: '17:00',
    intervaloAlmoco: '12:00 às 13:00',
    diasTrabalho: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    emFerias: false,
    ativo: true,
    faturamentoMes: 'R$ 6.450,00',
    comissaoMes: 'R$ 2.902,50',
    totalAtendimentos: 43
  },
  {
    id: 'p3',
    nome: 'Juliana Lima',
    avatar: 'JL',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    especialidade: 'Tatuadora Blackwork & Autoral',
    telefone: '(11) 96543-2109',
    whatsapp: '11965432109',
    email: 'juliana.tattoo@agende.yo',
    cpf: '456.789.123-30',
    comissaoPct: 60,
    horarioEntrada: '10:00',
    horarioSaida: '20:00',
    intervaloAlmoco: '14:00 às 15:00',
    diasTrabalho: ['Qua', 'Qui', 'Sex', 'Sáb'],
    emFerias: true,
    feriasInicio: '01/08/2026',
    feriasFim: '15/08/2026',
    ativo: true,
    faturamentoMes: 'R$ 11.200,00',
    comissaoMes: 'R$ 6.720,00',
    totalAtendimentos: 32
  }
];

const DIAS_SEMANA_OPCOES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function GestaoProfissionais() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State
  const [profissionais, setProfissionais] = useState<ProfissionalCompleto[]>(PROFISSIONAIS_DEMO);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'ativos' | 'ferias'>('todos');

  // Modais
  const [isNovoProfModalOpen, setIsNovoProfModalOpen] = useState(false);
  const [isFeriasModalOpen, setIsFeriasModalOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState<ProfissionalCompleto | null>(null);

  // Form State Novo/Editar Profissional
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaAcesso, setSenhaAcesso] = useState('');
  const [comissaoPct, setComissaoPct] = useState('50');
  const [entrada, setEntrada] = useState('09:00');
  const [saida, setSaida] = useState('19:00');
  const [almoco, setAlmoco] = useState('12:00 às 13:00');
  const [fotoUrl, setFotoUrl] = useState('');
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>(['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']);

  // Form State Férias
  const [feriasInicioInput, setFeriasInicioInput] = useState('');
  const [feriasFimInput, setFeriasFimInput] = useState('');

  // Upload de arquivo de imagem do dispositivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle Dia da Semana
  const toggleDiaSemana = (dia: string) => {
    if (diasSelecionados.includes(dia)) {
      setDiasSelecionados(diasSelecionados.filter(d => d !== dia));
    } else {
      setDiasSelecionados([...diasSelecionados, dia]);
    }
  };

  // Salvar Profissional
  const handleSaveProfissional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !especialidade) return;

    const iniciais = nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    if (selectedProf) {
      // Editar
      setProfissionais(profissionais.map(p => p.id === selectedProf.id ? {
        ...p,
        nome,
        avatar: iniciais,
        fotoUrl: fotoUrl || undefined,
        especialidade,
        telefone,
        whatsapp: telefone.replace(/\D/g, ''),
        email,
        cpf,
        comissaoPct: parseFloat(comissaoPct) || 50,
        horarioEntrada: entrada,
        horarioSaida: saida,
        intervaloAlmoco: almoco,
        diasTrabalho: diasSelecionados
      } : p));
      setSelectedProf(null);
    } else {
      // Criar Novo
      const novo: ProfissionalCompleto = {
        id: `p-${Date.now()}`,
        nome,
        avatar: iniciais || 'PR',
        fotoUrl: fotoUrl || undefined,
        especialidade,
        telefone,
        whatsapp: telefone.replace(/\D/g, ''),
        email: email || `${nome.toLowerCase().replace(/\s+/g, '.')}@agende.yo`,
        cpf: cpf || '000.000.000-00',
        comissaoPct: parseFloat(comissaoPct) || 50,
        horarioEntrada: entrada || '09:00',
        horarioSaida: saida || '18:00',
        intervaloAlmoco: almoco || '12:00 às 13:00',
        diasTrabalho: diasSelecionados,
        emFerias: false,
        ativo: true,
        faturamentoMes: 'R$ 0,00',
        comissaoMes: 'R$ 0,00',
        totalAtendimentos: 0
      };
      setProfissionais([...profissionais, novo]);
    }

    setIsNovoProfModalOpen(false);
    resetForm();
  };

  // Programar Férias
  const handleSaveFerias = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProf) return;

    setProfissionais(profissionais.map(p => p.id === selectedProf.id ? {
      ...p,
      emFerias: true,
      feriasInicio: feriasInicioInput,
      feriasFim: feriasFimInput
    } : p));

    setIsFeriasModalOpen(false);
    setSelectedProf(null);
  };

  const handleOpenEdit = (prof: ProfissionalCompleto) => {
    setSelectedProf(prof);
    setNome(prof.nome);
    setFotoUrl(prof.fotoUrl || '');
    setEspecialidade(prof.especialidade);
    setTelefone(prof.telefone);
    setEmail(prof.email);
    setCpf(prof.cpf);
    setComissaoPct(prof.comissaoPct.toString());
    setEntrada(prof.horarioEntrada);
    setSaida(prof.horarioSaida);
    setAlmoco(prof.intervaloAlmoco);
    setDiasSelecionados(prof.diasTrabalho);
    setIsNovoProfModalOpen(true);
  };

  const resetForm = () => {
    setNome('');
    setFotoUrl('');
    setEspecialidade('');
    setTelefone('');
    setEmail('');
    setCpf('');
    setComissaoPct('50');
    setEntrada('09:00');
    setSaida('19:00');
    setAlmoco('12:00 às 13:00');
    setDiasSelecionados(['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']);
    setSelectedProf(null);
  };

  // Filtragem dos Profissionais
  const filteredProfissionais = profissionais.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.especialidade.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'ativos' && (!p.ativo || p.emFerias)) return false;
    if (activeFilter === 'ferias' && !p.emFerias) return false;

    return true;
  });

  // Métricas Globais da Equipe
  const totalEquipe = profissionais.length;
  const emFeriasCount = profissionais.filter(p => p.emFerias).length;

  return (
    <div className="space-y-6">
      
      {/* Cards de Métricas da Equipe (Espaçados & Limpos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Tamanho da Equipe</span>
            <UserCheck size={18} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold">{totalEquipe}</p>
          <span className="text-xs opacity-60 mt-1 block">Profissionais cadastrados</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Faturamento Equipe (Mês)</span>
            <TrendingUp size={18} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-400">R$ 25.490,00</p>
          <span className="text-xs opacity-60 mt-1 block">Receita total gerada</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Comissões A Pagar</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400">R$ 13.542,50</p>
          <span className="text-xs opacity-60 mt-1 block">Repasse acumulado</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Em Férias / Folga</span>
            <Palmtree size={18} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-400">{emFeriasCount}</p>
          <span className="text-xs opacity-60 mt-1 block">Escala de ausência</span>
        </div>
      </div>

      {/* Toolbar: Busca Inteligente, Filtros e Botão Novo Profissional */}
      <div className={`p-4 rounded-[24px] border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome do profissional ou especialidade..."
            className={`w-full h-11 border rounded-2xl pl-11 pr-4 text-xs focus:outline-none transition-all ${
              isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white placeholder-[#6e6e73]' : 'bg-neutral-100 border-neutral-300 text-black'
            }`}
          />
        </div>

        {/* Filter Pills & Action */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center border rounded-2xl p-1 ${
            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-200'
          }`}>
            <button
              onClick={() => setActiveFilter('todos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'todos'
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Todos ({profissionais.length})
            </button>

            <button
              onClick={() => setActiveFilter('ativos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'ativos'
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Em Atendimento
            </button>

            <button
              onClick={() => setActiveFilter('ferias')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'ferias'
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Palmtree size={13} className="text-amber-400" /> Em Férias ({emFeriasCount})
            </button>
          </div>

          <button
            onClick={() => { resetForm(); setIsNovoProfModalOpen(true); }}
            className={`h-11 px-5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-[0.98] ${
              isDark ? 'bg-white text-black hover:bg-neutral-200 border-white' : 'bg-black text-white hover:bg-neutral-800 border-black'
            }`}
          >
            <Plus size={16} /> Cadastrar Profissional
          </button>
        </div>

      </div>

      {/* Grid de Cards de Profissionais (Espaçamento Respirável) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfissionais.map((prof) => (
          <div
            key={prof.id}
            className={`p-6 rounded-[24px] border transition-all flex flex-col justify-between shadow-sm relative ${
              isDark ? 'bg-[#121215]/90 border-white/10 hover:border-white/20' : 'bg-white border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div>
              {/* Header: Avatar, Status Férias & Menu */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-extrabold text-base overflow-hidden shrink-0 ${
                    isDark ? 'bg-[#1c1c20] border-white/10 text-white' : 'bg-black text-white'
                  }`}>
                    {prof.fotoUrl ? (
                      <img src={prof.fotoUrl} alt={prof.nome} className="w-full h-full object-cover" />
                    ) : (
                      prof.avatar
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold leading-snug">{prof.nome}</h3>
                    <p className="text-xs font-medium text-emerald-400 mt-0.5">{prof.especialidade}</p>
                  </div>
                </div>

                {prof.emFerias ? (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Palmtree size={12} /> Férias
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                    Ativo
                  </span>
                )}
              </div>

              {/* Informações da Jornada & Contato */}
              <div className="space-y-2 mb-5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                  <span className="opacity-60 flex items-center gap-1.5">
                    <Clock size={13} /> Horário de Trabalho:
                  </span>
                  <span className="font-semibold">{prof.horarioEntrada} às {prof.horarioSaida}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                  <span className="opacity-60 flex items-center gap-1.5">
                    <Percent size={13} /> Comissão Repassada:
                  </span>
                  <span className="font-bold text-emerald-400">{prof.comissaoPct}% por serviço</span>
                </div>

                {/* Dias Ativos na Semana */}
                <div className="pt-2">
                  <span className="text-[10px] font-medium opacity-60 block mb-1.5">Dias de Atendimento na Semana:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {DIAS_SEMANA_OPCOES.map(dia => {
                      const isAtivo = prof.diasTrabalho.includes(dia);
                      return (
                        <span
                          key={dia}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            isAtivo 
                              ? (isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-black/10 border-black/20 text-black')
                              : 'opacity-30 border-transparent'
                          }`}
                        >
                          {dia}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Box de Desempenho Financeiro (LTV & Comissão do Mês) */}
              <div className={`p-4 rounded-2xl border mb-5 ${
                isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-50 border-neutral-200'
              }`}>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="opacity-60 text-[10px] block">Faturamento Gerado</span>
                    <span className="font-bold text-sm text-blue-400">{prof.faturamentoMes}</span>
                  </div>
                  <div>
                    <span className="opacity-60 text-[10px] block">Comissão a Pagar</span>
                    <span className="font-bold text-sm text-emerald-400">{prof.comissaoMes}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
              <a
                href={`https://wa.me/55${prof.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs ${
                  isDark ? 'bg-[#1c1c20] border-white/[0.06] text-emerald-400 hover:bg-emerald-500/10' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <MessageSquare size={14} /> WhatsApp
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelectedProf(prof); setIsFeriasModalOpen(true); }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                  title="Agendar Férias / Folga"
                >
                  <Palmtree size={14} />
                </button>

                <button
                  onClick={() => handleOpenEdit(prof)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isDark ? 'bg-[#1c1c20] border-white/[0.06] text-neutral-300 hover:text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-black'
                  }`}
                  title="Editar Perfil do Profissional"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL: CADASTRAR / EDITAR PROFISSIONAL --- */}
      <AnimatePresence>
        {isNovoProfModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl max-h-[90vh] flex flex-col">
                <div className={`rounded-[27px] p-6 sm:p-8 relative overflow-y-auto ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => { setIsNovoProfModalOpen(false); resetForm(); }} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>

                  <h3 className="text-xl font-bold mb-1">
                    {selectedProf ? 'Editar Profissional' : 'Cadastrar Novo Profissional'}
                  </h3>
                  <p className="text-xs opacity-60 mb-6">Configure os horários de trabalho, comissão % e dias da semana ativos.</p>

                  <form onSubmit={handleSaveProfissional} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Carlos Silva, Juliana Lima"
                        className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1.5">Foto do Perfil / Avatar (Upload do Dispositivo)</label>

                      <div className="flex items-center gap-4">
                        {/* Preview Avatar Box */}
                        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 ${
                          isDark ? 'bg-[#1c1c20] border-white/10 text-white' : 'bg-neutral-100 border-neutral-300 text-black'
                        }`}>
                          {fotoUrl ? (
                            <img src={fotoUrl} alt="Preview do Profissional" className="w-full h-full object-cover" />
                          ) : (
                            <Camera size={24} className="opacity-40" />
                          )}
                        </div>

                        {/* Upload Button Controls */}
                        <div className="flex-1 space-y-2">
                          <label className={`h-11 px-4 border rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm ${
                            isDark ? 'bg-[#1c1c20] border-white/10 text-white hover:bg-white/10' : 'bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200'
                          }`}>
                            <Upload size={15} />
                            <span>Carregar Foto do Celular / PC...</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>

                          {fotoUrl && (
                            <button
                              type="button"
                              onClick={() => setFotoUrl('')}
                              className="text-[11px] text-red-400 font-semibold hover:underline flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Remover Foto Selecionada
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Presets de Foto de Exemplo */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] opacity-60">Ou selecione um modelo pronto:</span>
                        <button
                          type="button"
                          onClick={() => setFotoUrl('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=150&auto=format&fit=crop&q=80')}
                          className="px-2 py-0.5 rounded text-[10px] bg-white/10 hover:bg-white/20 font-medium"
                        >
                          Modelo Barbeiro
                        </button>
                        <button
                          type="button"
                          onClick={() => setFotoUrl('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80')}
                          className="px-2 py-0.5 rounded text-[10px] bg-white/10 hover:bg-white/20 font-medium"
                        >
                          Modelo Esteticista
                        </button>
                        <button
                          type="button"
                          onClick={() => setFotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')}
                          className="px-2 py-0.5 rounded text-[10px] bg-white/10 hover:bg-white/20 font-medium"
                        >
                          Modelo Tatuadora
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Especialidade / Cargo *</label>
                      <input
                        type="text"
                        value={especialidade}
                        onChange={(e) => setEspecialidade(e.target.value)}
                        placeholder="Ex: Barbeiro Lead, Tatuadora Blackwork, Colorista"
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
                          placeholder="(11) 98765-4321"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Comissão (%)</label>
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

                    {/* DADOS DE CREDENCIAIS DE LOGIN DO FUNCIONÁRIO (RBAC) */}
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'
                    }`}>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                        Credenciais para o Funcionário Fazer Login no Sistema
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold opacity-70 mb-1">E-mail de Login *</label>
                          <input
                            type="email"
                            value={emailLogin}
                            onChange={(e) => setEmailLogin(e.target.value)}
                            placeholder="carlos@email.com"
                            className={`w-full h-10 border rounded-xl px-3 text-xs focus:outline-none ${
                              isDark ? 'bg-[#121215] border-white/10' : 'bg-white border-neutral-300'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold opacity-70 mb-1">Senha Inicial de Acesso *</label>
                          <input
                            type="password"
                            value={senhaAcesso}
                            onChange={(e) => setSenhaAcesso(e.target.value)}
                            placeholder="Senha (ex: 123456)"
                            className={`w-full h-10 border rounded-xl px-3 text-xs focus:outline-none ${
                              isDark ? 'bg-[#121215] border-white/10' : 'bg-white border-neutral-300'
                            }`}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] opacity-60">Com essas credenciais, o profissional entra no sistema (/login) para gerenciar sua agenda.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Horário Entrada</label>
                        <input
                          type="text"
                          value={entrada}
                          onChange={(e) => setEntrada(e.target.value)}
                          placeholder="09:00"
                          className={`w-full h-11 border rounded-2xl px-3 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Horário Saída</label>
                        <input
                          type="text"
                          value={saida}
                          onChange={(e) => setSaida(e.target.value)}
                          placeholder="19:00"
                          className={`w-full h-11 border rounded-2xl px-3 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Almoço</label>
                        <input
                          type="text"
                          value={almoco}
                          onChange={(e) => setAlmoco(e.target.value)}
                          placeholder="12h - 13h"
                          className={`w-full h-11 border rounded-2xl px-3 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Checkboxes dos Dias da Semana */}
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-2">Dias de Atendimento na Semana</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {DIAS_SEMANA_OPCOES.map(dia => {
                          const isChecked = diasSelecionados.includes(dia);
                          return (
                            <button
                              type="button"
                              key={dia}
                              onClick={() => toggleDiaSemana(dia)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                isChecked
                                  ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                                  : 'opacity-40 border-white/10 hover:opacity-100'
                              }`}
                            >
                              {dia}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full font-semibold text-xs h-11 rounded-2xl transition-all mt-2 shadow-md ${
                        isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                      }`}
                    >
                      {selectedProf ? 'Salvar Perfil do Profissional' : 'Cadastrar Profissional na Equipe'}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: AGENDAR FÉRIAS / FOLGA --- */}
      <AnimatePresence>
        {isFeriasModalOpen && selectedProf && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl">
                <div className={`rounded-[27px] p-6 sm:p-8 relative ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => setIsFeriasModalOpen(false)} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>

                  <div className="flex items-center gap-2 mb-1">
                    <Palmtree className="text-amber-400" size={20} />
                    <h3 className="text-lg font-bold">Programar Férias ou Folga</h3>
                  </div>
                  <p className="text-xs opacity-60 mb-5">
                    Profissional: <strong className="text-current">{selectedProf.nome}</strong>
                  </p>

                  <form onSubmit={handleSaveFerias} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Data de Início</label>
                        <input
                          type="text"
                          placeholder="DD/MM/AAAA"
                          value={feriasInicioInput}
                          onChange={(e) => setFeriasInicioInput(e.target.value)}
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Data de Término</label>
                        <input
                          type="text"
                          placeholder="DD/MM/AAAA"
                          value={feriasFimInput}
                          onChange={(e) => setFeriasFimInput(e.target.value)}
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full font-semibold text-xs h-11 rounded-2xl transition-all mt-2 shadow-md ${
                        isDark ? 'bg-amber-400 text-black hover:bg-amber-300' : 'bg-black text-white'
                      }`}
                    >
                      Confirmar Período de Ausência
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
