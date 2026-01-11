const NewAppointmentModal = ({ onClose }: any) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-white p-6 rounded text-black">
        <p>MODAL FUNCIONANDO</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
