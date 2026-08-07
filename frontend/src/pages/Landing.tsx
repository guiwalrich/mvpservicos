import { useState, useEffect } from 'react';
import { ArrowRight, ExternalLink, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const demoSlots = ['09:00', '10:30', '14:00', '16:30'];

  const [isMobile, setIsMobile] = useState(true);

  // Detecta mobile/touch no carregamento do cliente
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Captura posição do mouse para efeito magnético sutil (apenas desktop)
  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Partículas dinâmicas e determinísticas em React + Framer Motion
  const particles = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    size: (i % 3) * 2 + 2,
    x: (i * 7) % 100,
    y: (i * 11) % 100,
    duration: 12 + (i % 5) * 4,
    delay: (i % 4) * 1.5,
  }));

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300 font-sans selection:bg-white/20 overflow-x-hidden relative flex flex-col justify-between">
      
      {/* 21st.dev Grid Background Overlay */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Volumetric ambient background light with smooth float animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-[30%] -left-[10%] w-[70%] h-[60%] rounded-full bg-gradient-to-br from-white/[0.04] to-transparent blur-[80px]"
        />
        <motion.div
          style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          animate={{
            x: [0, -30, 30, 0],
            y: [0, 40, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[30%] -right-[20%] w-[60%] h-[50%] rounded-full bg-gradient-to-bl from-white/[0.02] to-transparent blur-[70px]"
        />
      </div>

      {/* 21st.dev Style Floating Particles (Desativado em celulares para performance e evitar crashes de GPU) */}
      {!isMobile && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white/[0.07] pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
              animate={{
                y: ['0px', '-100px', '0px'],
                x: ['0px', '25px', '0px'],
                opacity: [0.15, 0.6, 0.15],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-semibold text-white tracking-tight">
            <Logo className="w-8 h-8 text-white" />
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none">Agende.yo</span>
              <span className="text-[10px] text-neutral-500 font-medium tracking-wide mt-1 uppercase">Plataforma de Gestão</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              to="/login" 
              className="text-xs font-semibold text-neutral-400 hover:text-white px-4 py-2.5 rounded-xl transition-all"
            >
              Entrar
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link 
                to="/login?tab=registro" 
                className="text-[11px] sm:text-xs font-bold bg-white text-black px-3.5 sm:px-4.5 py-2.5 rounded-full hover:bg-neutral-200 transition-all shadow-sm whitespace-nowrap"
              >
                <span className="sm:hidden">Cadastrar</span>
                <span className="hidden sm:inline">Criar Conta Rápida</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Main Section */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 lg:py-14 my-auto space-y-24">
        
        {/* Hero Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          
          {/* Left Column: Typographic Focus */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.03] text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 backdrop-blur-sm"
              >
                <Sparkles size={11} className="text-white animate-pulse" />
                <span>DESCUBRA O FUTURO DA AGENDA</span>
              </motion.div>
              
              <h1 className="text-3xl sm:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.05]">
                Agendamento <br/>
                <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">Descomplicado</span>
                <span className="text-neutral-500 text-xs sm:text-sm font-medium align-super ml-2 uppercase tracking-wider block sm:inline">
                  Online 24h
                </span>
              </h1>
              
              <h2 className="text-2xl sm:text-5xl font-light text-neutral-400 tracking-tight leading-none">
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
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link 
                  to="/agendar/demo" 
                  target="_blank" 
                  className="px-6 py-3.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xl backdrop-blur-md w-full"
                >
                  <span>Testar Página de Agendamento</span>
                  <ExternalLink size={14} />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link 
                  to="/login" 
                  className="px-6 py-3.5 bg-white text-black hover:bg-neutral-200 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg w-full"
                >
                  <span>Entrar no Painel Administrativo</span>
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: Premium Minimalist Live Mockup (Magnetic Hover Effect) */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              rotateX: isMobile ? 0 : mousePosition.y * 0.3,
              rotateY: isMobile ? 0 : -mousePosition.x * 0.3 
            }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`lg:col-span-5 flex justify-center ${isMobile ? '' : 'perspective-1000'}`}
          >
            <div className="relative w-full max-w-[360px] rounded-[32px] p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              {/* Border Beam light ray styling */}
              <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute -inset-px opacity-30 bg-[linear-gradient(90deg,transparent,#ffffff,transparent)] bg-[length:200%_100%]"
                />
              </div>

              <div 
                style={{ WebkitBackdropFilter: 'blur(24px)' }}
                className="rounded-[31px] bg-[#121215]/85 backdrop-blur-3xl p-4 sm:p-6 border border-white/[0.04]"
              >
                
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
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs text-center"
                  >
                    ✓ Agendamento Confirmado!
                  </motion.div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    disabled={!selectedSlot}
                    onClick={() => setIsBooked(true)}
                    className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all ${
                      selectedSlot
                        ? 'bg-white text-black hover:bg-neutral-200 shadow-md'
                        : 'bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    Confirmar Agendamento de Teste
                  </motion.button>
                )}

                <p className="text-[10px] text-neutral-500 text-center mt-3">
                  Simulação em tempo real da página pública
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pricing / Plan Section (Scroll Reveal) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="border-t border-white/5 pt-16 space-y-12"
        >
          <div className="text-center space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-500">
              VALOR TRANSPARENTE
            </span>
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-none">
              Planos <span className="font-semibold">Simples & Diretos</span>
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-md mx-auto">
              Sem taxas escondidas, sem contratos abusivos. Cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Card 1: Trial */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-6 rounded-[28px] border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-400">Plano de Teste</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-white/5 border border-white/5 text-neutral-300">14 Dias Grátis</span>
                </div>
                <h3 className="text-3xl font-light text-white leading-none">
                  Grátis <span className="text-xs text-neutral-500">/ trial</span>
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed font-light">
                  Aproveite todos os recursos liberados da plataforma para testar com seus clientes reais no seu estabelecimento.
                </p>
                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Nenhum cartão exigido</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Recursos ilimitados ativos</span>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/login?tab=registro" 
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs text-center transition-all block"
              >
                Experimentar Grátis
              </Link>
            </motion.div>

            {/* Card 2: Premium */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-6 rounded-[28px] border border-emerald-500/20 bg-white/[0.02] hover:bg-white/[0.03] transition-all flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles size={12} /> Plano Pro Completo
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Recomendado</span>
                </div>
                <h3 className="text-3xl font-bold text-white leading-none flex items-baseline gap-1">
                  R$ 49,90 <span className="text-xs text-neutral-500 font-light">/ mês</span>
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed font-light">
                  Acesso completo à plataforma para gerenciar seu estabelecimento de forma comercial e profissional.
                </p>
                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Disparador WhatsApp ilimitado</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Profissionais e serviços ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Caixa financeiro e relatórios dinâmicos</span>
                  </div>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  to="/login?tab=registro" 
                  className="w-full py-3 rounded-2xl bg-white text-black font-bold text-xs text-center transition-all block shadow-md hover:bg-neutral-200"
                >
                  Começar com Plano Completo
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

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
