import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500 text-slate-950',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-slideDown">
      <div
        className={`px-6 py-4 rounded-xl font-black shadow-xl ${colors[type]}`}
      >
        {message}
      </div>
    </div>
  );
};

export default Toast;
