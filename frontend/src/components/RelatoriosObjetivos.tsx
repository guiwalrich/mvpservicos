import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  UserCheck,
  Download,
  BarChart3,
  Award,
  PieChart
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type PeriodoFiltro = 'hoje' | 'semana' | 'mes' | 'ano';

export interface DesempenhoProfissional {
  id: string;
  nome: string;
  especialidade: string;
  atendimentos: number;
  faturamentoGerado: number;
  comissaoRepassada: number;
  taxaOcupacaoPct: number;
}

export interface DesempenhoServico {
  id: string;
  nome: string;
  categoria: string;
  atendimentosCount: number;
  receitaTotal: number;
  percentualDoTotal: number;
}

const PROFISSIONAIS_RELATORIO: DesempenhoProfissional[] = [
  {
    id: 'p1',
    nome: 'Carlos Silva',
    especialidade: 'Barbeiro Lead',
    atendimentos: 112,
    faturamentoGerado: 8960.00,
    comissaoRepassada: 4480.00,
    taxaOcupacaoPct: 88.5
  },
  {
    id: 'p2',
    nome: 'Ana Souza',
    especialidade: 'Esteticista & Design',
    atendimentos: 78,
    faturamentoGerado: 9360.00,
    comissaoRepassada: 4212.00,
    taxaOcupacaoPct: 75.0
  },
  {
    id: 'p3',
    nome: 'Juliana Lima',
    especialidade: 'Tatuadora & Artist',
    atendimentos: 24,
    faturamentoGerado: 7170.00,
    comissaoRepassada: 4302.00,
    taxaOcupacaoPct: 68.0
  }
];

const SERVICOS_RELATORIO: DesempenhoServico[] = [
  {
    id: 's1',
    nome: 'Corte Fade + Barba Terapia',
    categoria: 'Barbearia',
    atendimentosCount: 145,
    receitaTotal: 11600.00,
    percentualDoTotal: 45.5
  },
  {
    id: 's2',
    nome: 'Avaliação Estética & Limpeza',
    categoria: 'Estética',
    atendimentosCount: 62,
    receitaTotal: 9300.00,
    percentualDoTotal: 36.5
  },
  {
    id: 's3',
    nome: 'Tatuagem Blackwork Autoral',
    categoria: 'Tatuagem',
    atendimentosCount: 18,
    receitaTotal: 4590.00,
    percentualDoTotal: 18.0
  }
];

export default function RelatoriosObjetivos() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mes');

  // Multiplicadores baseados no período selecionado
  const mult = periodo === 'hoje' ? 0.05 : periodo === 'semana' ? 0.25 : periodo === 'ano' ? 12 : 1;

  const faturamentoTotal = 25490.00 * mult;
  const comissoesTotal = 12994.00 * mult;
  const lucroCasa = faturamentoTotal - comissoesTotal;
  const totalAtendimentos = Math.round(214 * mult);
  const taxaOcupacaoMedia = 77.2;

  // Exportar dados para CSV
  const handleExportCSV = () => {
    let csv = 'Profissional,Especialidade,Atendimentos,Faturamento Gerado,Comissão Repassada,Ocupação %\n';
    PROFISSIONAIS_RELATORIO.forEach(p => {
      csv += `"${p.nome}","${p.especialidade}",${p.atendimentos},R$ ${p.faturamentoGerado.toFixed(2)},R$ ${p.comissaoRepassada.toFixed(2)},${p.taxaOcupacaoPct}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_desempenho_${periodo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* Toolbar Superior: Filtro de Período e Exportação CSV */}
      <div className={`p-4 rounded-[24px] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold opacity-70">Período de Análise:</span>
          <div className={`flex items-center border rounded-2xl p-1 ${
            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-200'
          }`}>
            {[
              { id: 'hoje', label: 'Hoje' },
              { id: 'semana', label: 'Esta Semana' },
              { id: 'mes', label: 'Este Mês' },
              { id: 'ano', label: 'Este Ano' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriodo(p.id as PeriodoFiltro)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  periodo === p.id
                    ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className={`h-11 px-5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-[0.98] ${
            isDark ? 'bg-white text-black hover:bg-neutral-200 border-white' : 'bg-black text-white hover:bg-neutral-800 border-black'
          }`}
        >
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* Grid 1: 4 Indicadores Vitais de Negócio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Faturamento Bruto</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold">R$ {faturamentoTotal.toFixed(2)}</p>
          <span className="text-xs opacity-60 mt-1 block">Receita total arrecadada</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Lucro Líquido da Casa</span>
            <TrendingUp size={18} className="text-teal-400" />
          </div>
          <p className="text-3xl font-bold text-teal-400">R$ {lucroCasa.toFixed(2)}</p>
          <span className="text-xs opacity-60 mt-1 block">Após repasse de comissões</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Atendimentos Concluídos</span>
            <UserCheck size={18} className="text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400">{totalAtendimentos}</p>
          <span className="text-xs opacity-60 mt-1 block">Clientes atendidos</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Taxa de Ocupação (%)</span>
            <BarChart3 size={18} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-400">{taxaOcupacaoMedia}%</p>
          <span className="text-xs opacity-60 mt-1 block">Horários da grade preenchidos</span>
        </div>
      </div>

      {/* Grid 2: Desempenho por Profissional & Ranking de Serviços */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Desempenho por Profissional */}
        <div className={`p-6 sm:p-8 rounded-[28px] border space-y-4 ${
          isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Produtividade da Equipe</h3>
              <p className="text-xs opacity-60">Atendimentos, receita gerada e taxa de ocupação individual.</p>
            </div>
            <Award size={20} className="opacity-50" />
          </div>

          <div className="space-y-3">
            {PROFISSIONAIS_RELATORIO.map((prof) => (
              <div key={prof.id} className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold">{prof.nome}</h4>
                    <span className="text-[11px] opacity-60">{prof.especialidade}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    R$ {(prof.faturamentoGerado * mult).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px]">
                  <div>
                    <span className="opacity-60 block">Atendimentos:</span>
                    <span className="font-bold">{Math.round(prof.atendimentos * mult)}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block">Comissão:</span>
                    <span className="font-bold text-purple-400">R$ {(prof.comissaoRepassada * mult).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block">Ocupação:</span>
                    <span className="font-bold text-blue-400">{prof.taxaOcupacaoPct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking dos Serviços Mais Lucrativos */}
        <div className={`p-6 sm:p-8 rounded-[28px] border space-y-4 ${
          isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Serviços Mais Lucrativos</h3>
              <p className="text-xs opacity-60">Ranking por volume de vendas e representatividade no faturamento.</p>
            </div>
            <PieChart size={20} className="opacity-50" />
          </div>

          <div className="space-y-3">
            {SERVICOS_RELATORIO.map((serv, index) => (
              <div key={serv.id} className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold">{serv.nome}</h4>
                      <span className="text-[11px] opacity-60">{serv.categoria}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    R$ {(serv.receitaTotal * mult).toFixed(2)}
                  </span>
                </div>

                {/* Progress bar de representatividade */}
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[11px]">
                    <span className="opacity-60">{Math.round(serv.atendimentosCount * mult)} agendamentos</span>
                    <span className="font-bold text-blue-400">{serv.percentualDoTotal}% do total</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${serv.percentualDoTotal}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
