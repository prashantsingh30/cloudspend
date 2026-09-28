import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  isDestructive,
  isDanger,
  isLoading = false,
}) => {
  const closeAction = onClose || onCancel || (() => {});
  const finalConfirmLabel = confirmLabel || confirmText || 'Confirm';
  const finalCancelLabel = cancelLabel || cancelText || 'Cancel';
  const destructive = isDanger ?? isDestructive ?? true;

  return (
    <Modal isOpen={isOpen} onClose={closeAction} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {destructive && (
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <p className="text-sm text-[#64748B] dark:text-[#A3AEC7] leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF2] dark:border-[#26334D]">
          <button
            type="button"
            onClick={closeAction}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#151A2D] dark:text-[#A3AEC7] dark:hover:text-white rounded-xl transition-colors"
          >
            {finalCancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-colors ${
              destructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#5145E5] hover:bg-[#4338CA]'
            }`}
          >
            {isLoading ? 'Processing...' : finalConfirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
