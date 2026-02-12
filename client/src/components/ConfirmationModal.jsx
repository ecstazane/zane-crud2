import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/20 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden transform transition-all scale-100 border border-neutral-100">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-2 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
                        {message}
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-all ${isDanger
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
