import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const DynamicTable = ({ models }) => {
    const { model: modelName } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id) => {
        if (!window.confirm('Move to archive?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/${modelName}/${id}`);
            fetchData();
        } catch (err) {
            alert('Error archiving item');
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
                <Link
                    to={`/${modelName}/add`}
                    className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-all shadow-sm"
                >
                    <span className="text-lg">+</span> Add {modelName}
                </Link>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50/50">
                            <tr>
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
                                <tr key={item._id} className="hover:bg-neutral-50/30 transition-colors group">
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
                                            onClick={() => handleDelete(item._id)}
                                            className="text-neutral-300 hover:text-red-500 font-semibold transition-colors"
                                        >
                                            Archive
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={fields.length + 1} className="px-6 py-16 text-center text-neutral-400 text-sm">
                                        No {modelName.toLowerCase()} records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DynamicTable;
