import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ConfirmationModal from '../components/ConfirmationModal';

const DynamicTable = ({ models }) => {
    const { model: modelName } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [itemToArchive, setItemToArchive] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());

    const modelConfig = models[modelName] || {};
    const fields = Object.keys(modelConfig);

    const fetchData = () => {
        setLoading(true);
        axios.get(`http://localhost:5001/api/${modelName}`)
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
                // Single item archive
                await axios.delete(`http://localhost:5001/api/${modelName}/${itemToArchive}`);
            } else {
                // Batch archive
                await axios.post(`http://localhost:5001/api/${modelName}/batch-archive`, {
                    ids: Array.from(selectedIds)
                });
            }
            fetchData();
            setShowArchiveModal(false);
            setItemToArchive(null);
            setSelectedIds(new Set()); // Clear selection
        } catch (err) {
            alert('Error archiving item(s)');
        }
    };

    // Helper to format values based on metadata type
    const renderCellValue = (item, field) => {
        const value = item[field];
        const config = modelConfig[field];

        if (value === undefined || value === null || value === '') return '-';

        // Dynamic type detection and rendering
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{modelName}</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Displaying {data.length} {data.length === 1 ? 'record' : 'records'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {data.length > 0 && selectedIds.size > 0 && (
                        <button
                            onClick={() => {
                                setItemToArchive(null); // Ensure no single item is selected
                                setShowArchiveModal(true);
                            }}
                            className="inline-flex items-center gap-2 bg-white text-neutral-600 border border-neutral-200 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-50 hover:text-red-600 transition-all shadow-sm"
                        >
                            Archive Selected ({selectedIds.size})
                        </button>
                    )}
                    <Link
                        to={`/${modelName}/add`}
                        className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-all shadow-sm"
                    >
                        <span className="text-lg">+</span> Add {modelName}
                    </Link>
                </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
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
                                <tr key={item._id} className={`hover:bg-neutral-50/30 transition-colors group ${selectedIds.has(item._id) ? 'bg-neutral-50' : ''}`}>
                                    <td className="px-6 py-4 text-sm text-neutral-700">
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
                                    <td className="px-6 py-4 text-right text-sm space-x-4">
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
        </div>
    );
};

export default DynamicTable;
