import React, { useState } from 'react';
import {
    Globe,
    Map,
    MapPin,
    Layers,
    Plus,
    X,
    Check,
    ChevronDown,
    Search,
    Filter,
    Edit2,
    Trash2,
    ArrowRight,
    PlusCircle,
    Binary,
    ShieldCheck,
    AlignCenter
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useParams, useNavigate } from 'react-router-dom';

const TerritorySetup = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [isInitialSelection, setIsInitialSelection] = useState(false);

    // Initial data with full fields
    const [territories, setTerritories] = useState([
        { id: 1, type: 'country', name: 'Sri Lanka', code: 'SL-001', parent: '-' },
        { id: 2, type: 'province', name: 'Western Province', code: 'WP-01', parent: 'Sri Lanka' },
        { id: 3, type: 'region', name: 'Colombo', code: 'COL-01', parent: 'Western Province' },
        { id: 4, type: 'zone', name: 'Colombo 07', code: 'Z-007', parent: 'Colombo' },
    ]);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        parent: ''
    });

    const territoryTypes = [
        { id: 'country', name: 'Country', icon: Globe, childType: 'province' },
        { id: 'province', name: 'Province', icon: Map, childType: 'region' },
        { id: 'region', name: 'Region', icon: MapPin, childType: 'zone' },
        { id: 'zone', name: 'Zone', icon: Layers, childType: null }
    ];

    // Handle automated opening based on URL parameter from sidebar & dynamic view filtering
    React.useEffect(() => {
        if (type && ['country', 'province', 'region', 'zone'].includes(type.toLowerCase())) {
            const normalizedType = type.toLowerCase();
            setSelectedType(normalizedType);
            setEditingItem(null);
            setIsInitialSelection(false); // Sidebar links for specific types open full form
            setFormData({ name: '', code: '', parent: '' });
            setIsDrawerOpen(true);
        } else {
            // Main setup view - reset selection state
            setSelectedType('');
            setIsDrawerOpen(false);
        }
    }, [type]);

    const filteredData = territories.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by URL type if present
        if (type && ['country', 'province', 'region', 'zone'].includes(type.toLowerCase())) {
            return matchesSearch && item.type.toLowerCase() === type.toLowerCase();
        }

        return matchesSearch;
    });

    const handleOpenDrawer = (targetType = '', item = null) => {
        if (item) {
            // Edit mode
            setEditingItem(item);
            setSelectedType(item.type);
            setIsInitialSelection(false);
            setFormData({
                name: item.name,
                code: item.code || '',
                parent: item.parent
            });
        } else {
            // Create mode
            setEditingItem(null);

            // Determine type: from argument (shortcut), from URL (level-specific view), or none (main view)
            const effectiveType = targetType || (type && ['country', 'province', 'region', 'zone'].includes(type.toLowerCase()) ? type.toLowerCase() : '');

            setSelectedType(effectiveType);

            if (effectiveType) {
                // Known type - direct entry
                setIsInitialSelection(false);
                setFormData({
                    name: '',
                    code: '',
                    parent: effectiveType === 'country' ? '-' : ''
                });
            } else {
                // Unknown type - start with selection
                setIsInitialSelection(true);
                setFormData({
                    name: '',
                    code: '',
                    description: '',
                    status: 'active',
                    parent: ''
                });
            }
        }
        setIsDrawerOpen(true);
    };

    const handleAddChild = (parentItem) => {
        const typeInfo = territoryTypes.find(t => t.id === parentItem.type);
        if (typeInfo && typeInfo.childType) {
            setEditingItem(null);
            setSelectedType(typeInfo.childType);
            setIsInitialSelection(false);
            setFormData({
                name: '',
                code: '',
                parent: parentItem.name
            });
            setIsDrawerOpen(true);
        }
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setEditingItem(null);
        if (type) {
            navigate('/territory-setup');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!selectedType || !formData.name || !formData.code) {
            alert('Territory Level, Name and Code are required.');
            return;
        }

        if (editingItem) {
            setTerritories(prev => prev.map(t =>
                t.id === editingItem.id ? {
                    ...t,
                    type: selectedType,
                    name: formData.name,
                    code: formData.code,
                    parent: formData.parent || '-'
                } : t
            ));
        } else {
            const newItem = {
                id: Date.now(),
                type: selectedType,
                name: formData.name,
                code: formData.code,
                parent: formData.parent || '-'
            };
            setTerritories(prev => [...prev, newItem]);
        }
        handleCloseDrawer();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this territory?')) {
            setTerritories(prev => prev.filter(t => t.id !== id));
        }
    };

    const getParentOptions = () => {
        switch (selectedType) {
            case 'province': return territories.filter(t => t.type === 'country');
            case 'region': return territories.filter(t => t.type === 'province');
            case 'zone': return territories.filter(t => t.type === 'region');
            default: return [];
        }
    };

    const renderFormFields = () => {
        const parentLabel = selectedType === 'province' ? 'Select Country' :
            selectedType === 'region' ? 'Select Province' :
                selectedType === 'zone' ? 'Select Region' : '';

        const parentOptions = getParentOptions();

        return (
            <div className="space-y-6 text-left">
                {/* Territory Level Selection - Always available but can be pre-set */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Territory Level</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                            {selectedType && territoryTypes.find(t => t.id === selectedType)?.icon ?
                                React.createElement(territoryTypes.find(t => t.id === selectedType).icon, { size: 18 }) :
                                <Layers size={18} />}
                        </div>
                        <select
                            className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-xl text-sm font-bold transition-all outline-none dark:text-white appearance-none cursor-pointer"
                            value={selectedType}
                            onChange={(e) => {
                                const newType = e.target.value;
                                setSelectedType(newType);
                                if (newType === 'country') {
                                    setFormData(prev => ({ ...prev, parent: '-' }));
                                } else {
                                    setFormData(prev => ({ ...prev, parent: '' }));
                                }
                            }}
                        >
                            <option value="">Select Level</option>
                            {territoryTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Additional fields only show if a type is selected */}
                {selectedType && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        {selectedType !== 'country' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{parentLabel}</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                        <ArrowRight size={18} />
                                    </div>
                                    <select
                                        name="parent"
                                        className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-xl text-sm font-bold transition-all outline-none dark:text-white appearance-none"
                                        value={formData.parent}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">{parentLabel}</option>
                                        {parentOptions.map(option => (
                                            <option key={option.id} value={option.name}>{option.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Name</label>
                                <div className="relative group">
                                    <AlignCenter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Name"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-xl text-sm font-bold transition-all outline-none dark:text-white font-mono uppercase"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomenclature Code</label>
                                <div className="relative group">
                                    <Binary size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                    <input
                                        type="text"
                                        name="code"
                                        placeholder="Code"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        );
    };

    const displayTitle = type && ['country', 'province', 'region', 'zone'].includes(type.toLowerCase())
        ? `${type.charAt(0).toUpperCase() + type.slice(1)} Setup`
        : 'Territory Setup';

    return (
        <div className="animate-in fade-in duration-500 pb-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">{displayTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Configure geographic hierarchy entities.</p>
                </div>

                <button
                    onClick={() => handleOpenDrawer()}
                    className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95 group h-fit"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    CREATE {type ? type.toUpperCase() : 'TERRITORY'}
                </button>
            </div>

            {/* Tactical Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative w-full md:max-w-[600px] flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, code, or type..."
                        className="w-full pl-10 pr-6 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Filter size={14} className="text-primary-500" />
                    {type ? `Filtered: ${type.toUpperCase()}` : 'View: All Tiers'}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/4">Entity Name</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nomenclature</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parent Entity</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-bold">
                        {filteredData.map((item) => {
                            const typeInfo = territoryTypes.find(t => t.id === item.type);
                            const Icon = typeInfo?.icon || Globe;
                            return (
                                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-primary-100 dark:border-primary-900/20 shadow-sm">
                                                <Icon size={16} />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span
                                                    onClick={() => handleOpenDrawer('', item)}
                                                    className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight cursor-pointer hover:text-primary-600 transition-colors"
                                                >
                                                    {item.name}
                                                </span>
                                                <span
                                                    onClick={() => handleOpenDrawer(item.type)}
                                                    className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] cursor-pointer hover:text-primary-500"
                                                >
                                                    {item.type}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Binary size={12} className="text-gray-400" />
                                            <span className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest font-mono">{item.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <ArrowRight size={12} className="text-primary-500" />
                                            {item.parent}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {typeInfo?.childType && (
                                                <button
                                                    onClick={() => handleAddChild(item)}
                                                    title={`Add ${typeInfo.childType}`}
                                                    className="p-2.5 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all hover:scale-110"
                                                >
                                                    <PlusCircle size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleOpenDrawer('', item)}
                                                className="p-2.5 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all hover:scale-110"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-110"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-28 text-gray-400 animate-in fade-in zoom-in duration-700">
                        <Layers size={64} className="mb-4 opacity-10" />
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-300">NO RESULTS AVAILABLE</p>
                    </div>
                )}
            </div>

            {/* Off-Canvas Drawer */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[9999] overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-500" onClick={handleCloseDrawer} />
                    <div className="absolute inset-x-0 bottom-0 top-0 md:inset-y-0 md:right-0 md:left-auto md:max-w-[520px] w-full bg-white dark:bg-gray-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in slide-in-from-right md:slide-in-from-right duration-500 flex flex-col border-l border-white/5">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl z-20">
                            <div className="text-left">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 rounded-2xl bg-primary-600/10 text-primary-600 shadow-sm border border-primary-600/10">
                                        {selectedType && territoryTypes.find(t => t.id === selectedType)?.icon ?
                                            React.createElement(territoryTypes.find(t => t.id === selectedType).icon, { size: 24 }) :
                                            <Layers size={24} />}
                                    </div>
                                    <span className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em]">Data Entry</span>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                    {editingItem ? 'Modify' : 'New'} <span className="text-primary-600">{selectedType || 'Entity'}</span>
                                </h2>
                            </div>
                            <button onClick={handleCloseDrawer} className="w-12 h-12 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center group active:scale-90">
                                <X size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar scroll-smooth">
                            {renderFormFields()}
                        </div>

                        {selectedType && (
                            <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-xl sticky bottom-0 z-20">
                                <button
                                    onClick={handleSave}
                                    className="w-full bg-primary-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-primary-600/40 hover:bg-primary-700 hover:shadow-primary-600/60 active:scale-[0.97] transition-all flex items-center justify-center gap-4 group"
                                >
                                    <Check size={20} className="group-hover:scale-150 transition-transform duration-300" />
                                    {editingItem ? 'UPDATE CONFIG' : 'SAVE CONFIG'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TerritorySetup;
