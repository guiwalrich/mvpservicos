import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  User,
  Filter,
  CheckCircle2,
  X,
  Lock,
  Check,
  Ban,
  UserX,
  Play,
  UserPlus
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type StatusAgendamento = 
  | 'Pendente' 
  | 'Confirmado' 
  | 'Em Atendimento' 
  | 'Finalizado' 
  | 'Cancelado' 
  | 'Não Compareceu';

export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  avatar: string;
  fotoUrl?: string;
}

export interface AgendamentoItem {
  id: string;
  cliente: string;
  telefone: string;
  servico: string;
  valor: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  duracaoMin: number;
  profissionalId: string;
  profissionalNome: string;
  sala: string;
  status: StatusAgendamento;
}

export interface BloqueioItem {
  id: string;
  motivo: string; // Ex: "Horário de Almoço", "Feriado", "Manutenção"
  horarioInicio: string;
  horarioFim: string;
  profissionalId?: string;
}

const PROFISSIONAIS_DEMO: Profissional[] = [
  { id: '1', nome: 'Carlos Silva', especialidade: 'Barbeiro Lead', avatar: 'CS', fotoUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=150&auto=format&fit=crop&q=80' },
  { id: '2', nome: 'Ana Souza', especialidade: 'Esteticista & Design', avatar: 'AS', fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { id: '3', nome: 'Juliana Lima', especialidade: 'Tatuadora & Artist', avatar: 'JL', fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
];

const HORARIOS_DIA = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const STATUS_CONFIG: Record<StatusAgendamento, { label: string; colorClass: string; borderClass: string; icon: any }> = {
  'Pendente': { label: 'Pendente', colorClass: 'bg-amber-500/10 text-amber-400', borderClass: 'border-amber-500/30', icon: Clock },
  'Confirmado': { label: 'Confirmado', colorClass: 'bg-blue-500/10 text-blue-400', borderClass: 'border-blue-500/30', icon: CheckCircle2 },
  'Em Atendimento': { label: 'Em Atendimento', colorClass: 'bg-purple-500/10 text-purple-400', borderClass: 'border-purple-500/30', icon: Play },
  'Finalizado': { label: 'Finalizado', colorClass: 'bg-emerald-500/10 text-emerald-400', borderClass: 'border-emerald-500/30', icon: Check },
  'Cancelado': { label: 'Cancelado', colorClass: 'bg-red-500/10 text-red-400', borderClass: 'border-red-500/30', icon: Ban },
  'Não Compareceu': { label: 'Não Compareceu', colorClass: 'bg-neutral-500/10 text-neutral-400', borderClass: 'border-neutral-500/30', icon: UserX },
};

interface AgendaInteligenteProps {
  userRole?: 'DONO' | 'PROFISSIONAL';
  activeProfissionalId?: string;
}

export default function AgendaInteligente({
  userRole = 'DONO',
  activeProfissionalId = '1'
}: AgendaInteligenteProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Visões e Modos
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [displayType, setDisplayType] = useState<'calendar' | 'timeline'>('timeline');
  const [selectedProf, setSelectedProf] = useState<string>('all');

  // Dados da Agenda
  const [agendamentos, setAgendamentos] = useState<AgendamentoItem[]>([
    { id: '1', cliente: 'Carlos Silva', telefone: '(11) 98765-4321', servico: 'Corte + Barba Premium', valor: 'R$ 80,00', data: '2026-07-31', horario: '09:00', duracaoMin: 50, profissionalId: '1', profissionalNome: 'Carlos Silva', sala: 'Cadeira 01', status: 'Confirmado' },
    { id: '2', cliente: 'Ana Souza', telefone: '(11) 97654-3210', servico: 'Avaliação Estética', valor: 'R$ 150,00', data: '2026-07-31', horario: '10:00', duracaoMin: 60, profissionalId: '2', profissionalNome: 'Ana Souza', sala: 'Sala VIP Estética', status: 'Em Atendimento' },
    { id: '3', cliente: 'Lucas Mendes', telefone: '(11) 96543-2109', servico: 'Tatuagem Blackwork 10cm', valor: 'R$ 350,00', data: '2026-07-31', horario: '14:00', duracaoMin: 120, profissionalId: '3', profissionalNome: 'Juliana Lima', sala: 'Estúdio 02', status: 'Pendente' },
    { id: '4', cliente: 'Mariana Lima', telefone: '(11) 95432-1098', servico: 'Limpeza de Pele', valor: 'R$ 120,00', data: '2026-07-31', horario: '16:00', duracaoMin: 45, profissionalId: '2', profissionalNome: 'Ana Souza', sala: 'Sala VIP Estética', status: 'Finalizado' },
  ]);

  const [bloqueios, setBloqueios] = useState<BloqueioItem[]>([
    { id: 'b1', motivo: 'Horário de Almoço', horarioInicio: '12:00', horarioFim: '13:00' },
  ]);

  // Profissionais dinâmicos da empresa
  const [profissionais, setProfissionais] = useState<Profissional[]>(PROFISSIONAIS_DEMO);

  // Carregar agendamentos vindos da Página Pública /agendar/:slug
  React.useEffect(() => {
    const armazenados = JSON.parse(localStorage.getItem('novos_agendamentos_publicos') || '[]');
    if (armazenados && Array.isArray(armazenados) && armazenados.length > 0) {
      setAgendamentos(prev => [...armazenados, ...prev]);
    }
  }, []);

  // Modais de Controle
  const [selectedAppointment, setSelectedAppointment] = useState<AgendamentoItem | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isNewProfModalOpen, setIsNewProfModalOpen] = useState(false);
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);
  const [selectedMetodoPagamento, setSelectedMetodoPagamento] = useState<'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro'>('PIX');
  const [concluidoToast, setConcluidoToast] = useState<string | null>(null);

  // Form State para Bloqueio de Horário
  const [motivoBloqueio, setMotivoBloqueio] = useState('Horário de Almoço');
  const [inicioBloqueio, setInicioBloqueio] = useState('12:00');
  const [fimBloqueio, setFimBloqueio] = useState('13:00');

  // Form State para Novo Profissional
  const [nomeProf, setNomeProf] = useState('');
  const [especialidadeProf, setEspecialidadeProf] = useState('Barbeiro / Esteticista');

  // Alterar Status com Interceptação de Pagamento na Conclusão
  const handleChangeStatus = (novoStatus: StatusAgendamento) => {
    if (!selectedAppointment) return;

    if (novoStatus === 'Finalizado') {
      // Se for finalizar, abre a escolha da Forma de Pagamento
      setIsStatusModalOpen(false);
      setIsPagamentoModalOpen(true);
    } else {
      setAgendamentos(agendamentos.map(a => a.id === selectedAppointment.id ? { ...a, status: novoStatus } : a));
      setIsStatusModalOpen(false);
    }
  };

  // Confirmar Conclusão com Forma de Pagamento -> Contabiliza no Caixa Diário
  const handleConfirmarPagamentoEFinalizar = () => {
    if (!selectedAppointment) return;

    // Atualiza agendamento para finalizado
    setAgendamentos(agendamentos.map(a => a.id === selectedAppointment.id ? { ...a, status: 'Finalizado' } : a));

    // Salva o lançamento no Caixa Diário via localStorage
    const valNum = parseFloat((selectedAppointment.valor || '80').replace(/[^0-9,.]/g, '').replace(',', '.')) || 80.00;
    const valComissao = valNum * 0.5; // 50% comissão demo
    const novoLancamentoCaixa = {
      id: `l-${Date.now()}`,
      descricao: selectedAppointment.servico,
      cliente: selectedAppointment.cliente,
      profissional: selectedAppointment.profissionalNome,
      valor: valNum,
      metodo: selectedMetodoPagamento,
      comissaoPct: 50,
      valorComissao: valComissao,
      valorCasa: valNum - valComissao,
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const existentes = JSON.parse(localStorage.getItem('novos_lancamentos_caixa') || '[]');
    localStorage.setItem('novos_lancamentos_caixa', JSON.stringify([novoLancamentoCaixa, ...existentes]));

    setIsPagamentoModalOpen(false);
    setConcluidoToast(`Atendimento de ${selectedAppointment.cliente} concluído! R$ ${valNum.toFixed(2)} contabilizado no Caixa em ${selectedMetodoPagamento}.`);

    setTimeout(() => setConcluidoToast(null), 4000);
    setSelectedAppointment(null);
  };

  // Criar Bloqueio de Horário
  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: BloqueioItem = {
      id: `b-${Date.now()}`,
      motivo: motivoBloqueio,
      horarioInicio: inicioBloqueio,
      horarioFim: fimBloqueio,
    };
    setBloqueios([...bloqueios, novo]);
    setIsBlockModalOpen(false);
  };

  // Criar Novo Profissional
  const handleCreateProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeProf) return;

    const iniciais = nomeProf.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const novo: Profissional = {
      id: Date.now().toString(),
      nome: nomeProf,
      especialidade: especialidadeProf || 'Atendente',
      avatar: iniciais || 'PR'
    };

    setProfissionais([...profissionais, novo]);
    setIsNewProfModalOpen(false);
    setNomeProf('');
  };

  // Drag & Drop simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (horario: string, profId: string) => {
    const appId = window.localStorage.getItem('dragged_app_id');
    if (!appId) return;

    const profObj = profissionais.find(p => p.id === profId);

    setAgendamentos(agendamentos.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          horario,
          profissionalId: profId,
          profissionalNome: profObj ? profObj.nome : a.profissionalNome
        };
      }
      return a;
    }));
  };

  const filteredAppointments = agendamentos.filter(a => {
    if (userRole === 'PROFISSIONAL' && a.profissionalId !== activeProfissionalId) return false;
    if (selectedProf !== 'all' && a.profissionalId !== selectedProf) return false;
    return true;
  });

  const activeProfs = selectedProf === 'all' 
    ? profissionais 
    : profissionais.filter(p => p.id === selectedProf);

  return (
    <div className="space-y-6">
      
      {/* Top Controls Toolbar */}
      <div className={`p-4 rounded-2xl border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 ${
        isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        
        {/* Date Navigator & View Modes */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center border rounded-xl p-1 ${
            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-200'
          }`}>
            <button 
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'daily' 
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md') 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Dia
            </button>
            <button 
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'weekly' 
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md') 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Semana
            </button>
            <button 
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'monthly' 
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md') 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Mês
            </button>
          </div>

          {/* Toggle Display Type: Calendar vs Timeline */}
          <div className={`flex items-center border rounded-xl p-1 ${
            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-200'
          }`}>
            <button 
              onClick={() => setDisplayType('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                displayType === 'timeline' 
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md') 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Timeline por Profissional
            </button>
            <button 
              onClick={() => setDisplayType('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                displayType === 'calendar' 
                  ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md') 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Grade Geral
            </button>
          </div>
        </div>

        {/* Professional Filter & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Prof Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="opacity-60" />
            <select
              value={selectedProf}
              onChange={(e) => setSelectedProf(e.target.value)}
              className={`h-9 border rounded-xl px-3 text-xs focus:outline-none font-medium ${
                isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white' : 'bg-neutral-100 border-neutral-200 text-black'
              }`}
            >
              <option value="all">Todos os Profissionais ({profissionais.length})</option>
              {profissionais.map(p => (
                <option key={p.id} value={p.id}>{p.nome} ({p.especialidade})</option>
              ))}
            </select>
          </div>

          {/* Add Professional Button */}
          <button
            onClick={() => setIsNewProfModalOpen(true)}
            className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isDark ? 'bg-white text-black hover:bg-neutral-200 border-white' : 'bg-black text-white hover:bg-neutral-800 border-black'
            }`}
          >
            <UserPlus size={14} /> Novo Profissional
          </button>

          {/* Block Time Button */}
          <button
            onClick={() => setIsBlockModalOpen(true)}
            className={`h-9 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isDark ? 'bg-[#1c1c20] border-white/[0.06] text-amber-400 hover:bg-amber-500/10' : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Lock size={14} /> Bloquear Horário
          </button>
        </div>
      </div>

      {/* --- AGENDA DISPLAY: TIMELINE MODE (Side-by-Side Professionals) --- */}
      {displayType === 'timeline' && (
        <div className={`rounded-2xl border overflow-hidden ${
          isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-neutral-200 bg-neutral-50'}`}>
                  <th className="p-4 text-left text-xs font-semibold w-24 border-r border-white/10">Horário</th>
                  {activeProfs.map(prof => (
                    <th key={prof.id} className="p-4 text-left border-r border-white/10 last:border-r-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 ${
                          isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-black text-white'
                        }`}>
                          {prof.fotoUrl ? (
                            <img src={prof.fotoUrl} alt={prof.nome} className="w-full h-full object-cover" />
                          ) : (
                            prof.avatar
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold leading-tight">{prof.nome}</p>
                          <p className="text-[10px] opacity-60 font-normal">{prof.especialidade}</p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {HORARIOS_DIA.map((horario) => {
                  const isBlockedLunch = bloqueios.some(b => b.horarioInicio <= horario && b.horarioFim > horario);

                  return (
                    <tr key={horario} className="hover:bg-white/[0.01] transition-colors">
                      {/* Time Cell */}
                      <td className="p-3 text-xs font-mono font-bold opacity-70 border-r border-white/10 align-top">
                        {horario}
                      </td>

                      {/* Professional Columns */}
                      {activeProfs.map((prof) => {
                        const app = filteredAppointments.find(
                          a => a.profissionalId === prof.id && a.horario === horario
                        );

                        return (
                          <td 
                            key={prof.id} 
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(horario, prof.id)}
                            className="p-2 border-r border-white/10 last:border-r-0 align-top min-h-[60px] relative"
                          >
                            {/* Blocked Slot Render */}
                            {isBlockedLunch ? (
                              <div className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[11px] font-medium flex items-center gap-2">
                                <Lock size={12} /> Almoço / Bloqueado
                              </div>
                            ) : app ? (
                              /* Appointment Card (Draggable) */
                              <motion.div
                                layoutId={app.id}
                                draggable
                                onDragStart={() => window.localStorage.setItem('dragged_app_id', app.id)}
                                onClick={() => { setSelectedAppointment(app); setIsStatusModalOpen(true); }}
                                className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] shadow-sm ${
                                  STATUS_CONFIG[app.status].colorClass
                                } ${STATUS_CONFIG[app.status].borderClass}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold truncate">{app.cliente}</span>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/20">
                                    {app.status}
                                  </span>
                                </div>
                                <p className="text-[11px] font-medium opacity-90 truncate">{app.servico}</p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10 text-[10px] opacity-75">
                                  <span>{app.horario} ({app.duracaoMin} min)</span>
                                  <span className="font-bold">{app.valor}</span>
                                </div>
                              </motion.div>
                            ) : (
                              /* Empty Cell Slot */
                              <div className="h-full min-h-[44px] rounded-xl border border-dashed border-white/5 hover:border-white/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100 text-[10px] text-neutral-400 cursor-pointer">
                                + Agendar em {horario}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- AGENDA DISPLAY: CALENDAR GRID MODE --- */}
      {displayType === 'calendar' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppointments.map((app) => {
            const StatusIcon = STATUS_CONFIG[app.status].icon;
            return (
              <motion.div
                key={app.id}
                onClick={() => { setSelectedAppointment(app); setIsStatusModalOpen(true); }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] shadow-sm ${
                  isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="opacity-60" />
                    <span className="text-sm font-bold">{app.horario}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${
                    STATUS_CONFIG[app.status].colorClass
                  } ${STATUS_CONFIG[app.status].borderClass}`}>
                    <StatusIcon size={12} /> {app.status}
                  </span>
                </div>

                <h4 className="text-base font-bold mb-1">{app.cliente}</h4>
                <p className="text-xs opacity-70 mb-3">{app.servico} • {app.valor}</p>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs opacity-70">
                  <span className="flex items-center gap-1">
                    <User size={13} /> {app.profissionalNome}
                  </span>
                  <span>{app.sala}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* --- MODAL: ALTERAR STATUS DO AGENDAMENTO (6 Status Oficiais) --- */}
      <AnimatePresence>
        {isStatusModalOpen && selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl">
                <div className={`rounded-[27px] p-6 sm:p-8 relative ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => setIsStatusModalOpen(false)} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>

                  <h3 className="text-lg font-bold mb-1">Atualizar Status do Atendimento</h3>
                  <p className="text-xs opacity-60 mb-5">
                    Cliente: <strong className="text-current">{selectedAppointment.cliente}</strong> • {selectedAppointment.horario}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    {(Object.keys(STATUS_CONFIG) as StatusAgendamento[]).map((st) => {
                      const cfg = STATUS_CONFIG[st];
                      const Icon = cfg.icon;
                      const isSelected = selectedAppointment.status === st;

                      return (
                        <button
                          key={st}
                          onClick={() => handleChangeStatus(st)}
                          className={`p-3 rounded-2xl border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                            cfg.colorClass
                          } ${cfg.borderClass} ${isSelected ? 'ring-2 ring-white' : 'opacity-80 hover:opacity-100'}`}
                        >
                          <Icon size={14} /> {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: FORMA DE PAGAMENTO AO CONCLUIR ATENDIMENTO (ALIMENTA O CAIXA DIÁRIO) --- */}
      <AnimatePresence>
        {isPagamentoModalOpen && selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl">
                <div className={`rounded-[27px] p-6 sm:p-8 relative ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => setIsPagamentoModalOpen(false)} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>

                  <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 mb-2 inline-block">
                    Concluir Atendimento & Lançar no Caixa
                  </span>

                  <h3 className="text-xl font-bold mb-1">Como o cliente pagou?</h3>
                  <p className="text-xs opacity-60 mb-6">
                    {selectedAppointment.cliente} • {selectedAppointment.servico} ({selectedAppointment.valor || 'R$ 80,00'})
                  </p>

                  <div className="space-y-3">
                    <label className="block text-xs font-semibold opacity-70">Selecione o Meio de Pagamento</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'PIX', label: 'PIX (Instantâneo)' },
                        { id: 'Cartão de Crédito', label: 'Cartão de Crédito' },
                        { id: 'Cartão de Débito', label: 'Cartão de Débito' },
                        { id: 'Dinheiro', label: 'Dinheiro (Espécie)' }
                      ].map(met => (
                        <button
                          key={met.id}
                          type="button"
                          onClick={() => setSelectedMetodoPagamento(met.id as any)}
                          className={`p-3.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                            selectedMetodoPagamento === met.id
                              ? (isDark ? 'bg-white text-black border-white shadow-md' : 'bg-black text-white border-black shadow-md')
                              : 'opacity-70 border-white/10 hover:opacity-100'
                          }`}
                        >
                          {met.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleConfirmarPagamentoEFinalizar}
                      className={`w-full h-11 rounded-2xl font-bold text-xs mt-4 transition-all shadow-md ${
                        isDark ? 'bg-emerald-400 text-black hover:bg-emerald-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      Confirmar Conclusão & Lançar no Caixa
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast de Notificação de Sucesso */}
      {concluidoToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-black font-semibold text-xs shadow-2xl animate-bounce">
          {concluidoToast}
        </div>
      )}

      {/* --- MODAL: BLOQUEAR HORÁRIO / ALMOÇO / FERIADO --- */}
      <AnimatePresence>
        {isBlockModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl">
                <div className={`rounded-[27px] p-6 sm:p-8 relative ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => setIsBlockModalOpen(false)} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>

                  <h3 className="text-lg font-bold mb-1">Bloquear Horário na Agenda</h3>
                  <p className="text-xs opacity-60 mb-5">Impeça novos agendamentos no período selecionado.</p>

                  <form onSubmit={handleCreateBlock} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1.5">Motivo do Bloqueio</label>
                      <input
                        type="text"
                        value={motivoBloqueio}
                        onChange={(e) => setMotivoBloqueio(e.target.value)}
                        placeholder="Ex: Horário de Almoço, Reunião de Equipe, Folga"
                        className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1.5">Horário Início</label>
                        <input
                          type="text"
                          value={inicioBloqueio}
                          onChange={(e) => setInicioBloqueio(e.target.value)}
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1.5">Horário Fim</label>
                        <input
                          type="text"
                          value={fimBloqueio}
                          onChange={(e) => setFimBloqueio(e.target.value)}
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
                        isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                      }`}
                    >
                      Confirmar Bloqueio
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: CADASTRAR NOVO PROFISSIONAL --- */}
      <AnimatePresence>
        {isNewProfModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl">
                <div className={`rounded-[27px] p-6 sm:p-8 relative ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => setIsNewProfModalOpen(false)} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>

                  <h3 className="text-lg font-bold mb-1">Cadastrar Novo Profissional</h3>
                  <p className="text-xs opacity-60 mb-5">Adicione profissionais à equipe para criar colunas na Timeline da Agenda.</p>

                  <form onSubmit={handleCreateProfessional} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1.5">Nome do Profissional</label>
                      <input
                        type="text"
                        value={nomeProf}
                        onChange={(e) => setNomeProf(e.target.value)}
                        placeholder="Ex: Roberto Alves, Juliana Tatuadora"
                        className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1.5">Especialidade / Cargo</label>
                      <input
                        type="text"
                        value={especialidadeProf}
                        onChange={(e) => setEspecialidadeProf(e.target.value)}
                        placeholder="Ex: Barbeiro Specialist, Tatuador Realismo, Esteticista"
                        className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full font-semibold text-xs h-11 rounded-2xl transition-all mt-2 shadow-md ${
                        isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                      }`}
                    >
                      Cadastrar Profissional na Agenda
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
