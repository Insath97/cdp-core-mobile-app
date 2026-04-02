import React, { useState, useRef, useEffect } from 'react';
import {
    Upload,
    FileText,
    Download,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    X,
    RefreshCw,
    ChevronDown,
    Table2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useBulkUpload } from '../context/BulkUploadContext';

// ─── Table Definitions ─────────────────────────────────────────────────────────
const DB_TABLES = [
    {
        id: 'customers',
        label: 'Investors / Customers',
        endpoint: '/bulk-upload/customers',
        templateColumns: ['full_name', 'id_number', 'email', 'phone_primary', 'address'],
        sampleRow: ['John Doe', '199012345678', 'john@example.com', '0771234567', 'No.1, Main St, Colombo'],
    },
    {
        id: 'users',
        label: 'System Users',
        endpoint: '/bulk-upload/users',
        templateColumns: ['name', 'email', 'phone', 'role', 'branch_code'],
        sampleRow: ['Jane Smith', 'jane@cdp.lk', '0712345678', 'bdm', 'BR001'],
    },
    {
        id: 'branches',
        label: 'Branches',
        endpoint: '/bulk-upload/branches',
        templateColumns: ['branch_code', 'name', 'address', 'province', 'region', 'zone'],
        sampleRow: ['BR001', 'Colombo Main', 'No.82-B/2, Colombo 04', 'Western', 'Colombo', 'Zone A'],
    },
    {
        id: 'investments',
        label: 'Investments',
        endpoint: '/bulk-upload/investments',
        templateColumns: ['customer_id_number', 'investment_product_name', 'investment_amount', 'start_date'],
        sampleRow: ['199012345678', 'CDP 5 Year Plan', '500000', '2025-01-01'],
    },
    {
        id: 'provinces',
        label: 'Provinces',
        endpoint: '/bulk-upload/provinces',
        templateColumns: ['name', 'country_name'],
        sampleRow: ['Western Province', 'Sri Lanka'],
    },
    {
        id: 'regions',
        label: 'Regions',
        endpoint: '/bulk-upload/regions',
        templateColumns: ['name', 'province_name'],
        sampleRow: ['Colombo Region', 'Western Province'],
    },
    {
        id: 'zones',
        label: 'Zones',
        endpoint: '/bulk-upload/zones',
        templateColumns: ['name', 'region_name'],
        sampleRow: ['Zone A', 'Colombo Region'],
    },
    {
        id: 'levels',
        label: 'Levels',
        endpoint: '/bulk-upload/levels',
        templateColumns: ['name', 'order', 'description'],
        sampleRow: ['Senior BDM', '2', 'Senior Business Development Manager'],
    },
];

