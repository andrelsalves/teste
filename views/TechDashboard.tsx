{/* Modal de Detalhes Dinâmico */ }
{
    itemForDetails && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/95 backdrop-blur-sm">
            <div className="bg-[#1e293b] w-full max-w-lg rounded-[32px] border border-white/10 p-6 md:p-8 shadow-2xl animate-slideUp flex flex-col max-h-[90vh]">

                {/* Header do Modal */}
                <div className="mb-6">
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-tight">
                        {itemForDetails.company_name || itemForDetails.companyName}
                    </h3>
                    <div className="flex gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                            {itemForDetails.reason}
                        </span>
                    </div>
                </div>

                {/* Corpo com Scroll */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">

                    {/* Relatório */}
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Relatório Técnico</label>
                        <textarea
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            placeholder="Descreva os serviços realizados..."
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white text-sm min-h-[100px] focus:border-emerald-500/50 outline-none transition-all"
                        />
                    </div>

                    {/* Foto */}
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Evidência Visual</label>
                        <div className="relative h-32 bg-slate-900/50 border-2 border-dashed border-white/5 rounded-2xl overflow-hidden group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                            />
                            {photoPreview ? (
                                <img src={photoPreview} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-600 group-hover:text-emerald-500 transition-colors">
                                    <Icons.Camera className="w-6 h-6 mb-1" />
                                    <span className="text-[8px] font-bold uppercase">Anexar Foto</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assinatura */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Assinatura do Cliente</label>
                            <button onClick={clearSignature} className="text-[8px] text-rose-500 font-black uppercase">Limpar</button>
                        </div>
                        <div className="bg-white rounded-2xl h-32 overflow-hidden">
                            <SignatureCanvas
                                ref={sigCanvas as any}
                                onEnd={() => setHasSignature(true)}
                                penColor="black"
                                canvasProps={{ className: "w-full h-full" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Ações */}
                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleComplete}
                        disabled={isFinishing || !hasSignature || !report}
                        className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${isFinishing || !hasSignature || !report
                                ? 'bg-slate-800 text-slate-600'
                                : 'bg-emerald-500 text-slate-950 hover:scale-[1.02] shadow-lg shadow-emerald-500/20'
                            }`}
                    >
                        {isFinishing ? 'Enviando...' : 'Finalizar Atendimento'}
                    </button>

                    <button
                        onClick={() => setItemForDetails(null)}
                        className="w-full text-slate-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Voltar ao Painel
                    </button>
                </div>
            </div>
        </div>
    )
}
export default TechDashboard;

