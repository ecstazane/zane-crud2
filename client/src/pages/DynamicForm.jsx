import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DynamicForm = ({ models }) => {
    const { model: modelName, id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const modelConfig = models[modelName] || {};
    const fields = Object.keys(modelConfig);

    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const formatDateForInput = (dateVal) => {
        if (!dateVal) return '';
        const date = new Date(dateVal);
        return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
    };

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            axios.get(`http://localhost:5001/api/${modelName}/${id}`)
                .then(res => {
                    const fetchedData = { ...res.data };
                    fields.forEach(f => {
                        if (modelConfig[f].type === 'Date') {
                            fetchedData[f] = formatDateForInput(fetchedData[f]);
                        }
                    });
                    setFormData(fetchedData);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        } else {
            const defaults = {};
            fields.forEach(f => {
                if (modelConfig[f].default !== undefined) defaults[f] = modelConfig[f].default;
            });
            setFormData(defaults);
        }
    }, [id, modelName, models]);

    const validateField = (name, value) => {
        const config = modelConfig[name];
        if (!config) return '';

        if (config.required && (value === '' || value === undefined || value === null)) {
            return `${config.label || name} is required`;
        }

        if (value && config.type === 'Number') {
            const num = Number(value);
            if (config.min !== undefined && num < config.min) return `Minimum: ${config.min}`;
            if (config.max !== undefined && num > config.max) return `Maximum: ${config.max}`;
        }

        if (value && config.type === 'String') {
            if (config.minLength && value.length < config.minLength) return `Min length: ${config.minLength}`;
            if (config.maxLength && value.length > config.maxLength) return `Max length: ${config.maxLength}`;
        }

        return '';
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));

        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, val) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalErrors = {};
        fields.forEach(f => {
            const err = validateField(f, formData[f]);
            if (err) finalErrors[f] = err;
        });

        if (Object.keys(finalErrors).length > 0) {
            setErrors(finalErrors);
            setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
            return;
        }

        setSaving(true);
        try {
            const submissionData = { ...formData };
            fields.forEach(f => {
                if (modelConfig[f].type === 'String' && typeof submissionData[f] === 'string') {
                    submissionData[f] = submissionData[f].trim();
                }
            });

            if (isEdit) {
                await axios.put(`http://localhost:5001/api/${modelName}/${id}`, submissionData);
            } else {
                await axios.post(`http://localhost:5001/api/${modelName}`, submissionData);
            }
            navigate(`/${modelName}`);
        } catch (err) {
            alert('Error: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
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
        <div className="fade-in max-w-xl mx-auto">
            <button
                onClick={() => navigate(`/${modelName}`)}
                className="text-sm text-neutral-500 hover:text-neutral-900 mb-6 md:mb-8 flex items-center gap-2 transition-colors font-medium text-xs uppercase tracking-wider min-h-[44px]"
            >
                ← Back to {modelName}
            </button>

            <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
                <div className="mb-6 md:mb-8">
                    <h1 className="text-lg md:text-xl font-bold text-neutral-900">{isEdit ? 'Update' : 'Create New'} {modelName}</h1>
                    <p className="text-sm text-neutral-500 mt-1">Please fill in the details below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                    {fields.map(field => {
                        const config = modelConfig[field];
                        const error = touched[field] ? errors[field] : '';

                        return (
                            <div key={field}>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 px-1">
                                    {config.label || field}
                                    {config.required && <span className="text-red-400 ml-1">*</span>}
                                </label>

                                {config.type === 'Boolean' ? (
                                    <label className="flex items-center gap-3 cursor-pointer group bg-neutral-50 p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-all min-h-[48px]">
                                        <input
                                            type="checkbox"
                                            name={field}
                                            checked={!!formData[field]}
                                            onChange={handleChange}
                                            className="w-5 h-5 rounded-lg border-neutral-300 text-neutral-900 focus:ring-neutral-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-semibold text-neutral-700 select-none">
                                            {formData[field] ? 'Enabled / True' : 'Disabled / False'}
                                        </span>
                                    </label>
                                ) : config.options ? (
                                    <select
                                        name={field}
                                        value={formData[field] || ''}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-4 py-3 min-h-[48px] border rounded-xl text-sm focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-900 bg-white transition-all outline-none
                                            ${error ? 'border-red-400 bg-red-50/30' : 'border-neutral-200'}`}
                                    >
                                        <option value="">Select option...</option>
                                        {config.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type={config.type === 'Number' ? 'number' : config.type === 'Date' ? 'date' : 'text'}
                                        name={field}
                                        value={formData[field] ?? ''}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-4 py-3 min-h-[48px] border rounded-xl text-sm focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-900 transition-all outline-none
                                            ${error ? 'border-red-400 bg-red-50/30' : 'border-neutral-200'}`}
                                        placeholder={`Enter ${field.toLowerCase()}...`}
                                    />
                                )}

                                {error && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">{error}</p>}
                            </div>
                        );
                    })}

                    <div className="pt-6 flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-3 sm:gap-4 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={() => navigate(`/${modelName}`)}
                            className="w-full sm:w-auto px-6 py-3 sm:py-2.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors rounded-xl hover:bg-neutral-50 min-h-[48px] sm:min-h-0"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:w-auto px-8 py-3 sm:py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-md shadow-neutral-200 min-h-[48px] sm:min-h-0"
                        >
                            {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Record')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DynamicForm;
