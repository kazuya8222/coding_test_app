import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  closeOnOutsideClick?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl'; // サイズオプションを追加
}

export const Modal: React.FC<ModalProps> = ({ 
  children, 
  onClose, 
  closeOnOutsideClick = true,
  size = 'md' // デフォルトは中サイズ
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside if enabled
  const handleOutsideClick = (e: MouseEvent) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Close on ESC key press
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    // Add event listeners
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    // Disable body scroll
    document.body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [closeOnOutsideClick, onClose]);

  // サイズに基づいてクラスを設定
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-out"
      style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-auto transform transition-all duration-300 ease-out`}
        style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
      >
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};