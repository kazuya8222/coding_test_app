import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  closeOnOutsideClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  children, 
  onClose, 
  closeOnOutsideClick = true 
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

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
      >
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};