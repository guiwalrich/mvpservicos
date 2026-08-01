import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Zap,
  CreditCard,
  Banknote,
  TrendingUp,
  User,
  Plus,
  X,
  Lock,
  Search
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type MetodoPagamento = 'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro';

export interface LancamentoCaixa {
  id: string;
  descricao: string;
  cliente: string;
  profissional: string;
  valor: number;
  metodo: MetodoPagamento;
  comissaoPct: number;
  valorComissao: number;
  valorCasa: number;
  horario: string;
}

const LANCAMENTOS_DEMO: LancamentoCaixa[] = [
  {
    id: 'l1',
    descricao: 'Corte + Barba Premium',
    cliente: 'Carlos Silva',
    profissional: 'Carlos Silva',
    valor: 80.00,
    metodo: 'PIX',
    comissaoPct: 50,
    valorComissao: 40.00,
    valorCasa: 40.00,
    horario: '09:45'
  },
  {
    id: 'l2',
    descricao: 'Avaliação Estética & Limpeza',
    cliente: 'Ana Souza',
    profissional: 'Ana Souza',
    valor: 150.00,
    metodo: 'Cartão de Crédito',
    comissaoPct: 45,
    valorComissao: 67.50,
    valorCasa: 82.50,
    horario: '11:20'
  },
  {
    id: 'l3',
    descricao: 'Tatuagem Blackwork 10cm',
    cliente: 'Lucas Mendes',
    profissional: 'Juliana Lima',
    valor: 350.00,
    metodo: 'PIX',
    comissaoPct: 60,
    valorComissao: 210.00,
    valorCasa: 140.00,
    horario: '14:30'
  },
  {
    id: 'l4',
    descricao: 'Corte Fade Navalhado',
    cliente: 'Gabriel Monteiro',
    profissional: 'Carlos Silva',
    valor: 50.00,
    metodo: 'Dinheiro',
    comissaoPct: 50,
    valorComissao: 25.00,
    valorCasa: 25.00,
    horario: '16:15'
  }
];

