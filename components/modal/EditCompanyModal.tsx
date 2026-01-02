import React, { useState } from 'react';
import { Icons } from '../constants/icons';
import { Company } from '../../types/types';

// 1. Defina o que o componente espera receber
interface EditCompanyModalProps {
    company: Company;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Company>) => Promise<void>;
}

// 2. Aplique a interface nas props
const EditCompanyModal: React.FC<EditCompanyModalProps> = ({ company, onClose, onSave }) => {
    // Agora o TS sabe que 'formData' tem os mesmos campos que 'company'
    const [formData, setFormData] = useState<Company>({ ...company });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(company.id, formData);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar dados.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[32px] p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white font-black text-xl uppercase tracking-tighter">Dados da Unidade</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white"><Icons.XCircle /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-emerald-500 uppercase ml-2">Razão Social</label>
                        <input 
                            className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white mt-1 focus:ring-2 focus:ring-emerald-500"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-emerald-500 uppercase ml-2">CNPJ</label>
                            <input 
                                className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white mt-1"
                                value={formData.cnpj}
                                onChange={e => setFormData({...formData, cnpj: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-emerald-500 uppercase ml-2">Telefone</label>
                            <input 
                                className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white mt-1"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase text-[11px] mt-4 hover:bg-emerald-400 transition-all"
                    >
                        {loading ? 'Salvando...' : 'Atualizar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditCompanyModal;