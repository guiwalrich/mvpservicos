import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Sparkles,
  Settings,
  Plus,
  ExternalLink,
  DollarSign,
  TrendingUp,
  X,
  Phone,
  ChevronRight,
  UserCheck,
  Menu,
  Loader2,
  Sun,
  Moon,
  Bell,
  CheckCheck,
  MessageSquare,
  Search,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import AgendaInteligente from '../components/AgendaInteligente';
import CrmClientes from '../components/CrmClientes';
import GestaoServicos from '../components/GestaoServicos';
import GestaoProfissionais from '../components/GestaoProfissionais';
import CaixaDiario from '../components/CaixaDiario';
import ModuloComunicacao from '../components/ModuloComunicacao';
import RelatoriosObjetivos from '../components/RelatoriosObjetivos';
import OnboardingWizard from '../components/OnboardingWizard';
import LocationInput from '../components/LocationInput';

const Logo = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className={className}>
    <path d="M 60 90 C 60 70, 90 70, 90 90 L 90 130 C 90 150, 120 150, 130 130 L 140 110" 
          fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="90" cy="90" r="13" fill="currentColor"/>
    <circle cx="140" cy="56" r="10" fill="currentColor"/>
  </svg>
);

// FASE 1 Internal Notifications
const INITIAL_NOTIFICATIONS = [
  { id: '1', title: 'Boas-vindas ao Agende.yo', desc: 'Sua conta foi inicializada com sucesso.', time: 'Agora', read: false },
];

