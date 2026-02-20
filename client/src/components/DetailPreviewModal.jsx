import React from 'react';

const DetailPreviewModal = ({ isOpen, onClose, item, modelConfig, modelName }) => {
    if (!isOpen || !item) return null;

    const fields = Object.keys(modelConfig);

    const renderValue = (field, value) => {
        const config = modelConfig[field];
        if (value === undefined || value === null || value === '') return <span className="text-neutral-300 italic">—</span>;

        switch (config?.type) {
            case 'Boolean':
                return (
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${value ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-neutral-50 text-neutral-400 border border-neutral-100'}`}>
                        {value ? 'YES' : 'NO'}
                    </span>
                );
            case 'Date':
                return new Date(value).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
            case 'Number':
                if (field.toLowerCase().includes('price') || field.toLowerCase().includes('salary')) {
                    return `₱${Number(value).toLocaleString()}`;
                }
                return Number(value).toLocaleString();
            default:
                return String(value);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/20 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-neutral-100 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-neutral-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-1">{modelName} Record</p>
                            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                                {item[fields[0]] ? String(item[fields[0]]) : 'Untitled'}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-neutral-300 hover:text-neutral-600 transition-colors p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ID Badge */}
                <div className="px-6 pt-4">
                    <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">ID</span>
                        <code className="text-xs font-mono text-neutral-600 select-all">{item._id}</code>
                    </div>
                </div>

                {/* Fields */}
                <div className="px-6 py-5 space-y-0 divide-y divide-neutral-50">
                    {fields.map(field => (
                        <div key={field} className="flex items-start justify-between py-3">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest pt-0.5">
                                {modelConfig[field].label || field}
                            </span>
                            <span className="text-sm font-medium text-neutral-800 text-right max-w-[60%] break-words">
                                {renderValue(field, item[field])}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Timestamps */}
                <div className="px-6 pb-6 pt-2 flex gap-4">
                    {item.createdAt && (
                        <div className="flex-1 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3">
                            <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mb-1">Created</p>
                            <p className="text-xs text-neutral-500">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                    )}
                    {item.updatedAt && (
                        <div className="flex-1 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3">
                            <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mb-1">Updated</p>
                            <p className="text-xs text-neutral-500">{new Date(item.updatedAt).toLocaleString()}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailPreviewModal;
