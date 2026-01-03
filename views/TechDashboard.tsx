import React, {useState, useEffect, useCallback, useMemo,lazy, Suspense,} from 'react';
import { Icons } from '../components/constants/icons';
import NewAppointmentModal from '../components/modal/NewAppointmentModal';
import { reportService } from '../services/report/reportService';
import type { Appointment, User } from '../types/types';

const SignatureCanvas = lazy(() => import('react-signature-canvas'));

interface TechDashboardProps {
  user: User;
  appointments: Appointment[];
  stats: {
    completed: number;
    pending: number;
    total: number;
  };
  loadAppointments: () => Promise<void>;
}

const TechDashboard: React.FC<TechDashboardProps> = ({
  user,
  appointments,
  stats,
  loadAppointments,
}) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [itemForDetails, setItemForDetails] = useState<Appointment | null>(null);
  const [report, setReport] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const sigCanvas = React.useRef<any>(null);

  /* ===========================
     Handlers (memoizados)
  =========================== */

  const handlePhotoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const clearSignature = useCallback(() => {
    sigCanvas.current?.clear();
    setHasSignature(false);
  }, []);

  const handleFinish = useCallback(async () => {
    if (!itemForDetails || !sigCanvas.current) return;

    try {
      setIsFinishing(true);

      const signature = sigCanvas.current.toDataURL();

      await reportService.generateAppointmentPDF(
        {
          ...itemForDetails,
          description: report,
          technicianName: user.name,
        },
        photoPreview,
        signature
      );

      await loadAppointments();
      setItemForDetails(null);
      setReport('');
      setPhotoPreview(null);
      setHasSignature(false);
    } catch (err) {
      console.error('Erro ao finalizar atendimento:', err);
    } finally {
      setIsFinishing(false);
    }
  }, [
    itemForDetails,
    report,
    photoPreview,
    user.name,
    loadAppointments,
  ]);

  /* ===========================
     Derived state
  =========================== */

  const canFinish = useMemo(
    () => !!report && hasSignature && !isFinishing,
    [report, hasSignature, isFinishing]
  );

  /* ===========================
     Render
  =========================== */

  return (
    <div className="space-y-8 pb-24 animate-fadeIn relative">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic">
            Painel de <span className="text-emerald-500">Serviços</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase font-bold">
            {user.name} • {appointments.length} atendimentos
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Icons.CheckCircle />}
          label="Concluídos"
          value={stats.completed}
        />
      </div>

      {/* Appointments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {appointments.length === 0 ? (
          <EmptyState />
        ) : (
          appointments.map((app) => (
            <AppointmentCard
              key={app.id}
              appointment={app}
              onOpen={() => setItemForDetails(app)}
            />
          ))
        )}
      </div>

      {/* Modal Atendimento */}
      {itemForDetails && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur flex items-center justify-center p-6">
          <div className="bg-slate-900 max-w-md w-full rounded-3xl p-8 space-y-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-black text-white uppercase">
              {itemForDetails.companyName}
            </h3>

            <textarea
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Descreva o parecer técnico..."
              className="w-full min-h-[100px] bg-slate-800 text-white p-4 rounded-2xl outline-none"
            />

            {/* Foto */}
            <PhotoInput
              preview={photoPreview}
              onChange={handlePhotoChange}
            />

            {/* Assinatura */}
            <div className="bg-white h-32 rounded-2xl overflow-hidden">
              <Suspense fallback={<LoadingSignature />}>
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  onEnd={() => setHasSignature(true)}
                  canvasProps={{ className: 'w-full h-full' }}
                />
              </Suspense>
            </div>

            <button
              onClick={clearSignature}
              className="text-xs text-rose-500 font-bold uppercase"
            >
              Limpar assinatura
            </button>

            <button
              disabled={!canFinish}
              onClick={handleFinish}
              className={`w-full py-4 rounded-2xl font-black uppercase text-xs ${
                canFinish
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isFinishing ? 'Finalizando...' : 'Finalizar Atendimento'}
            </button>

            <button
              onClick={() => setItemForDetails(null)}
              className="w-full text-xs uppercase text-slate-500"
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsNewModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-2xl font-bold"
      >
        +
      </button>

      {isNewModalOpen && (
        <NewAppointmentModal
          technicianId={user.id}
          onClose={() => setIsNewModalOpen(false)}
          onSuccess={loadAppointments}
        />
      )}
    </div>
  );
};

export default React.memo(TechDashboard);

/* ===========================
   Subcomponents
=========================== */

const StatCard = React.memo(
  ({ icon, label, value }: any) => (
    <div className="bg-slate-900 p-4 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  )
);

const AppointmentCard = React.memo(
  ({ appointment, onOpen }: { appointment: Appointment; onOpen: () => void }) => (
    <div className="bg-slate-900 p-4 rounded-2xl border border-white/5">
      <h3 className="text-white font-bold truncate">
        {appointment.companyName}
      </h3>
      <button
        onClick={onOpen}
        className="mt-4 w-full py-2 bg-slate-800 text-xs uppercase font-bold rounded-xl hover:bg-emerald-500 hover:text-slate-950"
      >
        Gerenciar Visita
      </button>
    </div>
  )
);

const EmptyState = () => (
  <div className="col-span-full text-center text-xs text-slate-500 uppercase py-10">
    Nenhuma visita encontrada
  </div>
);

const PhotoInput = ({
  preview,
  onChange,
}: {
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative h-32 bg-slate-800 rounded-2xl overflow-hidden">
    <input
      type="file"
      accept="image/*"
      onChange={onChange}
      className="absolute inset-0 opacity-0 cursor-pointer z-10"
    />
    {preview ? (
      <img src={preview} className="w-full h-full object-cover" />
    ) : (
      <div className="flex items-center justify-center h-full text-slate-500 text-xs uppercase font-bold">
        Anexar Foto
      </div>
    )}
  </div>
);

const LoadingSignature = () => (
  <div className="flex items-center justify-center h-full text-xs uppercase text-slate-400">
    Carregando assinatura...
  </div>
);