export const DEMO_APPOINTMENTS: any[] = [];
export const DEMO_SERVICES: any[] = [];
export const DEMO_CLIENTS: any[] = [];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { theme } = useTheme();
  return (
    <div className={`relative rounded-2xl p-[1px] ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-white/30 via-white/10 to-white/[0.02] shadow-[0_20px_60px_rgba(0,0,0,0.8)]' 
        : 'bg-neutral-200 border border-neutral-300 shadow-sm'
    } ${className}`}>
      <div className={`rounded-[15px] h-full w-full ${
        theme === 'dark' ? 'bg-[#121215]/90 backdrop-blur-3xl' : 'bg-white'
      }`}>
        {children}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'agenda' | 'servicos' | 'profissionais' | 'clientes' | 'caixa' | 'comunicacao' | 'relatorios' | 'configuracoes'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // Estado de Permissões RBAC (FASE 11)
  const [userRole, setUserRole] = useState<'DONO' | 'PROFISSIONAL'>('DONO');
  const [activeProfissionalId] = useState<string>('1'); // Carlos Silva

  // Identifica a Conta Ativa do Usuário Logado
  const empresaLogada = JSON.parse(localStorage.getItem('empresa') || '{}');
  const userAccountKey = empresaLogada.email ? empresaLogada.email.replace(/[^a-zA-Z0-9]/g, '_') : 'default_account';

  // Estado da Empresa em Configurações (Preenchido com a Conta Real do Usuário)
  const [empresaNome, setEmpresaNome] = useState(empresaLogada.nome || 'Meu Estabelecimento');
  const [empresaSlug, setEmpresaSlug] = useState(empresaLogada.slug || 'meu-estabelecimento');
  const [empresaEndereco, setEmpresaEndereco] = useState(empresaLogada.endereco || '');
  const [empresaTelefone, setEmpresaTelefone] = useState(empresaLogada.telefone || empresaLogada.whatsapp || '');
  const [empresaFotoUrl, setEmpresaFotoUrl] = useState<string>(empresaLogada.iconUrl || '');
  const [empresaLat, setEmpresaLat] = useState<number | undefined>(undefined);
  const [empresaLng, setEmpresaLng] = useState<number | undefined>(undefined);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [configSalvaToast, setConfigSalvaToast] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Checa URL para parametro tab=configuracoes ou novoRascunho
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const rascunhoParam = params.get('novoRascunho');
    if (tabParam === 'configuracoes' || rascunhoParam === 'true') {
      setActiveTab('configuracoes');
    }
  }, []);

  // Sincroniza dados reais do perfil da Empresa via Backend
  useEffect(() => {
    apiFetch('/configuracoes/empresa')
      .then(res => {
        const data = res.data;
        if (data && data.id) {
          if (data.nome) setEmpresaNome(data.nome);
          if (data.slug) setEmpresaSlug(data.slug);
          if (data.endereco) setEmpresaEndereco(data.endereco);
          if (data.telefone) setEmpresaTelefone(data.telefone);
          if (data.iconUrl) setEmpresaFotoUrl(data.iconUrl);
          if (data.latitude) setEmpresaLat(data.latitude);
          if (data.longitude) setEmpresaLng(data.longitude);

          // Sincroniza localStorage com dados reais do backend
          const emp = JSON.parse(localStorage.getItem('empresa') || '{}');
          const merged = {
            ...emp,
            nome: data.nome || emp.nome,
            slug: data.slug || emp.slug,
            endereco: data.endereco || emp.endereco,
            telefone: data.telefone || emp.telefone,
            iconUrl: data.iconUrl || emp.iconUrl,
            latitude: data.latitude,
            longitude: data.longitude,
          };
          localStorage.setItem('empresa', JSON.stringify(merged));
        }
      })
      .catch(() => {});
  }, []);
  
  // State: Listas de Dados Dinâmicos da Empresa (Começam 100% LIMPOS/ZERADOS para Novos Usuários)
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  
  const [appointments, setAppointments] = useState<any[]>(() => {
    const saved = localStorage.getItem(`agendamentos_${userAccountKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [services, setServices] = useState<any[]>(() => {
    const saved = localStorage.getItem(`servicos_${userAccountKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [clients, setClients] = useState<any[]>(() => {
    const saved = localStorage.getItem(`clientes_${userAccountKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // State: UX & Onboarding
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  // New Appointment Form
  const [newClient, setNewClient] = useState('');
  const [newService, setNewService] = useState('');
  const [newTime, setNewTime] = useState('11:00');

  // New Service Form
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('30 min');

  // Unread Count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Atualiza persistência por conta de usuário
  useEffect(() => {
    localStorage.setItem(`agendamentos_${userAccountKey}`, JSON.stringify(appointments));
  }, [appointments, userAccountKey]);

  useEffect(() => {
    localStorage.setItem(`servicos_${userAccountKey}`, JSON.stringify(services));
  }, [services, userAccountKey]);

  useEffect(() => {
    localStorage.setItem(`clientes_${userAccountKey}`, JSON.stringify(clients));
  }, [clients, userAccountKey]);

  useEffect(() => {
    async function loadDashboardData() {
      const [svcRes, appRes, cliRes] = await Promise.all([
        apiFetch('/servicos'),
        apiFetch('/agendamentos'),
        apiFetch('/clientes')
      ]);

      if (svcRes.data && Array.isArray(svcRes.data) && svcRes.data.length > 0) {
        setServices(svcRes.data.map((s: any) => ({
          id: s.id.toString(),
          name: s.nome,
          duration: `${s.duracao_minutos || 30} min`,
          price: Number(s.preco || 0).toFixed(2).replace('.', ','),
          active: s.ativo
        })));
      }

      if (appRes.data && Array.isArray(appRes.data) && appRes.data.length > 0) {
        setAppointments(appRes.data.map((a: any) => ({
          id: a.id.toString(),
          client: a.cliente?.nome || a.nome_cliente || 'Cliente',
          service: a.servico?.nome || 'Atendimento',
          time: a.horario_inicio || '10:00',
          date: a.data || '2026-07-31',
          price: `R$ ${Number(a.valor || 0).toFixed(2).replace('.', ',')}`,
          status: a.status || 'Confirmado',
          phone: a.cliente?.telefone || '(11) 99999-9999'
        })));
      }

      if (cliRes.data && Array.isArray(cliRes.data) && cliRes.data.length > 0) {
        setClients(cliRes.data.map((c: any) => ({
          id: c.id.toString(),
          name: c.nome,
          phone: c.telefone || '(11) 99999-9999',
          email: c.email || 'cliente@email.com',
          totalVisits: c._count?.agendamentos || 1,
          lastVisit: 'Recente'
        })));
      }
    }

    loadDashboardData();
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient) return;
    setIsSubmitting(true);

    const selectedSvc = services.find(s => s.name === newService);
    const res = await apiFetch('/agendamentos', {
      method: 'POST',
      body: JSON.stringify({
        nome_cliente: newClient,
        servico_nome: newService,
        horario: newTime,
        data: '2026-07-31',
        valor: selectedSvc ? selectedSvc.price : '50,00'
      })
    });

    setIsSubmitting(false);
    const item = {
      id: res.data?.id ? res.data.id.toString() : Date.now().toString(),
      client: newClient,
      service: newService,
      time: newTime,
      date: '2026-07-31',
      price: `R$ ${selectedSvc ? selectedSvc.price : '50,00'}`,
      status: 'Confirmado',
      phone: '(11) 99999-9999'
    };

    setAppointments([item, ...appointments]);
    setIsNewAppointmentOpen(false);
    setNewClient('');
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !servicePrice) return;
    setIsSubmitting(true);

    const res = await apiFetch('/servicos', {
      method: 'POST',
      body: JSON.stringify({
        nome: serviceName,
        preco: parseFloat(servicePrice.replace(',', '.')),
        duracao_minutos: parseInt(serviceDuration) || 30
      })
    });

    setIsSubmitting(false);
    const item = {
      id: res.data?.id ? res.data.id.toString() : Date.now().toString(),
      name: serviceName,
      duration: serviceDuration,
      price: servicePrice,
      active: true
    };

    setServices([...services, item]);
    setIsNewServiceOpen(false);
    setServiceName('');
    setServicePrice('');
  };

  const isDark = theme === 'dark';

  return (
    <div className={`relative min-h-screen font-sans flex overflow-hidden selection:bg-white/20 ${
      isDark ? 'bg-[#000000] text-white' : 'bg-neutral-50 text-neutral-900'
    }`}>
      
      {/* Volumetric Spotlight Ray (Dark Mode) */}
      {isDark && (
        <div 
          className="pointer-events-none fixed inset-0 z-0 opacity-80"
          style={{
            background: `
              radial-gradient(ellipse 65% 55% at 82% -5%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.01) 60%, transparent 80%),
              conic-gradient(from 215deg at 78% 0%, rgba(255, 255, 255, 0.18) 0deg, rgba(255, 255, 255, 0.03) 28deg, transparent 55deg)
            `,
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* --- FASE 1: Sidebar Navigation --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
        isDark ? 'bg-[#0c0c0e]/95 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div>
          {/* Logo Header */}
          <div className={`h-16 px-6 border-b flex items-center justify-between ${
            isDark ? 'border-white/10' : 'border-neutral-200'
          }`}>
            <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
              <Logo className="w-7 h-7" />
              <span className="text-lg">Agende.yo</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden opacity-60 hover:opacity-100">
              <X size={20} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
              { id: 'agenda', label: 'Agenda & Horários', icon: CalendarIcon },
              { id: 'servicos', label: 'Serviços', icon: Sparkles, roles: ['DONO'] },
              { id: 'profissionais', label: 'Equipe & Profissionais', icon: UserCheck, roles: ['DONO'] },
              { id: 'clientes', label: 'Clientes (CRM)', icon: Users },
              { id: 'caixa', label: 'Caixa Diário', icon: DollarSign, roles: ['DONO'] },
              { id: 'comunicacao', label: 'Comunicação & Mensagens', icon: MessageSquare, roles: ['DONO'] },
              { id: 'relatorios', label: 'Relatórios Objetivos', icon: BarChart3, roles: ['DONO'] },
              { id: 'configuracoes', label: 'Configurações', icon: Settings, roles: ['DONO'] },
            ].filter(item => !item.roles || item.roles.includes(userRole)).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-medium transition-all ${
                    isActive 
                      ? (isDark ? 'bg-white text-black font-semibold shadow-md' : 'bg-black text-white font-semibold shadow-md')
                      : (isDark ? 'text-[#8e8e93] hover:text-white hover:bg-white/[0.06]' : 'text-neutral-600 hover:text-black hover:bg-neutral-100')
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Multi-tenant User Profile Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-neutral-200'}`}>
          <div className={`p-3 rounded-2xl border flex items-center justify-between ${
            isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-semibold text-xs overflow-hidden ${
                isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-neutral-300 text-black'
              }`}>
                {empresaFotoUrl ? (
                  <img src={empresaFotoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (empresaNome || 'AY').substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-medium truncate">{empresaNome || 'Meu Estabelecimento'}</p>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-400">ADMIN</span>
              </div>
            </div>
            <Link to="/login" onClick={() => localStorage.clear()} className="opacity-60 hover:opacity-100 text-xs font-medium">
              Sair
            </Link>
          </div>
        </div>
      </aside>

      {/* --- FASE 1: Main Content & Admin Shell --- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto z-10">
        
        {/* Top Navbar */}
        <header className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-2xl ${
          isDark ? 'bg-[#0c0c0e]/80 border-white/10' : 'bg-white/80 border-neutral-200'
        }`}>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden opacity-60 hover:opacity-100">
              <Menu size={20} />
            </button>
            
            {/* Dynamic Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium opacity-80">
              <span className="opacity-60">Início</span>
              <ChevronRight size={12} className="opacity-40" />
              <span className="font-semibold text-white capitalize">
                {activeTab === 'overview' && 'Visão Geral'}
                {activeTab === 'agenda' && 'Agenda'}
                {activeTab === 'servicos' && 'Serviços'}
                {activeTab === 'profissionais' && 'Equipe & Profissionais'}
                {activeTab === 'clientes' && 'Clientes'}
                {activeTab === 'caixa' && 'Caixa Diário'}
                {activeTab === 'comunicacao' && 'Comunicação'}
                {activeTab === 'relatorios' && 'Relatórios Objetivos'}
                {activeTab === 'configuracoes' && 'Configurações'}
              </span>
            </div>

            {/* RECURSO UX 1: Busca Global Universal */}
            <div className="relative flex-1 max-w-xs ml-2 sm:ml-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Busca global (cliente, serviço...)"
                  className={`w-full h-9 border rounded-xl pl-9 pr-3 text-xs focus:outline-none transition-all ${
                    isDark ? 'bg-[#1c1c20] border-white/[0.06] text-white placeholder-[#6e6e73]' : 'bg-neutral-100 border-neutral-300 text-black'
                  }`}
                />
              </div>

              {/* Overlay de Resultados da Busca Global */}
              {globalSearchQuery.trim().length > 0 && (
                <div className={`absolute top-11 left-0 right-0 rounded-2xl border p-3 shadow-2xl z-50 space-y-2 text-xs ${
                  isDark ? 'bg-[#121215] border-white/10 text-white' : 'bg-white border-neutral-300 text-black'
                }`}>
                  <div className="text-[10px] font-bold opacity-50 uppercase tracking-wider">Resultados Encontrados</div>
                  
                  {/* Clientes */}
                  <div className="space-y-1">
                    <span className="text-[10px] opacity-70 font-semibold">Clientes:</span>
                    {clients.filter(c => c.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 2).map(c => (
                      <div
                        key={c.id}
                        onClick={() => { setActiveTab('clientes'); setGlobalSearchQuery(''); }}
                        className="p-2 rounded-xl hover:bg-white/10 cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-[10px] opacity-60">{c.phone}</span>
                      </div>
                    ))}
                  </div>

                  {/* Serviços */}
                  <div className="space-y-1 pt-1 border-t border-white/10">
                    <span className="text-[10px] opacity-70 font-semibold">Serviços:</span>
                    {services.filter(s => s.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 2).map(s => (
                      <div
                        key={s.id}
                        onClick={() => { setActiveTab('servicos'); setGlobalSearchQuery(''); }}
                        className="p-2 rounded-xl hover:bg-white/10 cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[10px] text-emerald-400">R$ {s.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Seletor de Perfil RBAC (FASE 11) */}
            <div className={`flex items-center border rounded-xl p-1 text-xs ${
              isDark ? 'bg-[#1c1c20] border-white/10' : 'bg-neutral-100 border-neutral-200'
            }`}>
              <button
                onClick={() => setUserRole('DONO')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  userRole === 'DONO'
                    ? (isDark ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm')
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                Visão Dono
              </button>
              <button
                onClick={() => { setUserRole('PROFISSIONAL'); setActiveTab('agenda'); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  userRole === 'PROFISSIONAL'
                    ? (isDark ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm')
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                Visão Equipe (Carlos Silva)
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                className={`h-9 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  isDark ? 'bg-white text-black hover:bg-neutral-200 border-white' : 'bg-black text-white hover:bg-neutral-800 border-black'
                }`}
              >
                <Plus size={14} />
                <span>Criar Novo</span>
              </button>

              {/* Menu Suspenso de Atalhos Rápidos */}
              {isQuickActionsOpen && (
                <div className={`absolute top-11 right-0 w-48 rounded-2xl border p-2 shadow-2xl z-50 text-xs space-y-1 ${
                  isDark ? 'bg-[#121215] border-white/10 text-white' : 'bg-white border-neutral-300 text-black'
                }`}>
                  <button
                    onClick={() => { setActiveTab('agenda'); setIsNewAppointmentOpen(true); setIsQuickActionsOpen(false); }}
                    className="w-full text-left p-2 rounded-xl hover:bg-white/10 font-semibold flex items-center justify-between"
                  >
                    <span>+ Novo Agendamento</span>
                    <CalendarIcon size={12} className="opacity-50" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('clientes'); setIsQuickActionsOpen(false); }}
                    className="w-full text-left p-2 rounded-xl hover:bg-white/10 font-semibold flex items-center justify-between"
                  >
                    <span>+ Novo Cliente</span>
                    <Users size={12} className="opacity-50" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('servicos'); setIsNewServiceOpen(true); setIsQuickActionsOpen(false); }}
                    className="w-full text-left p-2 rounded-xl hover:bg-white/10 font-semibold flex items-center justify-between"
                  >
                    <span>+ Novo Serviço</span>
                    <Sparkles size={12} className="opacity-50" />
                  </button>

                  {userRole === 'DONO' && (
                    <button
                      onClick={() => { setActiveTab('profissionais'); setIsQuickActionsOpen(false); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-white/10 font-semibold flex items-center justify-between"
                    >
                      <span>+ Novo Profissional</span>
                      <UserCheck size={12} className="opacity-50" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Link para a Página Pública /agendar/studio-agende-yo */}
            <Link
              to="/agendar/studio-agende-yo"
              target="_blank"
              className={`h-9 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                isDark ? 'bg-[#1c1c20] border-white/10 text-white hover:bg-white/10' : 'bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200'
              }`}
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Página Pública</span>
            </Link>

            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button 
              onClick={toggleTheme}
              title={isDark ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
              className={`p-2.5 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-[#1c1c20] border-white/[0.06] text-[#8e8e93] hover:text-white' 
                  : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-black'
              }`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Internal Notifications Bell Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2.5 rounded-xl border transition-all relative ${
                  isDark 
                    ? 'bg-[#1c1c20] border-white/[0.06] text-[#8e8e93] hover:text-white' 
                    : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-black'
                }`}
              >
                <Bell size={16} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-2 w-80 rounded-2xl border p-4 shadow-2xl z-50 ${
                      isDark ? 'bg-[#121215] border-white/10 text-white' : 'bg-white border-neutral-200 text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-3 mb-3 border-white/10">
                      <h4 className="text-xs font-semibold">Notificações do Sistema</h4>
                      <button onClick={markAllNotificationsRead} className="text-[10px] opacity-60 hover:opacity-100 flex items-center gap-1">
                        <CheckCheck size={12} /> Marcar lidas
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-2.5 rounded-xl border text-left ${
                          n.read ? 'opacity-50 border-transparent' : (isDark ? 'bg-white/5 border-white/10' : 'bg-neutral-100 border-neutral-200')
                        }`}>
                          <p className="text-xs font-medium mb-0.5">{n.title}</p>
                          <p className="text-[11px] opacity-70 leading-tight">{n.desc}</p>
                          <span className="text-[9px] opacity-50 block mt-1">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* RECURSO UX: Guia de Onboarding & Configuração Rápida (< 10 min) FASE 14 */}
          <OnboardingWizard onNavigateTab={(tab) => setActiveTab(tab as any)} />

          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  const faturamentoCalculado = appointments.reduce((acc, a) => {
                    const val = parseFloat(String(a.valor || 0).replace(/[^0-9,.-]/g, '').replace(',', '.'));
                    return acc + (isNaN(val) ? 0 : val);
                  }, 0);
                  return [
                    { label: 'Faturamento do Dia', value: `R$ ${faturamentoCalculado.toFixed(2).replace('.', ',')}`, change: appointments.length > 0 ? 'Lançado hoje' : 'Sem lançamentos', icon: DollarSign },
                    { label: 'Agendamentos Hoje', value: appointments.length.toString(), change: 'Cadastrados na conta', icon: CalendarIcon },
                    { label: 'Taxa de Presença', value: appointments.length > 0 ? '100%' : '0%', change: appointments.length > 0 ? 'Sem faltas' : 'Sem agendamentos', icon: UserCheck },
                    { label: 'Clientes Cadastrados', value: clients.length.toString(), change: 'Base da empresa', icon: TrendingUp },
                  ];
                })().map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <GlassCard key={i}>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium opacity-70">{stat.label}</span>
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-neutral-100 border-neutral-200 text-black'
                          }`}>
                            <Icon size={15} />
                          </div>
                        </div>
                        <div className="text-2xl font-semibold mb-1">{stat.value}</div>
                        <span className="text-[11px] opacity-60 font-medium">{stat.change}</span>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              <GlassCard>
                <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-neutral-200'}`}>
                  <div>
                    <h3 className="text-base font-semibold">Agendamentos em Tempo Real</h3>
                    <p className="text-xs opacity-60 mt-0.5">Sincronizados com o Banco de Dados Node.js</p>
                  </div>
                  <button onClick={() => setActiveTab('agenda')} className="text-xs font-medium opacity-70 hover:opacity-100 flex items-center gap-1 transition-colors">
                    Ver todos <ChevronRight size={14} />
                  </button>
                </div>

                <div className="divide-y divide-white/5 overflow-x-auto">
                  {appointments.map((item) => (
                    <div key={item.id} className="p-5 flex items-center justify-between min-w-[600px] hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-semibold text-sm ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-200 text-black'
                        }`}>
                          {item.time}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.client}</p>
                          <p className="text-xs opacity-60 mt-0.5">{item.service}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-sm font-semibold">{item.price}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          isDark ? 'bg-white/10 text-white border-white/20' : 'bg-black/10 text-black border-black/20'
                        }`}>
                          {item.status}
                        </span>
                        <a href={`https://wa.me/55${item.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className={`p-2.5 rounded-xl border transition-colors ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06] text-[#8e8e93] hover:text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-black'
                        }`}>
                          <Phone size={15} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

            </motion.div>
          )}

          {/* TAB 2: AGENDA INTELIGENTE (FASE 2) */}
          {activeTab === 'agenda' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Agenda Inteligente</h2>
                  <p className="text-xs opacity-60">Visões Diária, Semanal, Mensal, Timeline e Drag & Drop em tempo real.</p>
                </div>
                <button onClick={() => setIsNewAppointmentOpen(true)} className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                  isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                }`}>
                  <Plus size={16} /> Agendar Cliente
                </button>
              </div>

              {/* Componente FASE 2: Agenda Inteligente (Com Suporte RBAC) */}
              <AgendaInteligente userRole={userRole} activeProfissionalId={activeProfissionalId} />
            </motion.div>
          )}

          {/* TAB 3: SERVIÇOS (FASE 4) */}
          {activeTab === 'servicos' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Gestão de Serviços</h2>
                  <p className="text-xs opacity-60">Catálogo completo de procedimentos, preços, duração e comissão %.</p>
                </div>
              </div>

              {/* Componente FASE 4: Gestão de Serviços */}
              <GestaoServicos />
            </motion.div>
          )}

          {/* TAB 4: CLIENTES (CRM FASE 3) */}
          {activeTab === 'clientes' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">CRM de Clientes</h2>
                  <p className="text-xs opacity-60">Gestão 360°, histórico de atendimentos, financeiro, mensagens e tags.</p>
                </div>
              </div>

              {/* Componente FASE 3: CRM de Clientes */}
              <CrmClientes />
            </motion.div>
          )}

          {/* TAB 5: EQUIPE & PROFISSIONAIS (FASE 5) */}
          {activeTab === 'profissionais' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Gestão da Equipe de Profissionais</h2>
                  <p className="text-xs opacity-60">Jornada de trabalho, comissões %, faturamento e controle de férias/folgas.</p>
                </div>
              </div>

              {/* Componente FASE 5: Gestão de Profissionais */}
              <GestaoProfissionais />
            </motion.div>
          )}

          {/* TAB 6: CAIXA DIÁRIO (FASE 6 SIMPLIFICADA) */}
          {activeTab === 'caixa' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Caixa Diário & Fechamento de Vendas</h2>
                  <p className="text-xs opacity-60">Conferência por PIX, Cartão e Dinheiro, extrato de comissões e repasse líquido da casa.</p>
                </div>
              </div>

              {/* Componente FASE 6: Caixa Diário */}
              <CaixaDiario />
            </motion.div>
          )}

          {/* TAB 8: COMUNICAÇÃO & MENSAGENS (FASE 8) */}
          {activeTab === 'comunicacao' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Central de Comunicação & Notificações Automáticas</h2>
                  <p className="text-xs opacity-60">Lembretes automáticos via WhatsApp, confirmações, NPS e pesquisas de satisfação.</p>
                </div>
              </div>

              {/* Componente FASE 8: Comunicação & Mensagens */}
              <ModuloComunicacao />
            </motion.div>
          )}

          {/* TAB 9: RELATÓRIOS OBJETIVOS (FASE 9) */}
          {activeTab === 'relatorios' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Relatórios Objetivos & Indicadores Vitais</h2>
                  <p className="text-xs opacity-60">Faturamento, produtividade da equipe, ranking de serviços e taxa de ocupação.</p>
                </div>
              </div>

              {/* Componente FASE 9: Relatórios Objetivos */}
              <RelatoriosObjetivos />
            </motion.div>
          )}

          {/* TAB 5: CONFIGURAÇÕES */}
          {activeTab === 'configuracoes' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-semibold">Configurações & Perfil do Estabelecimento</h2>
                <p className="text-xs opacity-60 mt-1">Personalize a marca, endereço no mapa, foto/logo e link público da sua empresa.</p>
              </div>

              <GlassCard>
                <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* UPLOAD DE FOTO DE PERFIL / LOGO DO ESTABELECIMENTO */}
                  <div className="space-y-3 pb-6 border-b border-white/10">
                    <label className="block text-xs font-semibold opacity-80">Foto de Perfil / Logo do Estabelecimento</label>
                    
                    <div className="flex items-center gap-4">
                      {/* Avatar Preview */}
                      <div className="relative w-20 h-20 rounded-2xl bg-black border border-white/20 flex items-center justify-center font-black text-white text-xl overflow-hidden shrink-0 shadow-lg">
                        {empresaFotoUrl ? (
                          <img src={empresaFotoUrl} alt="Logo Empresa" className="w-full h-full object-cover" />
                        ) : (
                          <span>AY</span>
                        )}
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className={`cursor-pointer px-4 py-2 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
                            isDark ? 'bg-white text-black hover:bg-neutral-200 border-white' : 'bg-black text-white hover:bg-neutral-800 border-black'
                          }`}>
                            <span>{isUploadingIcon ? 'Enviando...' : 'Carregar Foto do Dispositivo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    alert("A imagem excede o limite máximo permitido de 2 MB.");
                                    return;
                                  }
                                  setIsUploadingIcon(true);
                                  const reader = new FileReader();
                                  reader.onloadend = async () => {
                                    const base64 = reader.result as string;
                                    setEmpresaFotoUrl(base64);
                                    
                                    try {
                                      const res = await apiFetch('/configuracoes/icon', {
                                        method: 'POST',
                                        body: JSON.stringify({ imagemBase64: base64, filename: file.name }),
                                      });
                                      if (res.data && res.data.iconUrl) {
                                        setEmpresaFotoUrl(res.data.iconUrl);
                                        // Atualiza iconUrl no objeto empresa do localStorage
                                        const emp = JSON.parse(localStorage.getItem('empresa') || '{}');
                                        emp.iconUrl = res.data.iconUrl;
                                        localStorage.setItem('empresa', JSON.stringify(emp));
                                      }
                                    } catch (err) {
                                      console.error("Erro ao fazer upload do ícone:", err);
                                    } finally {
                                      setIsUploadingIcon(false);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {empresaFotoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setEmpresaFotoUrl('');
                                const emp = JSON.parse(localStorage.getItem('empresa') || '{}');
                                delete emp.iconUrl;
                                localStorage.setItem('empresa', JSON.stringify(emp));
                              }}
                              className="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10"
                            >
                              Remover Foto
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] opacity-60">Selecione qualquer imagem (PNG, JPG, SVG - até 2MB) do seu dispositivo.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-2">Nome do Estabelecimento</label>
                    <input
                      type="text"
                      value={empresaNome}
                      onChange={e => setEmpresaNome(e.target.value)}
                      className={`w-full h-12 border rounded-2xl px-4 text-sm focus:outline-none ${
                        isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-2">Endereço Completo no Mapa (ViaCEP / OpenStreetMap Brasil)</label>
                    <LocationInput
                      value={empresaEndereco}
                      onChange={(address, lat, lng) => {
                        setEmpresaEndereco(address);
                        if (lat) setEmpresaLat(lat);
                        if (lng) setEmpresaLng(lng);
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-2">Telefone / WhatsApp de Contato</label>
                      <input
                        type="text"
                        value={empresaTelefone}
                        onChange={e => setEmpresaTelefone(e.target.value)}
                        className={`w-full h-12 border rounded-2xl px-4 text-sm focus:outline-none ${
                          isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-200'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-2">Link Público de Agendamento</label>
                      <div className={`flex items-center border rounded-2xl px-4 h-12 text-sm opacity-90 ${
                        isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-200'
                      }`}>
                        <span className="opacity-60 text-xs">agende.yo/</span>
                        <input
                          type="text"
                          value={empresaSlug}
                          onChange={e => setEmpresaSlug(e.target.value)}
                          className="bg-transparent font-semibold focus:outline-none flex-1 ml-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      // Atualiza o objeto empresa no localStorage para persistir ao recarregar
                      const empresaAtual = JSON.parse(localStorage.getItem('empresa') || '{}');
                      const empresaAtualizada = {
                        ...empresaAtual,
                        nome: empresaNome,
                        slug: empresaSlug,
                        telefone: empresaTelefone,
                        endereco: empresaEndereco,
                        iconUrl: empresaFotoUrl,
                        latitude: empresaLat,
                        longitude: empresaLng,
                      };
                      localStorage.setItem('empresa', JSON.stringify(empresaAtualizada));

                      try {
                        const res = await apiFetch('/configuracoes/empresa', {
                          method: 'PUT',
                          body: JSON.stringify({
                            nome: empresaNome,
                            slug: empresaSlug,
                            telefone: empresaTelefone,
                            endereco: empresaEndereco,
                            latitude: empresaLat,
                            longitude: empresaLng,
                            iconUrl: empresaFotoUrl,
                          }),
                        });
                        // Se o backend retornou a empresa atualizada, sincroniza
                        if (res.data?.empresa) {
                          const merged = { ...empresaAtualizada, ...res.data.empresa };
                          localStorage.setItem('empresa', JSON.stringify(merged));
                        }
                      } catch (err) {
                        console.error('Erro ao salvar no backend:', err);
                      }

                      setConfigSalvaToast(true);
                      setTimeout(() => setConfigSalvaToast(false), 3000);
                    }}
                    className={`w-full font-semibold text-xs h-12 rounded-2xl transition-all shadow-md active:scale-[0.98] ${
                      isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                    }`}
                  >
                    Salvar Alterações do Perfil
                  </button>

                  {configSalvaToast && (
                    <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 font-semibold text-xs text-center border border-emerald-500/30">
                      Perfil e foto do estabelecimento salvos com sucesso!
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

        </main>
      </div>

      {/* --- Modal: Novo Agendamento --- */}
      <AnimatePresence>
        {isNewAppointmentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl">
                <div className={`rounded-[27px] p-6 sm:p-8 relative ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => setIsNewAppointmentOpen(false)} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>
                  <h3 className="text-xl font-semibold mb-1">Novo Agendamento</h3>
                  <p className="text-xs opacity-60 mb-6">Persiste no banco via POST /agendamentos.</p>

                  <form onSubmit={handleCreateAppointment} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1.5">Nome do Cliente</label>
                      <input type="text" value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="Ex: Roberto Alves" className={`w-full h-12 border rounded-2xl px-4 text-xs focus:outline-none ${isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'}`} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1.5">Serviço</label>
                      <select value={newService} onChange={e => setNewService(e.target.value)} className={`w-full h-12 border rounded-2xl px-4 text-xs focus:outline-none ${isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'}`}>
                        {services.map(s => <option key={s.id} value={s.name}>{s.name} - R$ {s.price}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1.5">Horário</label>
                      <input type="text" value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="11:00" className={`w-full h-12 border rounded-2xl px-4 text-xs focus:outline-none ${isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'}`} required />
                    </div>
                    <button type="submit" disabled={isSubmitting} className={`w-full font-semibold text-xs h-12 rounded-2xl transition-all mt-4 flex items-center justify-center ${isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}>
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar Agendamento'}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Modal: Novo Serviço --- */}
      <AnimatePresence>
        {isNewServiceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-white/[0.03] shadow-2xl">
                <div className={`rounded-[27px] p-6 sm:p-8 relative ${isDark ? 'bg-[#121215]' : 'bg-white text-black'}`}>
                  <button onClick={() => setIsNewServiceOpen(false)} className="absolute top-6 right-6 opacity-60 hover:opacity-100">
                    <X size={18} />
                  </button>
                  <h3 className="text-xl font-semibold mb-1">Novo Serviço</h3>
                  <p className="text-xs opacity-60 mb-6">Persiste no banco via POST /servicos.</p>

                  <form onSubmit={handleCreateService} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1.5">Nome do Serviço</label>
                      <input type="text" value={serviceName} onChange={e => setServiceName(e.target.value)} placeholder="Ex: Hidratação Capilar" className={`w-full h-12 border rounded-2xl px-4 text-xs focus:outline-none ${isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'}`} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1.5">Preço (R$)</label>
                        <input type="text" value={servicePrice} onChange={e => setServicePrice(e.target.value)} placeholder="90,00" className={`w-full h-12 border rounded-2xl px-4 text-xs focus:outline-none ${isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'}`} required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium opacity-70 mb-1.5">Duração</label>
                        <input type="text" value={serviceDuration} onChange={e => setServiceDuration(e.target.value)} placeholder="45 min" className={`w-full h-12 border rounded-2xl px-4 text-xs focus:outline-none ${isDark ? 'bg-[#1c1c20] border-white/[0.06]' : 'bg-neutral-100 border-neutral-300'}`} required />
                      </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className={`w-full font-semibold text-xs h-12 rounded-2xl transition-all mt-4 flex items-center justify-center ${isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}>
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Cadastrar Serviço'}
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
