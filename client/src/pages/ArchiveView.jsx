import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmationModal from '../components/ConfirmationModal';
import DetailPreviewModal from '../components/DetailPreviewModal';
import {
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
    LeadingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import PullToRefresh from 'react-simple-pull-to-refresh';

const ArchiveView = ({ models }) => {
    const [selectedModel, setSelectedModel] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        isDanger: false,
        onConfirm: () => { }
    });
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [previewItem, setPreviewItem] = useState(null);

    const modelNames = Object.keys(models);
    const modelConfig = models[selectedModel] || {};
    const fields = Object.keys(modelConfig);

    const fetchArchived = () => {
        if (!selectedModel) return Promise.resolve();
        setLoading(true);
        return axios.get(`http://localhost:5001/api/${selectedModel}/archived`)
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setData([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (selectedModel) {
            fetchArchived();
            setSelectedIds(new Set());
        }
    }, [selectedModel]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(new Set(data.map(item => item._id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleRestoreClick = (id = null) => {
        const isBatch = !id;
        const count = isBatch ? selectedIds.size : 1;

        setModalConfig({
            isOpen: true,
            title: isBatch ? 'Restore Selected Items' : 'Restore Item',
            message: isBatch
                ? `Are you sure you want to restore ${count} item(s)? They will appear back in the main collection.`
                : 'Are you sure you want to restore this item? It will appear back in the main collection.',
            confirmText: isBatch ? `Restore ${count} Item(s)` : 'Restore',
            isDanger: false,
            onConfirm: async () => {
                try {
                    if (isBatch) {
                        await axios.post(`http://localhost:5001/api/${selectedModel}/batch-restore`, {
                            ids: Array.from(selectedIds)
                        });
                        setSelectedIds(new Set());
                    } else {
                        await axios.post(`http://localhost:5001/api/${selectedModel}/${id}/restore`);
                    }
                    fetchArchived();
                } catch (err) {
                    alert('Error restoring');
                }
            }
        });
    };

    const handleDeleteClick = (id = null) => {
        const isBatch = !id;
        const count = isBatch ? selectedIds.size : 1;

        setModalConfig({
            isOpen: true,
            title: isBatch ? 'Permanently Delete Selected' : 'Permanently Delete',
            message: isBatch
                ? `Are you sure you want to PERMANENTLY delete ${count} item(s)? This action cannot be undone.`
                : 'Are you sure you want to PERMANENTLY delete this item? This action cannot be undone.',
            confirmText: isBatch ? `Delete ${count} Permanently` : 'Delete Permanently',
            isDanger: true,
            onConfirm: async () => {
                try {
                    if (isBatch) {
                        await axios.post(`http://localhost:5001/api/${selectedModel}/batch-permanent-delete`, {
                            ids: Array.from(selectedIds)
                        });
                        setSelectedIds(new Set());
                    } else {
                        await axios.delete(`http://localhost:5001/api/${selectedModel}/${id}/permanent`);
                    }
                    fetchArchived();
                } catch (err) {
                    alert('Error deleting');
                }
            }
        });
    };

    const renderCellValue = (item, field) => {
        const value = item[field];
        const config = modelConfig[field];
        if (value === undefined || value === null || value === '') return '-';

        if (config?.type === 'Date') {
            return new Date(value).toLocaleDateString();
        }
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        return String(value);
    };

    return (
        <div className="fade-in">
            <div className="mb-6 md:mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">Data Archive</h1>
                <p className="text-sm text-neutral-500 mt-1">Review and manage soft-deleted records across your collections.</p>
            </div>

            {/* Filter bar */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-6 mb-6 md:mb-8 shadow-sm">
                <div className="flex flex-col gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 px-1">Source Collection</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full md:max-w-sm px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-900 bg-white shadow-sm outline-none transition-all"
                        >
                            <option value="">Choose a collection...</option>
                            {modelNames.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                    {selectedModel && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="bg-neutral-50 px-4 py-2.5 rounded-lg border border-neutral-100 flex items-center gap-3">
                                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{data.length} items archived</span>
                            </div>
                            {selectedIds.size > 0 && (
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleRestoreClick()}
                                        className="flex-1 sm:flex-none bg-white text-neutral-700 border border-neutral-200 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors"
                                    >
                                        Restore ({selectedIds.size})
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick()}
                                        className="flex-1 sm:flex-none bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors"
                                    >
                                        Delete ({selectedIds.size})
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selectedModel ? (
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card Layout with Pull-to-Refresh & Swipe Gestures */}
                            <div className="md:hidden">
                                <PullToRefresh onRefresh={fetchArchived} pullDownThreshold={60} maxPullDownDistance={95}>
                                    <div className="p-3 space-y-3 min-h-[50vh]">
                                        {data.length > 0 && (
                                            <label className="flex items-center gap-3 px-1 py-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                                    checked={data.length > 0 && selectedIds.size === data.length}
                                                    onChange={handleSelectAll}
                                                />
                                                Select all
                                            </label>
                                        )}
                                        {data.length > 0 ? (
                                            <SwipeableList threshold={0.25}>
                                                {data.map(item => (
                                                    <div key={item._id} className="mb-3">
                                                        <SwipeableListItem
                                                            leadingActions={
                                                                <LeadingActions>
                                                                    <SwipeAction onClick={() => handleRestoreClick(item._id)}>
                                                                        <div className="bg-neutral-900 text-white flex items-center justify-center w-full h-full rounded-xl shadow-sm text-sm font-bold tracking-wide">
                                                                            Restore
                                                                        </div>
                                                                    </SwipeAction>
                                                                </LeadingActions>
                                                            }
                                                            trailingActions={
                                                                <TrailingActions>
                                                                    <SwipeAction onClick={() => handleDeleteClick(item._id)}>
                                                                        <div className="bg-red-50 text-red-600 flex items-center justify-center w-full h-full rounded-xl border border-red-100 shadow-sm text-sm font-bold tracking-wide">
                                                                            Delete
                                                                        </div>
                                                                    </SwipeAction>
                                                                </TrailingActions>
                                                            }
                                                        >
                                                            <div className={`w-full border rounded-xl p-4 transition-all ${selectedIds.has(item._id) ? 'border-neutral-400 bg-neutral-50/50' : 'border-neutral-100 bg-white'}`}>
                                                                <div className="flex items-start gap-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="mt-1 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                                                        checked={selectedIds.has(item._id)}
                                                                        onChange={() => handleSelectRow(item._id)}
                                                                    />
                                                                    <div className="flex-1 min-w-0" onClick={() => setPreviewItem(item)}>
                                                                        {fields.map((field, i) => (
                                                                            <div key={field} className={i === 0 ? 'mb-2' : 'flex justify-between items-baseline py-1 border-t border-neutral-50'}>
                                                                                {i === 0 ? (
                                                                                    <p className="text-sm font-bold text-neutral-400 line-through decoration-neutral-300 truncate">{renderCellValue(item, field)}</p>
                                                                                ) : (
                                                                                    <>
                                                                                        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">{modelConfig[field].label || field}</span>
                                                                                        <span className="text-sm text-neutral-400 line-through decoration-neutral-300 text-right ml-2">{renderCellValue(item, field)}</span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                        {item.deletedAt && (
                                                                            <p className="text-[11px] text-neutral-400 italic mt-2 pt-2 border-t border-neutral-50">
                                                                                Archived {new Date(item.deletedAt).toLocaleDateString()}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </SwipeableListItem>
                                                    </div>
                                                ))}
                                            </SwipeableList>
                                        ) : (
                                            <div className="py-12 text-center text-neutral-400 text-sm">
                                                The archive for {selectedModel} is currently empty.
                                            </div>
                                        )}
                                    </div>
                                </PullToRefresh>
                            </div>

                            {/* Desktop Table Layout */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-200">
                                    <thead className="bg-neutral-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left w-10">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                                    checked={data.length > 0 && selectedIds.size === data.length}
                                                    onChange={handleSelectAll}
                                                    disabled={data.length === 0}
                                                />
                                            </th>
                                            {fields.map(field => (
                                                <th key={field} className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                                    {modelConfig[field].label || field}
                                                </th>
                                            ))}
                                            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest">Archived On</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {data.map(item => (
                                            <tr key={item._id} onClick={() => setPreviewItem(item)} className={`group hover:bg-neutral-50/30 transition-colors cursor-pointer ${selectedIds.has(item._id) ? 'bg-neutral-50' : ''}`}>
                                                <td className="px-6 py-4 text-sm text-neutral-700" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                                        checked={selectedIds.has(item._id)}
                                                        onChange={() => handleSelectRow(item._id)}
                                                    />
                                                </td>
                                                {fields.map(field => (
                                                    <td key={field} className="px-6 py-4 text-sm text-neutral-400 line-through decoration-neutral-300">
                                                        {renderCellValue(item, field)}
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4 text-sm text-neutral-400 italic">
                                                    {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm space-x-6" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleRestoreClick(item._id)}
                                                        className="text-neutral-600 hover:text-neutral-950 font-bold transition-colors"
                                                    >
                                                        Restore
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(item._id)}
                                                        className="text-neutral-300 hover:text-red-600 font-bold transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {data.length === 0 && (
                                            <tr>
                                                <td colSpan={fields.length + 3} className="px-6 py-20 text-center text-neutral-400 text-sm">
                                                    The archive for {selectedModel} is currently empty.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-12 md:p-20 text-center text-neutral-400 shadow-inner">
                    <p className="font-bold text-sm uppercase tracking-[0.2em] mb-2 opacity-50">Archive Portal</p>
                    <p className="text-xs">Please select a model from the dropdown above to manage its deleted records.</p>
                </div>
            )}

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                isDanger={modalConfig.isDanger}
            />

            <DetailPreviewModal
                isOpen={!!previewItem}
                onClose={() => setPreviewItem(null)}
                item={previewItem}
                modelConfig={modelConfig}
                modelName={selectedModel}
            />
        </div>
    );
};

export default ArchiveView;
