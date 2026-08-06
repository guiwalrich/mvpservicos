import { useState } from 'react';
import { ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Logo = ({ className = "w-7 h-7" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className={className}>
    <path d="M 60 90 C 60 70, 90 70, 90 90 L 90 130 C 90 150, 120 150, 130 130 L 140 110" 
          fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="90" cy="90" r="13" fill="currentColor"/>
    <circle cx="140" cy="56" r="10" fill="currentColor"/>
  </svg>
);

export default function Landing() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooked, setIsBooked] = useState(false);

  const demoSlots = ['09:00', '10:30', '14:00', '16:30'];

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300 font-sans selection:bg-white/20 overflow-x-hidden relative flex flex-col justify-between">
      
      {/* Volumetric ambient background light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[60%] rounded-full bg-gradient-to-br from-white/[0.03] to-transparent blur-[120px]" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[50%] rounded-full bg-gradient-to-bl from-white/[0.02] to-transparent blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-semibold text-white tracking-tight">
            <Logo className="w-8 h-8 text-white" />
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none">Agende.yo</span>
              <span className="text-[10px] text-neutral-500 font-medium tracking-wide mt-1 uppercase">Plataforma de Gestão</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="text-xs font-semibold text-neutral-400 hover:text-white px-4 py-2.5 rounded-xl transition-all"
            >
              Entrar
            </Link>
            <Link 
              to="/login?tab=registro" 
              className="text-xs font-bold bg-white text-black px-4.5 py-2.5 rounded-full hover:bg-neutral-200 transition-all shadow-sm"
            >
              Criar Conta Rápida
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 py-12 lg:py-20 my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
        
        {/* Left Column: Typographic Focus */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-500">
              DISCOVER AGENDE.YO
            </span>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.05]">
              Agendamento <br/>
              <span className="font-semibold">Descomplicado</span>
              <span className="text-neutral-500 text-xs sm:text-sm font-medium align-super ml-2 uppercase tracking-wider block sm:inline">
                Online 24h
              </span>
            </h1>
            
            <h2 className="text-3xl sm:text-5xl font-light text-neutral-400 tracking-tight leading-none">
              Gestão <span className="font-semibold text-white">Inteligente</span>
              <span className="text-neutral-500 text-xs sm:text-sm font-medium align-super ml-2 uppercase tracking-wider block sm:inline">
                SaaS
              </span>
            </h2>
          </div>

          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-xl font-light">
            Menos planilhas, mais faturamento. Dê aos seus clientes a liberdade de agendar serviços a qualquer hora pelo celular, enquanto você gerencia equipe, comissões e caixa de forma transparente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link 
              to="/agendar/demo" 
              target="_blank" 
              className="px-6 py-3.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xl backdrop-blur-md"
            >
              <span>Testar Página de Agendamento</span>
              <ExternalLink size={14} />
            </Link>

            <Link 
              to="/login" 
              className="px-6 py-3.5 bg-white text-black hover:bg-neutral-200 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Entrar no Painel Administrativo</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right Column: Premium Minimalist Live Mockup */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[360px] rounded-[32px] p-[1px] bg-gradient-to-b from-white/15 to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="rounded-[31px] bg-[#121215]/80 backdrop-blur-3xl p-6 border border-white/[0.04]">
              
              {/* Header Widget */}
              <div className="flex items-center gap-3 pb-5 border-b border-white/5 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                  AY
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Studio Agende.yo</h3>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Aberto • Agende online
                  </span>
                </div>
              </div>

              {/* Service Selection Preview */}
              <div className="space-y-3 mb-5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">
                  Escolha um Procedimento
                </span>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Corte de Cabelo Premium</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Duração: 45 min</p>
                  </div>
                  <span className="text-xs font-bold text-white">R$ 55,00</span>
                </div>
              </div>

              {/* Day / Time Slots Preview */}
              <div className="space-y-3 mb-6">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">
                  Selecione o Horário
                </span>
                
                <div className="grid grid-cols-4 gap-2">
                  {demoSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => {
                        if (!isBooked) setSelectedSlot(slot);
                      }}
                      className={`h-9 rounded-xl text-[11px] font-semibold transition-all ${
                        selectedSlot === slot
                          ? 'bg-white text-black font-bold'
                          : 'bg-white/[0.02] border border-white/[0.06] text-neutral-300 hover:bg-white/5'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {isBooked ? (
                <div className="w-full py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs text-center">
                  ✓ Agendamento Confirmado!
                </div>
              ) : (
                <button
                  disabled={!selectedSlot}
                  onClick={() => setIsBooked(true)}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all ${
                    selectedSlot
                      ? 'bg-white text-black hover:bg-neutral-200 shadow-md'
                      : 'bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  Confirmar Agendamento de Teste
                </button>
              )}

              <p className="text-[10px] text-neutral-500 text-center mt-3">
                Simulação em tempo real da página pública
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Minimalist Links */}
      <footer className="relative z-10 w-full border-t border-white/[0.04] bg-black/10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-4">
              Navegação
            </span>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/login" className="hover:text-white transition-colors">Acessar Painel</Link></li>
              <li><Link to="/agendar/demo" className="hover:text-white transition-colors">Página Pública</Link></li>
              <li><Link to="/login?tab=registro" className="hover:text-white transition-colors">Cadastrar Empresa</Link></li>
            </ul>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-4">
              Recursos
            </span>
            <ul className="space-y-2 text-xs font-medium">
              <li><span className="opacity-60">Agenda Timeline</span></li>
              <li><span className="opacity-60">Envio de WhatsApp</span></li>
              <li><span className="opacity-60">Gestão Financeira</span></li>
            </ul>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-4">
              Legal
            </span>
            <ul className="space-y-2 text-xs font-medium">
              <li><span className="opacity-60">Termos de Uso</span></li>
              <li><span className="opacity-60">Políticas de Cookies</span></li>
              <li><span className="opacity-60">Privacidade LGPD</span></li>
            </ul>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-4">
              Suporte
            </span>
            <ul className="space-y-2 text-xs font-medium">
              <li><span className="opacity-60">Central de Ajuda</span></li>
              <li><span className="opacity-60">WhatsApp Oficial</span></li>
              <li><span className="opacity-60">Contato Comercial</span></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <span>&copy; {new Date().getFullYear()} Agende.yo. Desenvolvido para máxima conversão.</span>
          <div className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>Conexão Segura SSL/LGPD</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
