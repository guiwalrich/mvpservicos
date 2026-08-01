import React, { useRef, useState } from 'react';
import { ArrowRight, Calendar, CheckCircle2, Clock, Smartphone, Users, LayoutDashboard, ChevronDown, Check, Star, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Logo = ({ className = "w-7 h-7" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className={className}>
    <path d="M 60 90 C 60 70, 90 70, 90 90 L 90 130 C 90 150, 120 150, 130 130 L 140 110" 
          fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="90" cy="90" r="13" fill="currentColor"/>
    <circle cx="140" cy="56" r="10" fill="currentColor"/>
  </svg>
);

// --- 21st.dev Style Components ---

function SpotlightCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={() => { setIsFocused(true); setOpacity(1); }}
      onBlur={() => { setIsFocused(false); setOpacity(0); }}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative rounded-3xl border border-white/10 bg-[#0a0a0a] overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.08), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

function ShimmerButton({ children, href = "#" }: { children: React.ReactNode, href?: string }) {
  return (
    <a href={href} className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md bg-white px-8 py-3.5 font-medium text-black transition-transform hover:scale-[1.02] active:scale-[0.98]">
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 z-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
        <div className="relative h-full w-8 bg-white/40" />
      </div>
    </a>
  );
}

function AccordionItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-6 flex items-center justify-between text-left focus:outline-none group">
        <span className="text-lg font-medium text-neutral-200 group-hover:text-white transition-colors">{question}</span>
        <ChevronDown className={`text-neutral-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-6 text-neutral-400">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Border Beam effect wrapper
function BorderBeamMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl p-[1px] overflow-hidden group">
      {/* Spinning gradient border */}
      <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#000000_50%,#ffffff_100%)] opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative rounded-[15px] bg-[#0a0a0a] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function Landing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-300 font-sans selection:bg-white/20 overflow-x-hidden">
      
      {/* High-end Grid Background */}
      <div className="fixed inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.08] bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-semibold text-white tracking-tight">
            <div className="text-white flex items-center justify-center">
              <Logo className="w-8 h-8" />
            </div>
            Agende.yo
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/dashboard" className="text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Painel Dashboard
            </Link>
            <Link to="/agendar/studio-demo" className="text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
              Visão do Cliente <ExternalLink size={12} />
            </Link>
            <Link to="/login" className="text-xs sm:text-sm font-medium bg-white text-black px-4 py-2 rounded-md hover:bg-neutral-200 transition-colors">
              Entrar / Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 relative z-10">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-neutral-300 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Sistema Oficial Lançado
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-[5.5rem] font-medium tracking-tighter text-white max-w-5xl mx-auto leading-[1.05]"
          >
            Sua agenda operando no <br className="hidden md:block" />
            <span className="animate-[shimmer_3s_linear_infinite] bg-[linear-gradient(110deg,#a3a3a3,45%,#ffffff,55%,#a3a3a3)] bg-[length:200%_100%] bg-clip-text text-transparent">piloto automático.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed"
          >
            A plataforma definitiva para profissionais que exigem excelência. Agendamentos online, lembretes via WhatsApp e controle financeiro absoluto.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <ShimmerButton href="/login">
              Acessar Tela de Login <ArrowRight size={16} />
            </ShimmerButton>
            <Link to="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border border-white/10 text-white px-8 py-3.5 rounded-md font-medium hover:bg-white/5 transition-colors">
              Ver o Dashboard Interno
            </Link>
            <Link to="/agendar/studio-demo" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-neutral-300 px-6 py-3.5 rounded-md text-sm font-medium hover:text-white hover:bg-white/10 transition-colors">
              Página do Cliente <ExternalLink size={14} />
            </Link>
          </motion.div>
        </section>

        {/* Realistic Dark Dashboard Mockup (With Border Beam) */}
        <motion.section 
          id="dashboard"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-5xl mx-auto px-6 mt-20"
        >
           <BorderBeamMockup>
             {/* MacOS Style Header */}
             <div className="h-10 border-b border-white/5 bg-[#0f0f0f] flex items-center px-4 gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                </div>
             </div>

             {/* UI Mockup Content */}
             <div className="flex h-[450px]">
                {/* Sidebar */}
                <div className="w-64 border-r border-white/5 p-4 space-y-1 hidden md:block bg-[#050505]">
                  <div className="text-[10px] font-semibold text-neutral-600 mb-4 px-2 uppercase tracking-widest">Workspace</div>
                  <div className="flex items-center gap-3 p-2.5 rounded bg-white/10 text-white font-medium text-sm border border-white/5"><LayoutDashboard size={16}/> Visão Geral</div>
                  <div className="flex items-center gap-3 p-2.5 rounded text-neutral-500 font-medium text-sm"><Calendar size={16}/> Calendário</div>
                  <div className="flex items-center gap-3 p-2.5 rounded text-neutral-500 font-medium text-sm"><Users size={16}/> Clientes</div>
                </div>
                
                {/* Main Content Area */}
                <div className="flex-1 p-8 bg-[#0a0a0a]">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-lg font-medium text-white">Boa tarde, Profissional</h3>
                      <p className="text-sm text-neutral-500 mt-1">Sexta-feira, 24 de Outubro</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                     <div className="p-4 bg-[#0f0f0f] border border-white/5 rounded-xl">
                       <p className="text-[11px] text-neutral-500 font-medium mb-1 uppercase tracking-widest">Agendamentos</p>
                       <p className="text-2xl font-semibold text-white">12</p>
                     </div>
                     <div className="p-4 bg-[#0f0f0f] border border-white/5 rounded-xl">
                       <p className="text-[11px] text-neutral-500 font-medium mb-1 uppercase tracking-widest">Receita do Dia</p>
                       <p className="text-2xl font-semibold text-white">R$ 840,00</p>
                     </div>
                     <div className="p-4 bg-[#0f0f0f] border border-white/5 rounded-xl">
                       <p className="text-[11px] text-neutral-500 font-medium mb-1 uppercase tracking-widest">Taxa de Presença</p>
                       <p className="text-2xl font-semibold text-white">100%</p>
                     </div>
                  </div>

                  <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/5 text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
                      Próximos Atendimentos
                    </div>
                    <div className="divide-y divide-white/5">
                      {[
                        { time: '14:00', name: 'Carlos Silva', service: 'Corte Premium', status: 'Confirmado' },
                        { time: '15:30', name: 'Ana Souza', service: 'Avaliação Inicial', status: 'Aguardando' }
                      ].map((item, i) => (
                        <div key={i} className="px-5 py-3 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <div className="text-sm font-medium text-white w-12">{item.time}</div>
                             <div>
                               <div className="text-sm font-medium text-neutral-200">{item.name}</div>
                               <div className="text-[11px] text-neutral-500 mt-0.5">{item.service}</div>
                             </div>
                           </div>
                           <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Confirmado' ? 'bg-white' : 'bg-neutral-600'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
           </BorderBeamMockup>
        </motion.section>

        {/* 21st.dev Style Infinite Marquee */}
        <div className="mt-32 overflow-hidden whitespace-nowrap relative before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-40 before:bg-gradient-to-r before:from-[#000000] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-40 after:bg-gradient-to-l after:from-[#000000] after:to-transparent">
           <div className="inline-block animate-[marquee_30s_linear_infinite]">
             {[...Array(2)].map((_, index) => (
                <div key={index} className="inline-flex items-center gap-20 px-10 text-neutral-600 font-medium tracking-widest text-xs uppercase">
                  <span>Barbearias</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-800"></span>
                  <span>Estúdios de Tatuagem</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-800"></span>
                  <span>Clínicas Médicas</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-800"></span>
                  <span>Consultórios</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-800"></span>
                  <span>Salões de Beleza</span>
                </div>
             ))}
           </div>
        </div>

        {/* Advanced Bento Grid with Spotlight */}
        <section className="max-w-6xl mx-auto px-6 mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight">Arquitetura de alta performance.</h2>
            <p className="text-neutral-400 mt-4 text-lg">Projetado para eliminar 100% do seu trabalho braçal.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <SpotlightCard className="p-8 md:col-span-2">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-white border border-white/10">
                    <Smartphone size={20} />
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-2">Agendamento autônomo</h3>
                  <p className="text-neutral-400 leading-relaxed max-w-md">
                    Você recebe um link exclusivo. O cliente acessa, vê sua disponibilidade real, escolhe o serviço e agenda em 3 toques. Zero troca de mensagens.
                  </p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-8">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-white border border-white/10">
                  <Clock size={20} />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Lembretes WhatsApp</h3>
                <p className="text-neutral-400 leading-relaxed text-sm">
                  Disparos automáticos no WhatsApp do cliente antes do horário. Faltas praticamente erradicadas.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-8">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-white border border-white/10">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Controle Financeiro</h3>
                <p className="text-neutral-400 leading-relaxed text-sm">
                  Acompanhamento de faturamento em tempo real. Saiba a saúde financeira do negócio em segundos.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-8 md:col-span-2">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-white border border-white/10">
                  <Users size={20} />
                </div>
                <h3 className="text-2xl font-medium text-white mb-2">CRM Completo</h3>
                <p className="text-neutral-400 leading-relaxed max-w-md">
                  Fichas individuais. Histórico de visitas, serviços favoritos, ticket médio e anotações internas para entregar um atendimento hiper-personalizado.
                </p>
              </div>
            </SpotlightCard>
          </div>
        </section>

        {/* Testimonials / Review Marquee */}
        <section className="mt-40 overflow-hidden relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium text-white">Validado por centenas de negócios</h2>
          </div>
          
          <div className="relative before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-40 before:bg-gradient-to-r before:from-[#000000] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-40 after:bg-gradient-to-l after:from-[#000000] after:to-transparent">
            <div className="inline-block animate-[marquee_40s_linear_infinite] whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="inline-flex gap-6 px-3">
                  {[
                    { name: "Dr. Marcos", role: "Clínica Odonto", text: "Zerei as faltas na clínica depois que ativei os lembretes." },
                    { name: "Amanda Silva", role: "Estética Avançada", text: "Minha agenda vive lotada e eu não perco mais tempo no WhatsApp." },
                    { name: "Barbearia do João", role: "Barbearia", text: "O melhor sistema do mercado. O visual passa muita credibilidade." },
                    { name: "Tattoo Studio XYZ", role: "Tatuador", text: "Ter o controle do faturamento automático mudou minha vida." }
                  ].map((review, idx) => (
                    <div key={idx} className="w-[350px] p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 whitespace-normal">
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className="fill-white text-white" />)}
                      </div>
                      <p className="text-neutral-300 text-sm mb-4 leading-relaxed">"{review.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <div>
                          <p className="text-sm font-medium text-white">{review.name}</p>
                          <p className="text-xs text-neutral-500">{review.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Pricing with Toggle */}
        <section className="max-w-4xl mx-auto px-6 mt-40 text-center">
          <h2 className="text-4xl font-medium text-white mb-4 tracking-tight">Investimento inteligente.</h2>
          <p className="text-neutral-400 mb-10">O sistema se paga evitando apenas 1 falta no mês.</p>
          
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-neutral-500'}`}>Mensal</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-6 rounded-full bg-white/10 relative p-1 transition-colors"
            >
              <motion.div 
                layout
                className="w-4 h-4 bg-white rounded-full"
                animate={{ x: isAnnual ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-neutral-500'}`}>Anual (20% Off)</span>
          </div>
          
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 max-w-sm mx-auto text-left relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-medium text-white mb-2">Premium</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-semibold text-white">
                  R$ {isAnnual ? '31,90' : '39,90'}
                </span>
                <span className="text-neutral-500 font-medium">/mês</span>
              </div>
              <p className="text-neutral-500 mb-8 text-sm">
                {isAnnual ? 'Faturado anualmente (R$ 382,80)' : 'Cancele quando quiser.'}
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "Agendamentos ilimitados",
                  "Lembretes automáticos",
                  "Módulo Financeiro",
                  "Histórico de CRM",
                  "Suporte Prioritário"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300 text-sm font-medium">
                    <Check className="text-white" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <ShimmerButton href="/login">
                Assinar Agora
              </ShimmerButton>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-6 mt-40">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium text-white tracking-tight">Dúvidas Frequentes</h2>
          </div>
          <div className="border-t border-white/10">
            <AccordionItem question="Preciso instalar algum aplicativo no celular?" answer="Não. O Agende.yo roda 100% na nuvem. Você e seus clientes podem acessar de qualquer navegador, pelo celular ou computador." />
            <AccordionItem question="O sistema envia os lembretes sozinho?" answer="Sim. O sistema dispara mensagens automáticas no WhatsApp para o cliente lembrando-o do serviço." />
          </div>
        </section>

        {/* Final Pre-Footer CTA */}
        <section className="max-w-5xl mx-auto px-6 mt-40 mb-20 text-center">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)] pointer-events-none" />
            <h2 className="text-4xl font-medium text-white mb-6 relative z-10">Pronto para transformar sua agenda?</h2>
            <p className="text-neutral-400 mb-8 max-w-xl mx-auto relative z-10">Junte-se aos melhores profissionais do mercado. Configure sua conta em 2 minutos e automatize tudo.</p>
            <ShimmerButton href="/login">Criar Conta Gratuita</ShimmerButton>
          </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#000000] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Logo className="w-5 h-5" /> Agende.yo
          </div>
          <div className="text-xs text-neutral-600 font-medium tracking-widest uppercase">
            © 2026 AGENDE.YO. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
