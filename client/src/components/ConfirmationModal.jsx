import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-neutral-900/20 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-lg w-full sm:max-w-md overflow-hidden transform transition-all scale-100 border border-neutral-100 sheet-enter sm:animate-none">
                <div className="p-5 sm:p-6 pb-safe">
                    <h3 className="text-lg font-bold text-neutral-900 mb-2 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
                        {message}
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-2 sm:gap-3">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors min-h-[48px] sm:min-h-0"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-all min-h-[48px] sm:min-h-0 ${isDanger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-neutral-900 hover:bg-neutral-800'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
