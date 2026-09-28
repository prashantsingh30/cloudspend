import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${maxWidthClass} max-h-[90vh] flex flex-col bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-150 my-auto`}
      >
        <div className="px-5 sm:px-6 py-4 border-b border-[#E7EAF2] dark:border-[#26334D] flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-2">
            <h2 id="modal-title" className="text-base font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF] truncate">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[#64748B] dark:text-[#A3AEC7] mt-0.5 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#151A2D] dark:text-[#A3AEC7] dark:hover:text-white rounded-lg hover:bg-[#F1F4F9] dark:hover:bg-[#17223A] transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
