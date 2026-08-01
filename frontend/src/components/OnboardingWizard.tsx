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
  isPerfilConcluido?: boolean;
  isServicoConcluido?: boolean;
  isProfissionalConcluido?: boolean;
  isAgendamentoTestado?: boolean;
}

export default function OnboardingWizard({
  onNavigateTab,
  isPerfilConcluido = true,
  isServicoConcluido = true,
  isProfissionalConcluido = true,
  isAgendamentoTestado = false
}: OnboardingWizardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Passos de onboarding
  const steps = [
    {
      id: 'perfil',
      num: 1,
      title: 'Configurar Empresa & Foto de Perfil',
      desc: 'Informe o nome do estabelecimento, endereço no mapa, telefone e foto/logo.',
      completed: isPerfilConcluido,
      actionLabel: 'Configurar Empresa',
      tab: 'configuracoes',
      icon: Building
    },
    {
      id: 'servicos',
      num: 2,
      title: 'Cadastrar o Primeiro Serviço',
      desc: 'Adicione serviços com preço (R$), tempo de duração e categoria.',
      completed: isServicoConcluido,
      actionLabel: 'Cadastrar Serviços',
      tab: 'servicos',
      icon: Sparkles
    },
    {
      id: 'profissionais',
      num: 3,
      title: 'Cadastrar Equipe & Comissões',
      desc: 'Adicione profissionais da equipe com e-mail/senha e fotos de perfil.',
      completed: isProfissionalConcluido,
      actionLabel: 'Gerenciar Equipe',
      tab: 'profissionais',
      icon: Users
    },
    {
      id: 'agendamento',
      num: 4,
      title: 'Testar Página Pública de Agendamento',
      desc: 'Abra a sua página pública no celular e faça um agendamento de teste.',
      completed: isAgendamentoTestado,
      actionLabel: 'Abrir Página Pública',
      isPublicLink: true,
      icon: Calendar
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  if (!isVisible) return null;

  return (
    <div className={`p-6 rounded-[28px] border relative overflow-hidden transition-all duration-300 shadow-xl ${
      isDark ? 'bg-[#121215]/95 border-white/10' : 'bg-white border-neutral-200 shadow-md'
    }`}>
      
      {/* Header do Guia de Onboarding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            {progressPct}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">Guia de Configuração Rápida (&lt; 10 min)</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400">
                {completedCount} de {steps.length} Concluídos
              </span>
            </div>
            <p className="text-xs opacity-60 mt-0.5">Siga os 4 passos abaixo para colocar a sua agenda pública no ar imediatamente.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/10">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                  step.completed
                    ? (isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                    : (isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200')
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      step.completed ? 'text-emerald-400' : 'opacity-60'
                    }`}>
                      Passo 0{step.num}
                    </span>

                    {step.completed ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <Circle size={18} className="opacity-40" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon size={16} className={step.completed ? 'text-emerald-400' : 'opacity-70'} />
                    <h3 className="text-xs font-bold leading-tight">{step.title}</h3>
                  </div>

                  <p className="text-[11px] opacity-60 leading-relaxed">{step.desc}</p>
                </div>

                {step.isPublicLink ? (
                  <Link
                    to="/agendar/studio-agende-yo"
                    target="_blank"
                    className="w-full h-9 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-sm mt-2"
                  >
                    <span>{step.actionLabel}</span>
                    <ExternalLink size={13} />
                  </Link>
                ) : (
                  <button
                    onClick={() => onNavigateTab(step.tab || 'agenda')}
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
