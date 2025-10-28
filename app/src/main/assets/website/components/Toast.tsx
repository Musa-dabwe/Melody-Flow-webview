import React from 'react';

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-toast-in-out"
    >
      <div className="bg-gray-800/90 backdrop-blur-sm text-white font-semibold px-5 py-2.5 rounded-full shadow-lg border border-gray-700">
        {message}
      </div>
    </div>
  );
};

export default Toast;
