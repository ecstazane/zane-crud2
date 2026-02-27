import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const DynamicTable = ({ models }) => {
    const { model: modelName } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [itemToArchive, setItemToArchive] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [previewItem, setPreviewItem] = useState(null);

    const modelConfig = models[modelName] || {};
    const fields = Object.keys(modelConfig);

    const fetchData = () => {
        setLoading(true);
        return axios.get(`http://localhost:5001/api/${modelName}`)
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (modelName) fetchData();
    }, [modelName]);

    const handleArchiveClick = (id) => {
        setItemToArchive(id);
        setShowArchiveModal(true);
    };

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

    const handleConfirmArchive = async () => {
        try {
            if (itemToArchive) {
                await axios.delete(`http://localhost:5001/api/${modelName}/${itemToArchive}`);
            } else {
                await axios.post(`http://localhost:5001/api/${modelName}/batch-archive`, {
                    ids: Array.from(selectedIds)
                });
            }
            fetchData();
            setShowArchiveModal(false);
            setItemToArchive(null);
            setSelectedIds(new Set());
        } catch (err) {
            alert('Error archiving item(s)');
        }
    };

    const renderCellValue = (item, field) => {
        const value = item[field];
        const config = modelConfig[field];

        if (value === undefined || value === null || value === '') return '-';

        switch (config?.type) {
            case 'Boolean':
                return (
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${value ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-400'}`}>
                        {value ? 'YES' : 'NO'}
                    </span>
                );
            case 'Date':
                return new Date(value).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
            case 'Number':
                if (field.toLowerCase().includes('price')) {
                    return `₱${Number(value).toLocaleString()}`;
                }
                return value.toLocaleString();
            default:
                return <span className="truncate max-w-[200px] block" title={String(value)}>{String(value)}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">{modelName}</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Displaying {data.length} {data.length === 1 ? 'record' : 'records'}
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {data.length > 0 && selectedIds.size > 0 && (
                        <button
                            onClick={() => {
                                setItemToArchive(null);
                                setShowArchiveModal(true);
                            }}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white text-neutral-600 border border-neutral-200 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-50 hover:text-red-600 transition-all shadow-sm"
                        >
                            Archive ({selectedIds.size})
                        </button>
                    )}
                    <Link
                        to={`/${modelName}/add`}
                        className="hidden md:inline-flex flex-1 sm:flex-none items-center justify-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-all shadow-sm"
                    >
                        <span className="text-lg leading-none">+</span> Add {modelName}
                    </Link>
                </div>
            </div>

            {/* Mobile Card Layout with Pull-to-Refresh & Swipe Gestures */}
            <div className="md:hidden">
                <PullToRefresh onRefresh={fetchData} pullDownThreshold={60} maxPullDownDistance={95}>
                    <div className="space-y-3 pb-24 min-h-[50vh]">
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
                                                    <SwipeAction onClick={() => window.location.href = `/${modelName}/edit/${item._id}`}>
                                                        <div className="bg-neutral-900 text-white flex items-center justify-center w-full h-full rounded-xl shadow-sm text-sm font-bold tracking-wide">
                                                            Edit
                                                        </div>
                                                    </SwipeAction>
                                                </LeadingActions>
                                            }
                                            trailingActions={
                                                <TrailingActions>
                                                    <SwipeAction onClick={() => handleArchiveClick(item._id)}>
                                                        <div className="bg-red-50 text-red-600 flex items-center justify-center w-full h-full rounded-xl border border-red-100 shadow-sm text-sm font-bold tracking-wide">
                                                            Archive
                                                        </div>
                                                    </SwipeAction>
                                                </TrailingActions>
                                            }
                                        >
                                            <div className={`w-full bg-white border rounded-xl p-4 shadow-sm transition-all ${selectedIds.has(item._id) ? 'border-neutral-400 bg-neutral-50/50' : 'border-neutral-200'}`}>
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        className="mt-1 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                                        checked={selectedIds.has(item._id)}
                                                        onChange={() => handleSelectRow(item._id)}
                                                    />
                                                    <div className="flex-1 min-w-0" onClick={() => setPreviewItem(item)}>
                                                        {fields.map((field, i) => (
                                                            <div key={field} className={i === 0 ? 'mb-3' : 'flex justify-between items-baseline py-1.5 border-t border-neutral-50'}>
                                                                {i === 0 ? (
                                                                    <p className="text-sm font-bold text-neutral-900 truncate">{renderCellValue(item, field)}</p>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">{modelConfig[field].label || field}</span>
                                                                        <span className="text-sm text-neutral-700 text-right ml-2">{renderCellValue(item, field)}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </SwipeableListItem>
                                    </div>
                                ))}
                            </SwipeableList>
                        ) : (
                            <div className="bg-white border border-dashed border-neutral-200 rounded-xl p-12 text-center text-neutral-400 text-sm">
                                No {modelName?.toLowerCase()} records found.
                            </div>
                        )}
                    </div>
                </PullToRefresh>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
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
                                <th className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {data.map(item => (
                                <tr key={item._id} onClick={() => setPreviewItem(item)} className={`hover:bg-neutral-50/30 transition-colors group cursor-pointer ${selectedIds.has(item._id) ? 'bg-neutral-50' : ''}`}>
                                    <td className="px-6 py-4 text-sm text-neutral-700" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                            checked={selectedIds.has(item._id)}
                                            onChange={() => handleSelectRow(item._id)}
                                        />
                                    </td>
                                    {fields.map(field => (
                                        <td key={field} className="px-6 py-4 text-sm text-neutral-700">
                                            {renderCellValue(item, field)}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-right text-sm space-x-4" onClick={e => e.stopPropagation()}>
                                        <Link to={`/${modelName}/edit/${item._id}`} className="text-neutral-600 hover:text-neutral-950 font-semibold">
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleArchiveClick(item._id)}
                                            className="text-neutral-300 hover:text-red-500 font-semibold transition-colors"
                                        >
                                            Archive
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={fields.length + 2} className="px-6 py-16 text-center text-neutral-400 text-sm">
                                        No {modelName.toLowerCase()} records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showArchiveModal}
                onClose={() => setShowArchiveModal(false)}
                onConfirm={handleConfirmArchive}
                title={itemToArchive ? "Archive Item" : "Archive All Items"}
                message={itemToArchive
                    ? "Are you sure you want to move this item to the archive? You can restore it later."
                    : `Are you sure you want to move ${selectedIds.size} ${modelName} record(s) to the archive? You can restore them later.`
                }
                confirmText={itemToArchive ? "Archive" : `Archive ${selectedIds.size} Item(s)`}
                isDanger={true}
            />

            <DetailPreviewModal
                isOpen={!!previewItem}
                onClose={() => setPreviewItem(null)}
                item={previewItem}
                modelConfig={modelConfig}
                modelName={modelName}
            />

            {/* Mobile Floating Action Button (FAB) */}
            <Link
                to={`/${modelName}/add`}
                className="md:hidden fixed bottom-6 right-6 z-40 bg-neutral-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <span className="text-2xl leading-none">+</span>
            </Link>
        </div>
    );
};

export default DynamicTable;
