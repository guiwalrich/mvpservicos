import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Check,
  Clock,
  ShieldCheck,
  Navigation,
  User,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Logo = ({ className = "w-7 h-7" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className={className}>
    <path d="M 60 90 C 60 70, 90 70, 90 90 L 90 130 C 90 150, 120 150, 130 130 L 140 110" 
          fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="90" cy="90" r="13" fill="currentColor"/>
    <circle cx="140" cy="56" r="10" fill="currentColor"/>
  </svg>
);

export interface ServicoPublico {
  id: string;
  nome: string;
  preco: number;
  duracaoMin: number;
  categoria: string;
  descricao: string;
  popular?: boolean;
}

export interface ProfissionalPublico {
  id: string;
  nome: string;
  especialidade: string;
  fotoUrl: string;
  avaliacao?: number;
}

const FALLBACK_PROF: ProfissionalPublico = {
  id: 'p0',
  nome: 'Primeiro Profissional Disponível',
  especialidade: 'Atendimento imediato',
  fotoUrl: '',
  avaliacao: 5.0
};

const DIAS_CALENDARIO = [
  { diaSemana: 'SEG', diaNum: '03', dataFull: '03/08/2026' },
  { diaSemana: 'TER', diaNum: '04', dataFull: '04/08/2026' },
  { diaSemana: 'QUA', diaNum: '05', dataFull: '05/08/2026' },
  { diaSemana: 'QUI', diaNum: '06', dataFull: '06/08/2026' },
  { diaSemana: 'SEX', diaNum: '07', dataFull: '07/08/2026' },
  { diaSemana: 'SÁB', diaNum: '08', dataFull: '08/08/2026' },
  { diaSemana: 'DOM', diaNum: '09', dataFull: '09/08/2026' }
];

const HORARIOS_SLOTS = [
  '09:00', '09:30', '10:00',
  '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30'
];

export default function AgendamentoPublico() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { slug } = useParams<{ slug: string }>();

  // Dados da empresa carregados do backend
  const [empresaNome, setEmpresaNome] = useState('Carregando...');
  const [empresaIconUrl, setEmpresaIconUrl] = useState('');
  const [empresaEndereco, setEmpresaEndereco] = useState('');
  const [, setEmpresaTelefone] = useState('');
  const [servicos, setServicos] = useState<ServicoPublico[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalPublico[]>([FALLBACK_PROF]);
  const [, setCarregando] = useState(true);

  useEffect(() => {
    if (!slug) return;

    // Prefill imediato do localStorage se a empresa corresponder ao slug
    const empLocal = JSON.parse(localStorage.getItem('empresa') || '{}');
    const userAccountKey = empLocal.email ? empLocal.email.replace(/[^a-zA-Z0-9]/g, '_') : 'default_account';
    
    if (empLocal.slug === slug || slug === 'meu-estabelecimento' || slug === 'studio-demo' || slug === empLocal.nome?.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      if (empLocal.nome) setEmpresaNome(empLocal.nome);
      if (empLocal.iconUrl) setEmpresaIconUrl(empLocal.iconUrl);
      if (empLocal.endereco) setEmpresaEndereco(empLocal.endereco);
      if (empLocal.telefone || empLocal.whatsapp) setEmpresaTelefone(empLocal.telefone || empLocal.whatsapp);

      const servsLocais = JSON.parse(localStorage.getItem(`servicos_${userAccountKey}`) || '[]');
      if (servsLocais.length > 0) {
        setServicos(servsLocais.map((s: any) => ({
          id: String(s.id),
          nome: s.name || s.nome,
          preco: typeof s.price === 'number' ? s.price : parseFloat(String(s.price || 0).replace(/[^0-9,.-]/g, '').replace(',', '.')) || 0,
          duracaoMin: s.durationMin || 30,
          categoria: s.category || 'Geral',
          descricao: s.description || '',
          popular: false,
        })));
      }

      const profsLocais = JSON.parse(localStorage.getItem(`profissionais_${userAccountKey}`) || '[]');
      if (profsLocais.length > 0) {
        setProfissionais([FALLBACK_PROF, ...profsLocais.map((p: any) => ({
          id: String(p.id),
          nome: p.nome,
          especialidade: p.especialidade || 'Profissional',
          fotoUrl: p.fotoUrl || '',
          avaliacao: 5.0,
        }))]);
      }
    }

    fetch(`/agendar-api/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.id) {
          if (data.nome) setEmpresaNome(data.nome);
          if (data.iconUrl || data.logo) setEmpresaIconUrl(data.iconUrl || data.logo);
          if (data.endereco) setEmpresaEndereco(data.endereco);
          if (data.telefone) setEmpresaTelefone(data.telefone);
          if (data.servicos && data.servicos.length > 0) {
            setServicos(data.servicos.map((s: any) => ({
              id: String(s.id),
              nome: s.nome,
              preco: s.preco,
              duracaoMin: s.duracao_minutos || 30,
              categoria: s.categoria || 'Geral',
              descricao: s.descricao || '',
              popular: false,
            })));
          }
          if (data.profissionais && data.profissionais.length > 0) {
            const profs: ProfissionalPublico[] = [FALLBACK_PROF, ...data.profissionais.map((p: any) => ({
              id: String(p.id),
              nome: p.nome,
              especialidade: p.especialidade || 'Profissional',
              fotoUrl: p.foto_url || '',
              avaliacao: 5.0,
            }))];
            setProfissionais(profs);
          }
        }
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [slug]);

  // Step 1: Serviço, Step 2: Profissional, Step 3: Data & Horário, Step 4: Dados Cliente, Step 5: Confirmação
  const [step, setStep] = useState<number>(1);

  // Selection States
  const [selectedServico, setSelectedServico] = useState<ServicoPublico | null>(null);
  const [selectedProfissional, setSelectedProfissional] = useState<ProfissionalPublico>(FALLBACK_PROF);
  const [selectedDataObj, setSelectedDataObj] = useState(DIAS_CALENDARIO[0]);
  const [selectedHorario, setSelectedHorario] = useState<string>('');

  // Customer Form
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');

  // Confirmation
  const [codigoConfirmacao, setCodigoConfirmacao] = useState('');

  const handleSelectServico = (servico: ServicoPublico) => {
    setSelectedServico(servico);
    setStep(2);
  };

  const handleSelectProfissional = (prof: ProfissionalPublico) => {
    setSelectedProfissional(prof);
    setStep(3);
  };

  const handleSelectHorario = (horario: string) => {
    setSelectedHorario(horario);
    setStep(4);
  };

  const handleFinalizarAgendamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNome || !clienteTelefone || !selectedServico || !selectedHorario) return;

    const codigo = `AGD-${Math.floor(1000 + Math.random() * 9000)}`;
    setCodigoConfirmacao(codigo);

    const novoAgendamentoInterno = {
      id: `app-pub-${Date.now()}`,
      cliente: clienteNome,
      telefone: clienteTelefone,
      servico: selectedServico.nome,
      valor: `R$ ${selectedServico.preco.toFixed(2)}`,
      data: selectedDataObj.dataFull,
      horario: selectedHorario,
      duracaoMin: selectedServico.duracaoMin,
      profissionalId: selectedProfissional.id === 'p0' ? 'p1' : selectedProfissional.id,
      profissionalNome: selectedProfissional.id === 'p0' ? (profissionais[1]?.nome || 'Profissional') : selectedProfissional.nome,
      sala: 'Cadeira 01',
      status: 'Pendente'
    };

    const existentes = JSON.parse(localStorage.getItem('novos_agendamentos_publicos') || '[]');
    localStorage.setItem('novos_agendamentos_publicos', JSON.stringify([novoAgendamentoInterno, ...existentes]));

    setStep(5);
  };

  const enderecoTexto = empresaEndereco || 'Endereço não cadastrado';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoTexto)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(enderecoTexto)}`;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 selection:bg-white selection:text-black ${
      isDark ? 'bg-[#0c0c0e] text-white' : 'bg-neutral-50 text-black'
    }`}>

      {/* --- HEADER SUPERIOR (Design System Oficial Agende.yo) --- */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-xl ${
        isDark ? 'bg-[#0c0c0e]/80 border-white/10' : 'bg-white/80 border-neutral-200 shadow-sm'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Marca */}
          <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <Logo className="w-7 h-7" />
            <span className="text-lg font-bold">Agende.yo</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/10 border border-white/10 opacity-70">
              Agendamento Online
            </span>
          </Link>

          {/* Ações do Topo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                isDark ? 'bg-[#1c1c20] border-white/10 text-white hover:bg-white/10' : 'bg-neutral-100 border-neutral-200 text-black hover:bg-neutral-200'
              }`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link
              to="/login"
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isDark ? 'bg-white text-black hover:bg-neutral-200 border-white' : 'bg-black text-white hover:bg-neutral-800 border-black'
              }`}
            >
              Painel Admin
            </Link>
          </div>

        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL CENTRALIZADO --- */}
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-20">

        {/* --- CARD DA EMPRESA & LOCALIZAÇÃO --- */}
        {step < 5 && (
          <div className={`p-4 sm:p-8 rounded-[24px] sm:rounded-[28px] border relative overflow-hidden space-y-4 sm:space-y-5 ${
            isDark ? 'bg-[#121215]/90 border-white/10 shadow-2xl' : 'bg-white border-neutral-200 shadow-md'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-black border border-white/20 flex items-center justify-center font-black text-white text-lg shadow-md shrink-0 overflow-hidden">
                  {empresaIconUrl ? (
                    <img src={empresaIconUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (empresaNome || 'AY').substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight leading-snug flex items-center gap-2">
                    {empresaNome}
                    <ShieldCheck size={18} className="text-emerald-400" />
                  </h1>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Aberto Agora • Seg a Sáb 09h às 19h
                  </span>
                </div>
              </div>
            </div>

            {/* Endereço & Botões de Rota Rápida em 1 Toque */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'
            }`}>
              <div className="flex items-start gap-2.5">
                <MapPin size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-60 block">Endereço Unidade Principal</span>
                  <p className="text-xs font-semibold opacity-90 mt-0.5">{enderecoTexto}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-2 transition-all ${
                    isDark ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-neutral-200 border-neutral-300 text-black hover:bg-neutral-300'
                  }`}
                >
                  <Navigation size={14} className="text-emerald-400" /> Google Maps
                </a>

                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-2 transition-all ${
                    isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <ExternalLink size={14} /> NAVEGAR NO WAZE
                </a>
              </div>
            </div>
          </div>
        )}

        {/* --- STEPPER VISUAL (4 PASSOS DA FASE 10) --- */}
        {step < 5 && (
          <div className="space-y-2 px-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="opacity-70">Passo {step} de 4</span>
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="opacity-70 hover:opacity-100 flex items-center gap-1">
                  <ChevronLeft size={14} /> Voltar Passo
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s <= step
                      ? (isDark ? 'bg-white shadow-sm' : 'bg-black shadow-sm')
                      : (isDark ? 'bg-white/10' : 'bg-neutral-200')
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* --- PASSO 1: SELECIONAR SERVIÇO --- */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">1. Selecione o Serviço Desejado</h2>
              <p className="text-xs opacity-60 mt-0.5">Escolha uma opção para visualizar os profissionais e horários disponíveis.</p>
            </div>

            <div className="space-y-3">
              {servicos.map((servico) => (
                <div
                  key={servico.id}
                  onClick={() => handleSelectServico(servico)}
                  className={`p-5 rounded-[24px] border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-4 shadow-sm ${
                    isDark ? 'bg-[#121215]/90 border-white/10 hover:border-white/30' : 'bg-white border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                      <Clock size={12} /> {servico.categoria} • {servico.duracaoMin} min
                    </span>
                    <h3 className="text-sm font-bold">{servico.nome}</h3>
                    <p className="text-xs opacity-60 line-clamp-2">{servico.descricao}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-extrabold text-emerald-400 block">
                      R$ {servico.preco.toFixed(2)}
                    </span>
                    <button className={`mt-2 px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                      isDark ? 'bg-white text-black' : 'bg-black text-white'
                    }`}>
                      Escolher
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- PASSO 2: SELECIONAR PROFISSIONAL --- */}
        {step === 2 && selectedServico && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 block">Serviço: {selectedServico.nome}</span>
              <h2 className="text-xl font-bold tracking-tight mt-0.5">2. Escolha o Profissional</h2>
            </div>

            <div className="space-y-3">
              {profissionais.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => handleSelectProfissional(prof)}
                  className={`p-4 sm:p-5 rounded-[24px] border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-4 ${
                    isDark ? 'bg-[#121215]/90 border-white/10 hover:border-white/30' : 'bg-white border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 ${
                      isDark ? 'bg-[#1c1c20] border-white/10 text-white' : 'bg-black text-white'
                    }`}>
                      {prof.fotoUrl ? (
                        <img src={prof.fotoUrl} alt={prof.nome} className="w-full h-full object-cover" />
                      ) : (
                        <User size={22} className="opacity-60" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{prof.nome}</h3>
                      <p className="text-xs opacity-60">{prof.especialidade}</p>
                    </div>
                  </div>

                  <ChevronRight size={18} className="opacity-40" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- PASSO 3: SELECIONAR DATA E HORÁRIO (Visual Alinhado com a Grade) --- */}
        {step === 3 && selectedServico && selectedProfissional && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <span className="text-xs font-bold text-emerald-400 block">
                {selectedServico.nome} • {selectedProfissional.nome}
              </span>
              <h2 className="text-xl font-bold tracking-tight mt-0.5">3. Escolha a Data e o Horário</h2>
            </div>

            {/* Calendário em Tira de Dias */}
            <div className={`p-4 rounded-[24px] border space-y-3 ${
              isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
            }`}>
              <span className="text-xs font-semibold opacity-70 block">Selecione o Dia</span>
              <div className="grid grid-cols-7 gap-1 text-center">
                {DIAS_CALENDARIO.map((d) => {
                  const isSelected = selectedDataObj.dataFull === d.dataFull;
                  return (
                    <div
                      key={d.dataFull}
                      onClick={() => setSelectedDataObj(d)}
                      className="cursor-pointer space-y-1 py-1"
                    >
                      <span className="text-[10px] font-extrabold opacity-60 block tracking-wider">
                        {d.diaSemana}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold transition-all ${
                        isSelected
                          ? (isDark ? 'bg-white text-black shadow-md font-black' : 'bg-black text-white shadow-md font-black')
                          : 'hover:bg-white/10 opacity-70'
                      }`}>
                        {d.diaNum}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grade de Horários Livres (3 Colunas) */}
            <div className={`p-5 rounded-[24px] border space-y-3 ${
              isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
            }`}>
              <span className="text-xs font-semibold opacity-70 block">Horários Disponíveis na Grade</span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {HORARIOS_SLOTS.map((h) => (
                  <button
                    key={h}
                    onClick={() => handleSelectHorario(h)}
                    className={`py-3 rounded-2xl border text-xs font-bold text-center transition-all ${
                      selectedHorario === h
                        ? (isDark ? 'bg-emerald-400 text-black border-emerald-400 font-black shadow-md' : 'bg-emerald-600 text-white border-emerald-600 font-black shadow-md')
                        : (isDark ? 'bg-[#1c1c20] border-white/10 hover:bg-white/10' : 'bg-neutral-100 border-neutral-200 hover:bg-neutral-200')
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- PASSO 4: DADOS DO CLIENTE & CONFIRMAÇÃO --- */}
        {step === 4 && selectedServico && selectedProfissional && selectedHorario && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <h2 className="text-xl font-bold tracking-tight">4. Informe seus Dados para Confirmar</h2>

            {/* Resumo do Agendamento */}
            <div className={`p-5 rounded-[24px] border text-xs space-y-2 ${
              isDark ? 'bg-[#121215] border-white/10' : 'bg-neutral-100 border-neutral-200'
            }`}>
              <div className="flex justify-between">
                <span className="opacity-60">Serviço:</span>
                <span className="font-bold">{selectedServico.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Profissional:</span>
                <span className="font-bold">{selectedProfissional.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Data e Horário:</span>
                <span className="font-bold text-emerald-400">{selectedDataObj.dataFull} às {selectedHorario}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold">
                <span>Valor Total:</span>
                <span className="text-emerald-400">R$ {selectedServico.preco.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleFinalizarAgendamento} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold opacity-70 mb-1">Seu Nome Completo *</label>
                <input
                  type="text"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Ex: Carlos Oliveira"
                  className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                    isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold opacity-70 mb-1">Seu Telefone / WhatsApp *</label>
                <input
                  type="text"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                  placeholder="(11) 98888-7777"
                  className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                    isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-300'
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full h-12 rounded-2xl font-bold text-xs transition-all shadow-lg active:scale-[0.98] ${
                  isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                Confirmar Agendamento Agora
              </button>
            </form>
          </motion.div>
        )}

        {/* --- PASSO 5: TELA DE CONFIRMAÇÃO INSTANTÂNEA --- */}
        {step === 5 && selectedServico && selectedProfissional && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Check size={32} />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                Agendamento Confirmado com Sucesso!
              </span>
              <h2 className="text-2xl font-bold">Código: {codigoConfirmacao}</h2>
              <p className="text-xs opacity-60 mt-1">Seu horário já foi reservado na agenda do estabelecimento.</p>
            </div>

            <div className={`p-6 rounded-[24px] border text-left text-xs space-y-3 ${
              isDark ? 'bg-[#121215] border-white/10' : 'bg-white border-neutral-200 shadow-sm'
            }`}>
              <div className="flex justify-between">
                <span className="opacity-60">Cliente:</span>
                <span className="font-bold">{clienteNome}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Serviço:</span>
                <span className="font-bold">{selectedServico.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Profissional:</span>
                <span className="font-bold">{selectedProfissional.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Data e Horário:</span>
                <span className="font-bold text-emerald-400">{selectedDataObj.dataFull} às {selectedHorario}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-sm">
                <span>Valor Total:</span>
                <span className="text-emerald-400">R$ {selectedServico.preco.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`https://wa.me/5511987654321?text=${encodeURIComponent(`Olá! Fiz o agendamento ${codigoConfirmacao} para ${selectedDataObj.dataFull} às ${selectedHorario}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full h-11 rounded-2xl bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-md"
              >
                <Phone size={15} /> Confirmar via WhatsApp
              </a>

              <button
                onClick={() => setStep(1)}
                className={`w-full h-11 rounded-2xl border text-xs font-semibold ${
                  isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-neutral-200 border-neutral-300 text-black'
                }`}
              >
                Fazer Novo Agendamento
              </button>
            </div>
          </motion.div>
        )}

      </main>

    </div>
  );
}
