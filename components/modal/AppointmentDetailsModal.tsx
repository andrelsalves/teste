import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  Suspense,
} from 'react';
import { reportService } from '../../services/reportService';

const SignatureCanvas = React.lazy(() => import('react-signature-canvas'));

interface Props {
  item: any;
  technicianName: string;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

const AppointmentDetailsModal: React.FC<Props> = ({
  item,
  technicianName,
  onClose,
  onSuccess,
}) => {
  const sigRef = useRef<any>(null);

  const [report, setReport] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [success, setSuccess] = useState(false);

  const finish = useCallback(async () => {
    if (!sigRef.current) return;

    setIsFinishing(true);

    const signature = sigRef.current.toDataURL();

    await reportService.generateAppointmentPDF(
      {
        ...item,
        description: report,
        technicianName,
      },
      photoPreview,
      signature
    );

    await onSuccess();
    setSuccess(true);
    setIsFinishing(false);
  }, [item, report, photoPreview, technicianName, onSuccess]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl p-6">

        {!success ? (
          <>
            <h2 className="text-white font-black mb-4">
              {item.company_name}
            </h2>

            <textarea
              value={report}
              onChange={e => setReport(e.target.value)}
              className="w-full rounded-xl p-3 mb-4"
              placeholder="Parecer técnico"
            />

            <div className="bg-white h-32 rounded-xl overflow-hidden">
              <Suspense fallback={<div className="h-full flex items-center justify-center">Carregando assinatura...</div>}>
                <SignatureCanvas
                  ref={sigRef}
                  onEnd={() => setHasSignature(true)}
                  penColor="black"
                  canvasProps={{ className: 'w-full h-full' }}
                />
              </Suspense>
            </div>

            <button
              onClick={finish}
              disabled={!hasSignature || !report || isFinishing}
              className="w-full mt-6 py-3 bg-emerald-500 rounded-xl"
            >
              {isFinishing ? 'Processando...' : 'Finalizar'}
            </button>

            <button onClick={onClose} className="w-full mt-2 text-slate-400">
              Voltar
            </button>
          </>
        ) : (
          <>
            <h2 className="text-white font-black mb-6">Concluído!</h2>
            <button
              onClick={() => reportService.openWhatsApp(item)}
              className="w-full py-3 bg-green-500 rounded-xl"
            >
              Enviar WhatsApp
            </button>
            <button onClick={onClose} className="w-full mt-2 text-slate-400">
              Fechar
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