// ─── Download CSV Template ──────────────────────────────────────────────────────
const downloadTemplate = (table) => {
    const header = table.templateColumns.join(',');
    const sample = table.sampleRow.join(',');
    const csvContent = `${header}\n${sample}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `template_${table.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Template downloaded for "${table.label}"`);
};

// ═══════════════════════════════════════════════════════════════════════════════
const BulkUpload = () => {
    const {
        tableList,
        tableListLoading,
        getList,
        isLoading,
        result,
        error,
        uploadCsvFile,
        resetBulkUpload
    } = useBulkUpload();

    useEffect(() => {
        getList();
    }, [getList]);

    console.log("tableList", tableList);

    const [selectedTableId, setSelectedTableId] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const selectedTableDefinition = DB_TABLES.find(t => t.id === selectedTableId);

    // Derive status from Redux state
    const status = isLoading ? 'uploading' : result ? 'success' : error ? 'error' : 'idle';

    const resetUpload = () => {
        setFile(null);
        resetBulkUpload();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleTableChange = (e) => {
        setSelectedTableId(e.target.value);
        resetUpload();
    };

    const handleFileSelect = (f) => {
        if (!f) return;
        if (!f.name.endsWith('.csv')) {
            toast.error('Only CSV files are accepted.');
            return;
        }
        setFile(f);
        resetBulkUpload();
    };

    const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files?.[0]);
    };

    const handleUpload = async () => {
        if (!selectedTableId || !file) return;
        const action = await uploadCsvFile(selectedTableId, file);
        if (uploadCsvFile.fulfilled.match(action)) {
            toast.success('Upload completed successfully!');
        } else {
            toast.error(action.payload?.message || 'Upload failed.');
        }
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-6 text-left pb-10">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">
                        Bulk Upload
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">
                        Select a database table and upload a CSV file to import records.
                    </p>
                </div>

            </div>

            <div className="max-w-2xl space-y-5">

                {/* ── Step 1: Select Table ── */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">1</span>
                        <p className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                            Select Database Table
                        </p>
                    </div>

                    <div className="relative">
                        <Table2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select
                            value={selectedTableId}
                            onChange={handleTableChange}
                            disabled={tableListLoading}
                            className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all cursor-pointer"
                        >
                            <option value="">{tableListLoading ? 'Loading tables...' : 'Choose a table'}</option>
                            {tableList?.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Required Columns */}
                    {/* {selectedTableDefinition && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Required CSV Columns</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedTableDefinition.templateColumns.map(col => (
                                    <span key={col} className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-[11px] font-bold border border-primary-100 dark:border-primary-800">
                                        {col}
                                    </span>
                                ))}
                            </div>
                            <button
                                onClick={() => downloadTemplate(selectedTableDefinition)}
                                className="mt-1 flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                <Download size={13} />
                                Download CSV Template
                            </button>
                        </div>
                    )} */}
                </div>

                {/* ── Step 2: Upload File ── */}
                <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4 transition-opacity ${!selectedTableId ? 'opacity-40 pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">2</span>
                        <p className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                            Upload CSV File
                        </p>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => !file && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer
                            ${file
                                ? 'border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/10'
                                : isDragging
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 scale-[1.01]'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 bg-gray-50 dark:bg-gray-800/30'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        />

                        {file ? (
                            <div className="flex items-center gap-4 p-5">
                                <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                                    <FileText size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {(file.size / 1024).toFixed(1)} KB · ready to upload
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                                <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mb-3">
                                    <Upload size={26} />
                                </div>
                                <p className="text-sm font-black text-gray-700 dark:text-gray-300 mb-1">
                                    Drop your CSV file here
                                </p>
                                <p className="text-xs text-gray-400">
                                    or <span className="text-primary-600 font-bold">click to browse</span> · .csv only
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleUpload}
                            disabled={!file || status === 'uploading'}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                                ${file && status !== 'uploading'
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/25 active:scale-[0.98]'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {status === 'uploading'
                                ? <><Loader2 size={15} className="animate-spin" /> Uploading...</>
                                : <><Upload size={15} /> Upload</>
                            }
                        </button>

                        {(status === 'success' || status === 'error') && (
                            <button
                                onClick={resetUpload}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            >
                                <RefreshCw size={13} /> Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Result: Success ── */}
                {status === 'success' && result && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-emerald-100 dark:border-emerald-800">
                            <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-black text-gray-900 dark:text-white">Upload Successful</p>
                                <p className="text-xs text-gray-500 font-medium">{result.message}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-emerald-100 dark:divide-emerald-800/60">
                            <div className="flex flex-col items-center py-5">
                                <span className="text-2xl font-black text-emerald-600">{result.inserted}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Rows Inserted</span>
                            </div>
                            <div className="flex flex-col items-center py-5">
                                <span className="text-2xl font-black text-red-500">{result.failed ?? 0}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Rows Failed</span>
                            </div>
                        </div>
                        {result.errors?.length > 0 && (
                            <div className="p-5 border-t border-emerald-100 dark:border-emerald-800 space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <AlertCircle size={11} /> Failed Rows
                                </p>
                                <div className="max-h-40 overflow-y-auto space-y-1.5">
                                    {result.errors.map((err, i) => (
                                        <div key={i} className="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 text-xs text-red-700 dark:text-red-400 font-medium">
                                            {typeof err === 'string' ? err : err.message ?? err.error ?? JSON.stringify(err)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Result: Error ── */}
                {status === 'error' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-start gap-3">
                        <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-black text-red-700 dark:text-red-400">Upload Failed</p>
                            <p className="text-xs text-red-600 dark:text-red-300 mt-0.5 font-medium">{error?.message || 'Something went wrong'}</p>
                        </div>
                    </div>
                )}

                {/* ── Template Preview ── */}
                {/* {selectedTableDefinition && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                            <FileText size={14} className="text-gray-400" />
                            <p className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                CSV Template Preview — {selectedTableDefinition.label}
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs font-mono">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/60">
                                        {selectedTableDefinition.templateColumns.map(col => (
                                            <th key={col} className="px-4 py-2.5 text-left font-black uppercase tracking-wide text-primary-600 border-b border-r last:border-r-0 border-gray-100 dark:border-gray-800 whitespace-nowrap">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {selectedTableDefinition.sampleRow.map((val, i) => (
                                            <td key={i} className="px-4 py-2.5 text-gray-500 dark:text-gray-400 border-r last:border-r-0 border-gray-100 dark:border-gray-800 border-b whitespace-nowrap">
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="text-gray-300 dark:text-gray-700">
                                        {selectedTableDefinition.sampleRow.map((_, i) => (
                                            <td key={i} className="px-4 py-2 border-r last:border-r-0 border-gray-100 dark:border-gray-800">···</td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default BulkUpload;
