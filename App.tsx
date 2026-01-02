import React, { useEffect, useState, useCallback, useRef } from 'react';
import { User, UserRole, Appointment, AppointmentStatus } from './types/types';
import { supabase } from './services/supabaseClient';
import { appointmentService } from './services/appointmentService';

// Views
import LoginView from './views/LoginView';
import SchedulingView from './views/SchedulingView';
import TechDashboard from './views/TechDashboard';
import ProfileView from './views/ProfileView';
import HistoryDashboardView from './views/HistoryDashboardView';
import { Icons } from './components/constants/icons';
import SignatureCanvas from 'react-signature-canvas';

const App: React.FC = () => {
  // --- ESTADOS ---
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('LOGIN');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [visitReasons, setVisitReasons] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'info' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState<User[]>([]);

  // Estados para o Dashboard do Técnico
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [report, setReport] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [itemForDetails, setItemForDetails] = useState<any | null>(null);

  // --- AUXILIARES ---
  const showNotify = useCallback((msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 6000);
  }, []);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setHasSignature(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case AppointmentStatus.ACCEPTED: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case AppointmentStatus.PENDING: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case AppointmentStatus.REJECTED: return 'bg-red-500/10 text-red-400 border-red-500/20';
      case AppointmentStatus.COMPLETED: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // --- CARGA DE DADOS ---

  const loadVisitReasons = useCallback(async () => {
    try {
      const { data } = await supabase.from('visit_reasons').select('label').eq('active', true);
      if (data) setVisitReasons(data.map((r: { label: string }) => r.label));
    } catch (err) {
      console.error("Erro ao carregar motivos:", err);
    }
  }, []);

  const loadTechnicians = useCallback(async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'TECNICO');
      if (data) {
        setTechnicians(data.map((t: { id: any; email: any; name: any; company_id: any; }) => ({
          id: t.id,
          email: t.email,
          name: t.name,
          role: UserRole.TECNICO,
          companyId: t.company_id,
          companyName: 'Equipe Técnica'
        })));
      }
    } catch (err) {
      console.error("Erro ao carregar técnicos:", err);
    }
  }, []);

  const loadAppointments = useCallback(async (currentUser: User) => {
    setLoading(true);
    try {
      let data: Appointment[];
      if (currentUser.role === UserRole.TECNICO) {
        data = await appointmentService.getAppointmentsForTechnician(currentUser.id);
      } else {
        const all = await appointmentService.getAppointments();
        data = all.filter(a => String(a.companyId) === String(currentUser.companyId));
      }
      setAppointments(data);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) {
        const loggedUser: User = {
          id: userId,
          email,
          name: data.name,
          role: data.role as UserRole,
          companyId: data.companies?.id || data.company_id,
          companyName: data.companies?.name || data.company_name || 'Empresa Independente',
          avatar: data.avatar_url,
          registrationNumber: data.registration_number
        };
        setUser(loggedUser);
        loadAppointments(loggedUser);
        loadVisitReasons();
        loadTechnicians();
        if (currentView === 'LOGIN') {
          setCurrentView(loggedUser.role === UserRole.EMPRESA ? 'SCHEDULING' : 'DASHBOARD');
        }
      }
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
    }
  }, [currentView, loadAppointments, loadVisitReasons, loadTechnicians]);

  // --- AÇÕES ---

  const handleAssume = async (id: string) => {
    if (!user) return;
    try {
      await appointmentService.updateAppointmentStatus(id, AppointmentStatus.ACCEPTED, user.id);
      showNotify('Você assumiu este serviço!');
      loadAppointments(user);
    } catch (error) {
      showNotify('Erro ao assumir serviço', 'error');
    }
  };

  const handleComplete = async () => {
    if (!itemForDetails || !user) return;
    setIsFinishing(true);
    try {
      await appointmentService.updateAppointmentStatus(itemForDetails.id, AppointmentStatus.COMPLETED, user.id);
      showNotify('Serviço finalizado com sucesso!');
      setItemForDetails(null);
      setReport('');
      clearSignature();
      loadAppointments(user);
    } catch (error) {
      showNotify('Erro ao finalizar serviço', 'error');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleSchedule = async (appData: any) => {
    if (!user?.companyId) return showNotify('Perfil sem empresa vinculada', 'error');
    try {
      await appointmentService.createAppointment({
        ...appData,
        companyId: user.companyId,
        status: AppointmentStatus.PENDING
      });
      showNotify('Solicitação enviada!');
      setCurrentView('HISTORY');
    } catch (error) {
      showNotify('Erro ao agendar', 'error');
    }
  };

  // --- EFEITOS ---
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: { user: { id: string; email: string; }; }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setAppointments([]);
        setCurrentView('LOGIN');
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [fetchProfile]);

  // --- RENDERIZAÇÃO ---

  const renderView = () => {
    if (!user) return <LoginView />;

    const sharedProps = {
      user,
      appointments,
      onUpdateStatus: async (id: string, s: string) => {
        await appointmentService.updateAppointmentStatus(id, s as any, user.id);
        loadAppointments(user);
      }
    };

    switch (currentView) {
      case 'DASHBOARD':
        return (
          <TechDashboard
            {...sharedProps}
            stats={{
              completed: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
              pending: appointments.filter(a => a.status === AppointmentStatus.ACCEPTED).length,
              total: appointments.length
            }}
            loadAppointments={() => loadAppointments(user)}
            report={report}
            setReport={setReport}
            handlePhotoChange={handlePhotoChange}
            photoPreview={photoPreview}
            sigCanvas={sigCanvas as React.MutableRefObject<SignatureCanvas | null>}
            clearSignature={clearSignature}
            setHasSignature={setHasSignature}
            handleComplete={handleComplete}
            isFinishing={isFinishing}
            hasSignature={hasSignature}
            handleAssume={handleAssume}
            itemForDetails={itemForDetails}
            setItemForDetails={setItemForDetails}
          />
        );
        useEffect(() => { console.log("Item selecionado para gerenciar:", itemForDetails);}, [itemForDetails]);
        
  
      case 'SCHEDULING':
        return <SchedulingView {...sharedProps} visitReasons={visitReasons} technicians={technicians} onSchedule={handleSchedule} />;
      case 'HISTORY':
        return (
          <HistoryDashboardView
            {...sharedProps}
            loading={loading}
            getStatusStyle={getStatusStyle}
            onDelete={async (id) => { await appointmentService.deleteAppointment(id); loadAppointments(user); }}
          />
        );
      case 'PROFILE':
        return <ProfileView user={user} onLogout={() => supabase.auth.signOut()} onUpdateProfile={() => { }} />;
      default:
        return <SchedulingView {...sharedProps} visitReasons={visitReasons} onSchedule={handleSchedule} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] text-slate-200 font-sans">
      {user && (
        <aside className="hidden md:flex w-72 bg-[#1e293b] p-8 flex-col border-r border-white/5 h-screen sticky top-0 shadow-xl">
          <div className="flex items-center gap-3 mb-12 px-2">
            <Icons.Shield className="w-8 h-8 text-emerald-500" />
            <h1 className="text-2xl font-black text-white italic tracking-tighter">SST <span className="text-emerald-500">PRO</span></h1>
          </div>
          <nav className="space-y-1.5 flex-1">
            {[
              { id: user.role === UserRole.EMPRESA ? 'SCHEDULING' : 'DASHBOARD', label: user.role === UserRole.EMPRESA ? 'Agendar' : 'Painel', icon: <Icons.Calendar className="w-5 h-5" /> },
              { id: 'HISTORY', label: 'Histórico', icon: <Icons.History className="w-5 h-5" /> },
              { id: 'PROFILE', label: 'Perfil', icon: <Icons.User className="w-5 h-5" /> }
            ].map(item => (
              <button key={item.id} onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all ${currentView === item.id ? 'bg-emerald-500 text-slate-900 font-bold shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
              >
                {item.icon}
                <span className="text-[11px] uppercase tracking-widest font-black">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      )}
      <main className="flex-1 p-6 md:p-10">
        {renderView()}
      </main>
      {notification && (
        <div className="fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-[9999] bg-slate-800 border-l-4 border-emerald-500 text-white flex items-center gap-3 animate-slideUp">
          <div className="bg-emerald-500/20 p-2 rounded-lg"><Icons.Plus className="w-4 h-4 text-emerald-500" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Sistema</p>
            <p className="text-xs font-bold">{notification.msg}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
