import React, { useState, useEffect } from 'react';
import axios from 'axios';

import ConfirmationModal from '../components/ConfirmationModal';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const fetchLogs = () => {
        setLoading(true);
        axios.get('http://localhost:5001/api/admin/audit-logs')
            .then(res => {
                setLogs(res.data);
                setLoading(false);
                setSelectedIds(new Set());
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(new Set(logs.map(log => log._id)));
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

    const handleConfirmDelete = async () => {
        try {
            await axios.post('http://localhost:5001/api/admin/audit-logs/batch-delete', {
                ids: Array.from(selectedIds)
            });
            fetchLogs();
            setShowConfirmModal(false);
        } catch (err) {
            alert('Error deleting logs');
        }
    };

    const getActionStyle = (action) => {
        const styles = {
            'CREATE': 'bg-neutral-100 text-neutral-700',
            'UPDATE': 'bg-neutral-100 text-neutral-700',
            'DELETE': 'bg-neutral-200 text-neutral-600',
            'SOFT_DELETE': 'bg-neutral-100 text-neutral-500',
            'RESTORE': 'bg-neutral-100 text-neutral-700'
        };
        return styles[action] || 'bg-neutral-100 text-neutral-600';
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
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">Audit Logs</h1>
                    <p className="text-sm text-neutral-500">Track all changes</p>
                </div>
                {selectedIds.size > 0 && (
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        className="bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors animate-fade-in"
                    >
                        Delete Selected ({selectedIds.size})
                    </button>
                )}
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="px-4 py-3 text-left w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                        checked={logs.length > 0 && selectedIds.size === logs.length}
                                        onChange={handleSelectAll}
                                        disabled={logs.length === 0}
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Entity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Action</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {logs.map(log => (
                                <tr key={log._id} className={`hover:bg-neutral-50 transition-colors ${selectedIds.has(log._id) ? 'bg-neutral-50' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                            checked={selectedIds.has(log._id)}
                                            onChange={() => handleSelectRow(log._id)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-neutral-500 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                                        {log.entity}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getActionStyle(log.action)}`}>
                                            {log.action.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-neutral-400 font-mono">
                                        {log.entityId.slice(-8)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <details className="cursor-pointer">
                                            <summary className="text-neutral-500 hover:text-neutral-700">View</summary>
                                            <pre className="mt-2 text-xs bg-neutral-50 p-2 rounded border border-neutral-200 overflow-auto max-w-sm">
                                                {JSON.stringify(log.changes, null, 2)}
                                            </pre>
                                        </details>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-neutral-400 text-sm">
                                        No logs yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Audit Logs"
                message={`Are you sure you want to permanently delete ${selectedIds.size} audit log(s)?`}
                confirmText={`Delete ${selectedIds.size} Log(s)`}
                isDanger={true}
            />
        </div>
    );
};

export default AuditLogViewer;
