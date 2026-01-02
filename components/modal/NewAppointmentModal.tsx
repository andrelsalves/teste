import React, { useEffect, useState } from 'react';
// Importa do Barrel da pasta de cima
import { Icons } from '../constants/icons'; 
// Importa dos Services (subindo duas pastas)
import { appointmentService } from '../../services/appointmentService';
import { companyService } from '../../services/companyService';
import { AppointmentStatus, Company } from '../../types/types';

interface NewAppointmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  technicianId: string;
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ onClose, onSuccess, technicianId }) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    reason: '',
    datetime: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  
const loadCompanies = async () => {
  try {
    const data = await companyService.getAllCompanies(); //
    // Verificação de segurança para garantir que data seja sempre um array
    setCompanies(data || []); 
  } catch (err) {
    console.error("Erro ao carregar empresas");
    alert("Não foi possível carregar a lista de clientes.");
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyId || !formData.reason || !formData.datetime) {
      return alert("Preencha todos os campos");
    }

    setLoading(true);
    try {
      await appointmentService.createAppointment({
        ...formData,
        technicianId: technicianId,
        status: AppointmentStatus.ACCEPTED,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erro ao agendar visita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[40px] p-8 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-white font-black text-2xl uppercase tracking-tighter">Nova Visita</h2>
            <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Agendamento Rápido</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors">
            <Icons.XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Empresa */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Unidade / Cliente</label>
            <select className="..." 
              onChange={(e) => setSelectedCompany(e.target.value)}
              >
              <option value="">Selecione a Empresa</option>
              {companies.length > 0 ? (
                companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))
              ) : (
                <option disabled>Nenhuma empresa encontrada</option>
              )}
            </select>
          </div>

          {/* Motivo do Serviço */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Motivo da Visita</label>
            <input 
              placeholder="Ex: Entrega de EPIs, Treinamento..."
              className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500"
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          {/* Data e Hora */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Data e Horário</label>
            <input 
              type="datetime-local"
              className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500"
              value={formData.datetime}
              onChange={e => setFormData({...formData, datetime: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-emerald-500 text-slate-950 rounded-[24px] font-black uppercase text-[12px] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {loading ? 'Processando...' : 'Confirmar Agendamento'}
          </button>
        </form>
      </div>
    </div>
  );
};


export default NewAppointmentModal;
