import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Building,
  Users,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

interface OnboardingWizardProps {
  onNavigateTab: (tab: string) => void;
  empresaSlug?: string;
  isPerfilConcluido?: boolean;
  isServicoConcluido?: boolean;
  isProfissionalConcluido?: boolean;
  isAgendamentoTestado?: boolean;
}

export default function OnboardingWizard({
  onNavigateTab,
  empresaSlug,
  isPerfilConcluido = false,
  isServicoConcluido = false,
  isProfissionalConcluido = false,
  isAgendamentoTestado = false
}: OnboardingWizardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const slugReal = empresaSlug || JSON.parse(localStorage.getItem('empresa') || '{}').slug || 'meu-estabelecimento';

  // Passos do Onboarding Rápido com rotas semânticas
  const steps = [
    {
      id: 'perfil',
      num: 1,
      title: '1. Perfil & Dados da Empresa',
      desc: 'Informe o nome do estabelecimento, telefone WhatsApp, foto/logo e endereço.',
      completed: isPerfilConcluido,
      actionLabel: 'Configurar Perfil',
      tab: 'configuracoes',
      route: '/dashboard?tab=configuracoes',
      icon: Building
    },
    {
      id: 'servicos',
      num: 2,
      title: '2. Tabela de Serviços & Preços',
      desc: 'Cadastre os serviços prestados com valor (R$), tempo de duração e categoria.',
      completed: isServicoConcluido,
      actionLabel: 'Cadastrar Serviços',
      tab: 'servicos',
      route: '/dashboard?tab=servicos',
      icon: Sparkles
    },
    {
      id: 'profissionais',
      num: 3,
      title: '3. Equipe & Comissões',
      desc: 'Adicione os profissionais da equipe, fotos e comissão individual (%).',
      completed: isProfissionalConcluido,
      actionLabel: 'Gerenciar Equipe',
      tab: 'profissionais',
      route: '/dashboard?tab=profissionais',
      icon: Users
    },
    {
      id: 'agendamento',
      num: 4,
      title: '4. Testar Agendamento Online',
      desc: 'Abra a sua página pública no celular e faça um agendamento de teste.',
      completed: isAgendamentoTestado,
      actionLabel: 'Abrir Página Pública',
      isPublicLink: true,
      publicUrl: `/agendar/${slugReal}`,
      icon: Calendar
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  if (!isVisible) return null;

  return (
    <div className={`p-4 sm:p-6 rounded-[24px] sm:rounded-[28px] border relative overflow-hidden transition-all duration-300 shadow-xl ${
      isDark 
        ? 'bg-white/[0.03] border-white/[0.08] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)]' 
        : 'bg-white/70 border-black/[0.06] backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.03)]'
    }`}>
      
      {/* Header do Guia de Onboarding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
            {progressPct}%
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold">Passo a Passo de Configuração (&lt; 5 min)</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400">
                {completedCount} de {steps.length} Concluídos
              </span>
            </div>
            <p className="text-xs opacity-60 mt-0.5">Siga as 4 etapas para colocar sua agenda pública de agendamento no ar.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 opacity-70 hover:opacity-100 ${
              isDark ? 'bg-white/10 border-white/10' : 'bg-neutral-100 border-neutral-300'
            }`}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span className="hidden sm:inline">{isExpanded ? 'Recolher' : 'Expandir'}</span>
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="p-2 opacity-50 hover:opacity-100"
            title="Ocultar Guia de Boas-Vindas"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Barra de Progresso Visual */}
      <div className="w-full h-2 rounded-full bg-white/10 mt-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Grid com os 4 Passos de Configuração */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-4 border-t border-white/10">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                  step.completed
                    ? (isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                    : (isDark ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]' : 'bg-black/[0.02] border-black/[0.04] hover:bg-black/[0.04]')
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      step.completed ? 'text-emerald-400' : 'opacity-60'
                    }`}>
                      Etapa 0{step.num}
                    </span>

                    {step.completed ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <Circle size={18} className="opacity-40" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon size={16} className={step.completed ? 'text-emerald-400 shrink-0' : 'opacity-70 shrink-0'} />
                    <h3 className="text-xs font-bold leading-tight">{step.title}</h3>
                  </div>

                  <p className="text-[11px] opacity-60 leading-relaxed">{step.desc}</p>
                </div>

                {step.isPublicLink ? (
                  <Link
                    to={step.publicUrl}
                    target="_blank"
                    className="w-full h-9 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-sm mt-2"
                  >
                    <span>{step.actionLabel}</span>
                    <ExternalLink size={13} />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      onNavigateTab(step.tab || 'agenda');
                      window.history.pushState(null, '', step.route);
                    }}
                    className={`w-full h-9 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all mt-2 ${
                      step.completed
                        ? (isDark ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-neutral-200 border-neutral-300 text-black hover:bg-neutral-300')
                        : (isDark ? 'bg-white text-black hover:bg-neutral-200 border-white font-bold' : 'bg-black text-white hover:bg-neutral-800 border-black font-bold')
                    }`}
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