export default function CaixaDiario() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State
  const [lancamentos, setLancamentos] = useState<LancamentoCaixa[]>(LANCAMENTOS_DEMO);
  const [searchQuery, setSearchQuery] = useState('');
  const [metodoFilter, setMetodoFilter] = useState<string>('todos');

  // Carregar lançamentos vindos de agendamentos concluídos na Agenda
  React.useEffect(() => {
    const armazenados = JSON.parse(localStorage.getItem('novos_lancamentos_caixa') || '[]');
    if (armazenados && Array.isArray(armazenados) && armazenados.length > 0) {
      setLancamentos([...armazenados, ...LANCAMENTOS_DEMO]);
    }
  }, []);

  // Modais
  const [isNovoLancamentoModalOpen, setIsNovoLancamentoModalOpen] = useState(false);
  const [isCaixaFechado, setIsCaixaFechado] = useState(false);

  // Form State
  const [descricao, setDescricao] = useState('');
  const [cliente, setCliente] = useState('');
  const [profissional, setProfissional] = useState('Carlos Silva');
  const [valor, setValor] = useState('');
  const [metodo, setMetodo] = useState<MetodoPagamento>('PIX');
  const [comissaoPct, setComissaoPct] = useState('50');

  // Adicionar Lançamento no Balcão
  const handleCreateLancamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor) return;

    const valNum = parseFloat(valor);
    const comPctNum = parseFloat(comissaoPct) || 50;
    const valComissao = (valNum * comPctNum) / 100;
    const valCasa = valNum - valComissao;

    const novo: LancamentoCaixa = {
      id: `l-${Date.now()}`,
      descricao,
      cliente: cliente || 'Cliente Balcão',
      profissional,
      valor: valNum,
      metodo,
      comissaoPct: comPctNum,
      valorComissao: valComissao,
      valorCasa: valCasa,
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setLancamentos([novo, ...lancamentos]);
    setIsNovoLancamentoModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDescricao('');
    setCliente('');
    setValor('');
    setMetodo('PIX');
    setComissaoPct('50');
  };

  // Cálculos Automáticos de Fechamento de Caixa
  const totalFaturamento = lancamentos.reduce((acc, curr) => acc + curr.valor, 0);
  const totalPix = lancamentos.filter(l => l.metodo === 'PIX').reduce((acc, curr) => acc + curr.valor, 0);
  const totalCartao = lancamentos.filter(l => l.metodo === 'Cartão de Crédito' || l.metodo === 'Cartão de Débito').reduce((acc, curr) => acc + curr.valor, 0);
  const totalDinheiro = lancamentos.filter(l => l.metodo === 'Dinheiro').reduce((acc, curr) => acc + curr.valor, 0);

  const totalComissoesEquipe = lancamentos.reduce((acc, curr) => acc + curr.valorComissao, 0);
  const lucroLiquidoCasa = lancamentos.reduce((acc, curr) => acc + curr.valorCasa, 0);

  // Filtragem
  const filteredLancamentos = lancamentos.filter(l => {
    const matchesSearch = l.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.profissional.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (metodoFilter !== 'todos' && l.metodo !== metodoFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Alerta de Caixa Aberto / Fechado */}
      <div className={`p-4 rounded-[20px] border flex items-center justify-between gap-4 ${
        isCaixaFechado
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          : (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800')
      }`}>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className={`w-3 h-3 rounded-full animate-pulse ${isCaixaFechado ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <span>Status do Caixa: {isCaixaFechado ? 'Caixa do Dia Encerrado' : 'Caixa Aberto • Recebendo Lançamentos'}</span>
        </div>

        <button
          onClick={() => setIsCaixaFechado(!isCaixaFechado)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
            isCaixaFechado
              ? (isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white')
              : 'bg-amber-400 text-black hover:bg-amber-300'
          }`}
        >
          <Lock size={14} />
          {isCaixaFechado ? 'Reabrir Caixa' : 'Encerrar Caixa Hoje'}
        </button>
      </div>

      {/* Grid 1: Conferência por Meio de Pagamento (Conferência de Gaveta/Maquininha) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Faturamento Bruto</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold">R$ {totalFaturamento.toFixed(2)}</p>
          <span className="text-xs opacity-60 mt-1 block">{lancamentos.length} entradas no dia</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Total em PIX</span>
            <Zap size={18} className="text-teal-400" />
          </div>
          <p className="text-3xl font-bold text-teal-400">R$ {totalPix.toFixed(2)}</p>
          <span className="text-xs opacity-60 mt-1 block">Conferência bancária</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Total em Cartão</span>
            <CreditCard size={18} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-400">R$ {totalCartao.toFixed(2)}</p>
          <span className="text-xs opacity-60 mt-1 block">Conferência da maquininha</span>
        </div>

        <div className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-70">Dinheiro (Gaveta)</span>
            <Banknote size={18} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-400">R$ {totalDinheiro.toFixed(2)}</p>
          <span className="text-xs opacity-60 mt-1 block">Espécie na gaveta</span>
        </div>
      </div>

      {/* Grid 2: Divisão Saldo Casa vs Comissões da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`p-6 rounded-[24px] border flex items-center justify-between ${
          isDark ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div>
            <span className="text-xs font-semibold opacity-80 block mb-1">Lucro Líquido da Casa (Pós Comissões)</span>
            <p className="text-3xl font-extrabold">R$ {lucroLiquidoCasa.toFixed(2)}</p>
          </div>
          <TrendingUp size={32} className="opacity-80" />
        </div>

        <div className={`p-6 rounded-[24px] border flex items-center justify-between ${
          isDark ? 'bg-purple-500/5 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-900'
        }`}>
          <div>
            <span className="text-xs font-semibold opacity-80 block mb-1">Total de Comissões Repassadas</span>
            <p className="text-3xl font-extrabold">R$ {totalComissoesEquipe.toFixed(2)}</p>
          </div>
          <User size={32} className="opacity-80" />
        </div>
      </div>

      {/* Toolbar: Search, Metodo Filter & Quick Add Entry */}
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
            placeholder="Buscar por descrição, cliente ou profissional..."
            className={`w-full h-11 border rounded-2xl pl-11 pr-4 text-xs focus:outline-none transition-all ${
              isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white placeholder-[#6e6e73]' : 'bg-neutral-100 border-neutral-300 text-black'
            }`}
          />
        </div>

        {/* Filter by Payment Method */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={metodoFilter}
            onChange={(e) => setMetodoFilter(e.target.value)}
            className={`h-11 border rounded-2xl px-4 text-xs focus:outline-none font-semibold ${
              isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white' : 'bg-neutral-100 border-neutral-300 text-black'
            }`}
          >
            <option value="todos">Todos os Métodos</option>
            <option value="PIX">Apenas PIX</option>
            <option value="Cartão de Crédito">Apenas Cartão de Crédito</option>
            <option value="Cartão de Débito">Apenas Cartão de Débito</option>
            <option value="Dinheiro">Apenas Dinheiro</option>
          </select>

          {/* Quick Add Counter Entry */}
          <button
            disabled={isCaixaFechado}
            onClick={() => setIsNovoLancamentoModalOpen(true)}
            className={`h-11 px-5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-[0.98] ${
              isCaixaFechado
                ? 'opacity-40 cursor-not-allowed border-neutral-600 bg-neutral-800'
                : (isDark ? 'bg-white text-black hover:bg-neutral-200 border-white' : 'bg-black text-white hover:bg-neutral-800 border-black')
            }`}
          >
            <Plus size={16} /> Lançamento no Balcão
          </button>
        </div>

      </div>

      {/* Tabela de Lançamentos do Dia */}
      <div className={`rounded-[24px] border overflow-hidden ${
        isDark ? 'bg-[#121215]/90 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className={`border-b text-xs font-semibold ${
                isDark ? 'border-white/10 bg-white/5 text-neutral-300' : 'border-neutral-200 bg-neutral-50 text-neutral-600'
              }`}>
                <th className="p-4">Horário</th>
                <th className="p-4">Descrição do Atendimento</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Profissional</th>
                <th className="p-4">Método</th>
                <th className="p-4 text-right">Valor Bruto</th>
                <th className="p-4 text-right">Comissão Equipe</th>
                <th className="p-4 text-right">Saldo Casa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredLancamentos.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono opacity-70">{item.horario}</td>
                  <td className="p-4 font-bold">{item.descricao}</td>
                  <td className="p-4 opacity-80">{item.cliente}</td>
                  <td className="p-4 opacity-80">{item.profissional}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      item.metodo === 'PIX'
                        ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                        : item.metodo.includes('Cartão')
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {item.metodo}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold">R$ {item.valor.toFixed(2)}</td>
                  <td className="p-4 text-right font-semibold text-purple-400">R$ {item.valorComissao.toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-emerald-400">R$ {item.valorCasa.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL: NOVO LANÇAMENTO NO BALCÃO --- */}
      <AnimatePresence>
        {isNovoLancamentoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl">
                <div className={`rounded-[27px] p-6 sm:p-8 relative ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => { setIsNovoLancamentoModalOpen(false); resetForm(); }} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>

                  <h3 className="text-xl font-bold mb-1">Registrar Entrada no Balcão</h3>
                  <p className="text-xs opacity-60 mb-6">Receba pagamentos rápidos de serviços ou vendas no caixa.</p>

                  <form onSubmit={handleCreateLancamento} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Descrição do Atendimento / Produto *</label>
                      <input
                        type="text"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Ex: Corte Fade + Pomada, Tatuagem Flash"
                        className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Cliente (Opcional)</label>
                        <input
                          type="text"
                          value={cliente}
                          onChange={(e) => setCliente(e.target.value)}
                          placeholder="Cliente Balcão"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Profissional *</label>
                        <select
                          value={profissional}
                          onChange={(e) => setProfissional(e.target.value)}
                          className={`w-full h-11 border rounded-2xl px-3 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        >
                          <option value="Carlos Silva">Carlos Silva</option>
                          <option value="Ana Souza">Ana Souza</option>
                          <option value="Juliana Lima">Juliana Lima</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Valor Total (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
                          placeholder="80.00"
                          className={`w-full h-11 border rounded-2xl px-4 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1">Método de Pagamento *</label>
                        <select
                          value={metodo}
                          onChange={(e) => setMetodo(e.target.value as MetodoPagamento)}
                          className={`w-full h-11 border rounded-2xl px-3 text-xs focus:outline-none ${
                            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'
                          }`}
                        >
                          <option value="PIX">PIX</option>
                          <option value="Cartão de Crédito">Cartão de Crédito</option>
                          <option value="Cartão de Débito">Cartão de Débito</option>
                          <option value="Dinheiro">Dinheiro</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full font-semibold text-xs h-11 rounded-2xl transition-all mt-2 shadow-md ${
                        isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                      }`}
                    >
                      Confirmar Entrada no Caixa
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
