import React, {useState, useCallback, useMemo,lazy, Suspense
} from 'react';

import { Icons } from '../components/constants/icons';
import NewAppointmentModal from '../components/modal/NewAppointmentModal';
import { Appointment, reportService } from '../services/report/reportService';

import { useAuth } from '../hooks/useAuth';
import { useAppointments } from '../hooks/useAppointments';

import { AppointmentStatus } from '../types/types';

const SignatureCanvas = lazy(() => import('react-signature-canvas'));

const TechDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    appointments,
    stats,
    loadAppointments,
    updateStatus
  } = useAppointments();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [itemForDetails, setItemForDetails] = useState<any>(null);
  const [report, setReport] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const sigCanvas = React.useRef<any>(null);

  /* ===========================
     Handlers
  =========================== */

  const handleFinish = useCallback(async () => {
    if (!itemForDetails || !sigCanvas.current || !user) return;

    try {
      setIsFinishing(true);

      const signature = sigCanvas.current.toDataURL();

      await reportService.generateAppointmentPDF(
        {
          ...itemForDetails,
          description: report,
          technicianName: user.name
        },
        photoPreview,
        signature
      );

      await updateStatus(
        itemForDetails.id,
        AppointmentStatus.COMPLETED,
        user.id
      );

      await loadAppointments();
      setItemForDetails(null);
      setReport('');
      setPhotoPreview(null);
      setHasSignature(false);
    } finally {
      setIsFinishing(false);
    }
  }, [itemForDetails, report, photoPreview, user]);

  const canFinish = useMemo(
    () => !!report && hasSignature && !isFinishing,
    [report, hasSignature, isFinishing]
  );

  /* ===========================
     Render
  =========================== */

  if (!user) return null;

  return (
    <div className="space-y-8 pb-24 animate-fadeIn relative">
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Icons.CheckCircle />}
          label="Concluídos"
          value={stats.completed}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {appointments.map((app) => (
          <AppointmentCard
            key={app.id}
            appointment={app}
            onOpen={() => setItemForDetails(app)}
          />
        ))}
      </div>

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

const StatCard = React.memo(
  ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
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
  ({
    appointment,
    onOpen,
  }: {
    appointment: Appointment;
    onOpen: () => void;
  }) => (
    <div className="bg-slate-900 p-4 rounded-2xl border border-white/5">
      <h3 className="text-white font-bold truncate">
        {appointment.company_name}
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


export default React.memo(TechDashboard);
