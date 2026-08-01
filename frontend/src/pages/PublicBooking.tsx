import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Check,
  Loader2
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const Logo = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className={className}>
    <path d="M 60 90 C 60 70, 90 70, 90 90 L 90 130 C 90 150, 120 150, 130 130 L 140 110" 
          fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="90" cy="90" r="13" fill="currentColor"/>
    <circle cx="140" cy="56" r="10" fill="currentColor"/>
  </svg>
);

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-[0_20px_60px_rgba(0,0,0,0.9)] ${className}`}>
      <div className="rounded-[15px] bg-[#121215]/90 backdrop-blur-3xl h-full w-full">
        {children}
      </div>
    </div>
  );
}

const DEFAULT_SERVICES = [
  { id: '1', name: 'Corte + Barba Premium', duration: '50 min', price: 'R$ 80,00', desc: 'Corte tesoura/máquina com lavagem e alinhamento de barba.' },
  { id: '2', name: 'Avaliação Estética', duration: '30 min', price: 'R$ 150,00', desc: 'Análise completa de pele com recomendação de tratamento.' },
  { id: '3', name: 'Design de Sobrancelha', duration: '20 min', price: 'R$ 45,00', desc: 'Mapeamento facial e alinhamento preciso.' },
  { id: '4', name: 'Limpeza de Pele Profunda', duration: '60 min', price: 'R$ 120,00', desc: 'Remoção de impurezas, esfoliação e hidratação.' },
];

const DATES = [
  { day: 'Sex', date: '31', full: '31/07' },
  { day: 'Sáb', date: '01', full: '01/08' },
  { day: 'Seg', date: '03', full: '03/08' },
  { day: 'Ter', date: '04', full: '04/08' },
];

const SLOTS = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00', '18:30'];

export default function PublicBooking() {
  const { slug } = useParams();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Studio & Services from API
  const [studioName, setStudioName] = useState(slug ? slug.replace('-', ' ') : 'Studio Agende.yo');
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selections
  const [selectedService, setSelectedService] = useState(DEFAULT_SERVICES[0]);
  const [selectedDate, setSelectedDate] = useState(DATES[0]);
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Fetch Public Studio Data from Express API
  useEffect(() => {
    async function loadPublicStudio() {
      if (!slug) return;
      const res = await apiFetch(`/agendar-api/${slug}`);
      if (res.data) {
        if (res.data.nome) setStudioName(res.data.nome);
        if (res.data.servicos && Array.isArray(res.data.servicos) && res.data.servicos.length > 0) {
          const loaded = res.data.servicos.map((s: any) => ({
            id: s.id.toString(),
            name: s.nome,
            duration: `${s.duracao_minutos || 30} min`,
            price: `R$ ${Number(s.preco || 0).toFixed(2).replace('.', ',')}`,
            desc: s.descricao || 'Atendimento profissional personalizado.'
          }));
          setServices(loaded);
          setSelectedService(loaded[0]);
        }
      }
    }

    loadPublicStudio();
  }, [slug]);

  // Handle Real Public Booking Submission
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;
    setIsSubmitting(true);

    await apiFetch(`/agendar-api/${slug || 'studio-demo'}`, {
      method: 'POST',
      body: JSON.stringify({
        nome_cliente: clientName,
        telefone_cliente: clientPhone,
        servico_id: selectedService.id,
        data: selectedDate.full,
        horario: selectedTime
      })
    });

    setIsSubmitting(false);
    setStep(4);
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-white font-sans flex flex-col items-center justify-start p-4 sm:p-6 overflow-x-hidden selection:bg-white/20">
      
      {/* Volumetric Spotlight Ray */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-85"
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 82% -5%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.02) 60%, transparent 80%),
            conic-gradient(from 215deg at 78% 0%, rgba(255, 255, 255, 0.22) 0deg, rgba(255, 255, 255, 0.04) 28deg, transparent 55deg)
          `,
          filter: 'blur(20px)',
        }}
      />

      {/* Header Container */}
      <div className="relative z-10 w-full max-w-lg pt-6 pb-4">
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#1c1c20] border border-white/10 flex items-center justify-center text-white mb-3 shadow-xl">
            <Logo className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white capitalize">
            {studioName}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-[#8e8e93] mt-2">
            <Sparkles size={12} className="text-white" />
            Agendamento Conectado à API
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between px-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step >= s 
                  ? 'bg-white text-black shadow-md' 
                  : 'bg-[#1c1c20] text-[#8e8e93] border border-white/10'
              }`}>
                {step > s ? <Check size={14} /> : s}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step >= s ? 'text-white' : 'text-[#8e8e93]'}`}>
                {s === 1 && 'Serviço'}
                {s === 2 && 'Data & Hora'}
                {s === 3 && 'Seus Dados'}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Main Interactive Form Body */}
      <motion.div 
        key={step}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-lg mb-12"
      >
        
        {/* STEP 1: SELECT SERVICE */}
        {step === 1 && (
          <GlassCard>
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-white">Escolha o Serviço</h2>
                <p className="text-xs text-[#8e8e93] mt-1">Selecione qual procedimento deseja agendar.</p>
              </div>

              <div className="space-y-3">
                {services.map((service) => {
                  const isSelected = selectedService.id === service.id;
                  return (
                    <div 
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-white/10 border-white/40 shadow-lg' 
                          : 'bg-[#1c1c20]/60 border-white/[0.06] hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white">{service.name}</h3>
                          <span className="text-[10px] text-[#8e8e93] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{service.duration}</span>
                        </div>
                        <p className="text-xs text-[#8e8e93] mt-1">{service.desc}</p>
                        <p className="text-sm font-bold text-white mt-2">{service.price}</p>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-white border-white text-black' : 'border-white/20'
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full h-12 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
              >
                Avançar para Horários <ChevronRight size={16} />
              </button>
            </div>
          </GlassCard>
        )}

        {/* STEP 2: SELECT DATE & TIME */}
        {step === 2 && (
          <GlassCard>
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Data e Horário</h2>
                  <p className="text-xs text-[#8e8e93] mt-1">Selecione quando prefere ser atendido.</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-[#8e8e93] hover:text-white flex items-center gap-1">
                  <ArrowLeft size={14} /> Voltar
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8e8e93] mb-3">Dias Disponíveis</label>
                <div className="grid grid-cols-4 gap-2">
                  {DATES.map((d) => {
                    const isSelected = selectedDate.date === d.date;
                    return (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDate(d)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected 
                            ? 'bg-white text-black border-white font-semibold' 
                            : 'bg-[#1c1c20] text-neutral-300 border-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <p className="text-[10px] uppercase font-medium">{d.day}</p>
                        <p className="text-base font-bold mt-0.5">{d.date}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8e8e93] mb-3">Horários Livres em {selectedDate.full}</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {SLOTS.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`h-11 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected 
                            ? 'bg-white text-black border-white shadow-md' 
                            : 'bg-[#1c1c20] text-neutral-200 border-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={() => setStep(3)}
                className="w-full h-12 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
              >
                Preencher Meus Dados <ChevronRight size={16} />
              </button>
            </div>
          </GlassCard>
        )}

        {/* STEP 3: CLIENT DETAILS */}
        {step === 3 && (
          <GlassCard>
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Seus Dados</h2>
                  <p className="text-xs text-[#8e8e93] mt-1">Informe seu nome e WhatsApp para a confirmação.</p>
                </div>
                <button onClick={() => setStep(2)} className="text-xs text-[#8e8e93] hover:text-white flex items-center gap-1">
                  <ArrowLeft size={14} /> Voltar
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#1c1c20] border border-white/[0.06] space-y-1">
                <p className="text-xs font-semibold text-white">{selectedService.name}</p>
                <p className="text-xs text-[#8e8e93]">
                  {selectedDate.full} às {selectedTime} • {selectedService.price}
                </p>
              </div>

              <form onSubmit={handleConfirm} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">Seu Nome Completo</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Gabriel Monteiro"
                    className="w-full h-12 bg-[#1c1c20] border border-white/[0.06] focus:border-white/20 rounded-2xl px-4 text-xs text-white placeholder-[#6e6e73] focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">Seu WhatsApp (com DDD)</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full h-12 bg-[#1c1c20] border border-white/[0.06] focus:border-white/20 rounded-2xl px-4 text-xs text-white placeholder-[#6e6e73] focus:outline-none transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-2xl flex items-center justify-center transition-all active:scale-[0.98] mt-4"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Finalizar e Salvar no Banco'}
                </button>
              </form>
            </div>
          </GlassCard>
        )}

        {/* STEP 4: CONFIRMATION SUCCESS */}
        {step === 4 && (
          <GlassCard>
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto text-white shadow-xl">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Agendamento Confirmado!</h2>
                <p className="text-xs text-[#8e8e93]">
                  Seu agendamento foi salvo no banco de dados e notificado para <br/>
                  <span className="font-semibold text-white">{clientPhone}</span>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c1c20] border border-white/[0.06] text-left space-y-2">
                <p className="text-xs text-[#8e8e93]">RESUMO DO AGENDAMENTO</p>
                <p className="text-sm font-semibold text-white">{selectedService.name}</p>
                <p className="text-xs text-[#8e8e93]">Data: <span className="text-white">{selectedDate.full}</span></p>
                <p className="text-xs text-[#8e8e93]">Horário: <span className="text-white">{selectedTime}</span></p>
                <p className="text-xs text-[#8e8e93]">Valor: <span className="text-white font-semibold">{selectedService.price}</span></p>
              </div>

              <button 
                onClick={() => setStep(1)}
                className="w-full h-12 bg-[#1c1c20] hover:bg-white/10 border border-white/[0.06] text-white font-medium text-xs rounded-2xl transition-all"
              >
                Fazer Outro Agendamento
              </button>
            </div>
          </GlassCard>
        )}

      </motion.div>
    </div>
  );
}
