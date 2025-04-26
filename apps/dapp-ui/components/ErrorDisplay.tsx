import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onClose: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClose }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
      <span className="block sm:inline">{error}</span>
      <button 
        onClick={onClose}
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
      >
        <span className="sr-only">关闭</span>
        <span>&times;</span>
      </button>
    </div>
  );
};

export default ErrorDisplay; 