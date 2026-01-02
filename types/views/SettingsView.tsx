
import React, { useState } from 'react';

interface SettingsViewProps {
  settings: {
    autoApprove: boolean;
    emailNotifications: boolean;
    emailReminder24h: boolean;
    smsNotifications: boolean;
    allowSupportChat: boolean;
    dataSharing: boolean;
  };
  onUpdateSettings: (newSettings: any) => void;
  onNavigate: (view: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings, onNavigate }) => {
  // Local temporary state for editing before saving
  const [localSettings, setLocalSettings] = useState(settings);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggle = (key: keyof typeof localSettings) => {
    setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setShowSuccess(true);
    
    // Redirect to dashboard after a short delay to show success feedback
    setTimeout(() => {
      setShowSuccess(false);
      onNavigate('DASHBOARD');
    }, 1500);
  };

  const sections = [
    {
      title: 'Notificações',
      desc: 'Configure como o sistema avisa técnicos e empresas.',
      items: [
        { 
          key: 'emailNotifications', 
          label: 'Notificações por Email', 
          desc: 'Habilita o envio de comunicações oficiais por correio eletrônico.' 
        },
        { 
          key: 'emailReminder24h', 
          label: 'Lembrete de 24 horas', 
          desc: 'Enviar um email de lembrete 24 horas antes da visita técnica.',
          parent: 'emailNotifications' 
        },
        { 
          key: 'smsNotifications', 
          label: 'Alertas SMS (Beta)', 
          desc: 'Envio de lembretes via mensagem de texto para o celular do técnico.' 
        },
      ]
    },
    {
      title: 'Fluxo de Trabalho',
      desc: 'Regras de negócio para o processo de agendamento.',
      items: [
        { key: 'allowSupportChat', label: 'Chat de Suporte IA', desc: 'Habilita o assistente inteligente para dúvidas sobre NRs.' },
      ]
    },
    {
      title: 'Segurança e Privacidade',
      desc: 'Gerencie permissões de dados e acessos externos.',
      items: [
        { key: 'dataSharing', label: 'Compartilhamento de Métricas', desc: 'Enviar relatórios anônimos de conformidade para rede parceira.' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto w-full space-y-10 animate-fadeIn pb-12 relative">
      {/* Local Success Notification */}
      {showSuccess && (
        <div className="fixed top-20 right-4 left-4 md:left-auto md:w-80 bg-emerald-600 text-white p-4 rounded-xl shadow-2xl z-[100] animate-bounce flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <p className="font-bold text-sm">Configurações salvas! Redirecionando...</p>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold">Configurações de Permissões</h2>
        <p className="text-slate-400 mt-1">Personalize o comportamento do sistema para toda a organização.</p>
      </div>

      <div className="space-y-12">
        {sections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            <div className="border-l-4 border-emerald-500 pl-4">
              <h3 className="text-xl font-bold">{section.title}</h3>
              <p className="text-sm text-slate-500">{section.desc}</p>
            </div>

            <div className="grid gap-4 mt-6">
              {section.items.map(item => {
                const isSubOption = 'parent' in item;
                const parentEnabled = isSubOption ? localSettings[item.parent as keyof typeof localSettings] : true;

                if (isSubOption && !parentEnabled) return null;

                const isActive = localSettings[item.key as keyof typeof localSettings];

                return (
                  <div 
                    key={item.key} 
                    onClick={() => toggle(item.key as keyof typeof localSettings)}
                    className={`flex items-center justify-between p-6 bg-slate-800 rounded-3xl border border-slate-700 hover:border-slate-600 transition-all cursor-pointer group shadow-lg
                      ${isSubOption ? 'ml-8 bg-slate-800/50 scale-[0.98]' : ''}
                    `}
                  >
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        {isSubOption && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M9 18l6-6-6-6"/></svg>
                        )}
                        <p className="font-bold text-white group-hover:text-emerald-500 transition-colors">{item.label}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    
                    <div className={`w-14 h-8 rounded-full transition-all relative ${isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${isActive ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        <section className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-3xl">
          <p className="text-sm text-amber-500 font-semibold">
            Nota: Todos os novos agendamentos agora requerem confirmação manual do técnico por padrão para garantir a revisão da disponibilidade.
          </p>
        </section>
      </div>

      <div className="pt-8 border-t border-slate-700 flex justify-end gap-4">
        <button 
          onClick={() => setLocalSettings(settings)}
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all"
        >
          Descartar
        </button>
        <button 
          onClick={handleSave}
          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          Salvar e Voltar
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
