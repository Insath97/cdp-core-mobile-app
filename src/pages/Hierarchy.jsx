import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useHierarchy } from '../context/HierarchyContext';
import {
    ChevronRight,
    ChevronDown,
    Building2,
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    X,
    Check,
    ShieldCheck,
    LayoutGrid,
    Users,
    Calendar,
    ArrowUpDown,
    Info,
    Target,
    Award,
    TrendingUp,
    UserCircle,
    Briefcase,
    DollarSign,
    Crown,
    Star,
    Medal,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Hierarchy = () => {
    const {
        targets,
        commissions,
        total_commission,
        isLoading,
        error,
        getHierarchies,
        levels,
        levelMap,
        sortedLevels
    } = useHierarchy();

    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('All');
    const [selectedPeriod, setSelectedPeriod] = useState(() => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
    const [sortBy, setSortBy] = useState('Default');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        levelId: '',
        parentId: 'none',
        targetAmount: '',
        userId: null
    });

    const containerRef = useRef(null);
    const detailsPanelRef = useRef(null);

    // Fetch data on component mount
    useEffect(() => {
        getHierarchies();
    }, []);

    // Handle click outside to deselect
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                if (!event.target.closest('button') && !event.target.closest('.drawer-content')) {
                    setSelectedNode(null);
                    setSelectedNodeDetails(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load detailed data when a node is selected
    useEffect(() => {
        const loadNodeDetails = async () => {
            if (selectedNode) {
                setIsLoadingDetails(true);
                try {
                    // Filter targets and commissions from the already-loaded Redux state by user_id
                    const nodeTargets = targets.filter(t => t.user_id === parseInt(selectedNode.id));
                    const nodeCommissions = commissions.filter(c => c.user_id === parseInt(selectedNode.id));

                    setSelectedNodeDetails({
                        ...selectedNode,
                        targets: nodeTargets,
                        commissions: nodeCommissions,
                        fromCache: true
                    });
                } catch (err) {
                    console.error('Error loading node details:', err);
                } finally {
                    setIsLoadingDetails(false);
                }
            } else {
                setSelectedNodeDetails(null);
            }
        };

        loadNodeDetails();
    }, [selectedNode, targets, commissions]);

    // Scroll to details panel when node is selected on desktop
    useEffect(() => {
        if (selectedNode && detailsPanelRef.current && window.innerWidth >= 1024) {
            detailsPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedNode]);

    // Get level details from levelMap
    const getLevelDetails = (levelId) => {
        return levelMap.get(levelId) || {
            level_name: `Level ${levelId}`,
            slug: `level-${levelId}`,
            code: `L${levelId}`,
            tire_level: levelId,
            category: 'general',
            isActive: true
        };
    };

    // Get available periods from data
    const availablePeriods = useMemo(() => {
        const periods = new Set();
        targets?.forEach(target => {
            if (target.period_key) {
                periods.add(target.period_key);
            }
        });
        return Array.from(periods).sort().reverse();
    }, [targets]);

    // Automatically select the most recent period when periods load
    useEffect(() => {
        if (availablePeriods.length > 0 && !availablePeriods.includes(selectedPeriod)) {
            setSelectedPeriod(availablePeriods[0]);
        }
    }, [availablePeriods, selectedPeriod]);

    // Transform API data into hierarchical structure
    const hierarchyData = useMemo(() => {
        if (!targets || !commissions || targets.length === 0) {
            return [];
        }

        // Create a map of users from targets
        const userMap = new Map();
        const userChildrenMap = new Map();

        // First, process all targets to get user information
        targets.forEach(target => {
            if (target.user) {
                const user = target.user;
                const levelDetails = getLevelDetails(user.level_id);

                // Get all commissions for this user in the selected period
                const userCommissions = commissions.filter(
                    c => c.user_id === user.id && c.period_key === selectedPeriod
                );

                // Calculate totals
                const totalCommission = userCommissions.reduce(
                    (sum, c) => sum + parseFloat(c.commission_amount),
                    0
                );

                const totalInvestment = userCommissions.reduce(
                    (sum, c) => sum + parseFloat(c.investment_amount),
                    0
                );

                // Get commission breakdown by tier
                const commissionsByTier = {
                    unit_head: userCommissions.filter(c => c.tier === 'unit_head').reduce((sum, c) => sum + parseFloat(c.commission_amount), 0),
                    parent: userCommissions.filter(c => c.tier === 'parent').reduce((sum, c) => sum + parseFloat(c.commission_amount), 0)
                };

                // Only add if user doesn't exist yet (prevent duplicates)
                if (!userMap.has(user.id)) {
                    userMap.set(user.id, {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        profileImage: user.profile_image,
                        levelId: user.level_id,
                        levelDetails: levelDetails,
                        levelName: levelDetails.level_name,
                        levelCode: levelDetails.code,
                        levelCategory: levelDetails.category,
                        parentId: user.parent_user_id?.toString() || null,
                        users: 0,
                        target: parseFloat(target.target_amount) || 0,
                        achieved: parseFloat(target.achieved_amount) || 0,
                        achievementPercentage: parseFloat(target.achievement_percentage) || 0,
                        remainingAmount: target.remaining_amount || 0,
                        commission: totalCommission,
                        commissionBreakdown: commissionsByTier,
                        investmentAmount: totalInvestment,
                        investmentCount: userCommissions.length,
                        investments: userCommissions.map(c => c.investment),
                        periodKey: target.period_key,
                        periodData: {
                            [target.period_key]: {
                                target: parseFloat(target.target_amount) || 0,
                                achieved: parseFloat(target.achieved_amount) || 0,
                                commission: totalCommission,
                                investmentAmount: totalInvestment,
                                achievementPercentage: parseFloat(target.achievement_percentage) || 0,
                                remainingAmount: target.remaining_amount || 0
                            }
                        },
                        children: [],
                        status: target.status,
                        achievedAt: target.achieved_at,
                        // Store all targets and commissions for this user
                        allTargets: targets.filter(t => t.user_id === user.id),
                        allCommissions: commissions.filter(c => c.user_id === user.id)
                    });
                }
            }
        });

        // Build the hierarchy by setting children arrays
        const users = Array.from(userMap.values());

        // Populate userChildrenMap with parent-child relationships using object references
        users.forEach(user => {
            if (user.parentId) {
                if (!userChildrenMap.has(user.parentId)) {
                    userChildrenMap.set(user.parentId, []);
                }
                userChildrenMap.get(user.parentId).push(user);
            }
        });

        // Set children arrays
        users.forEach(user => {
            if (userChildrenMap.has(user.id)) {
                user.children = userChildrenMap.get(user.id);
                user.users = user.children.length;
            }
        });

        // Sort users by level
        users.sort((a, b) => a.levelId - b.levelId);

        // Get root nodes
        const rootNodes = users.filter(user => !user.parentId);

        if (rootNodes.length === 0 && users.length > 0) {
            const lowestLevel = Math.min(...users.map(u => u.levelId));
            return users.filter(user => user.levelId === lowestLevel);
        }

        return rootNodes;
    }, [targets, commissions, selectedPeriod, levels]);

    // Helper function to find node by ID
    const findNodeById = (id, nodes) => {
        if (!id || !nodes) return null;

        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children && node.children.length > 0) {
                const found = findNodeById(id, node.children);
                if (found) return found;
            }
        }
        return null;
    };

    // Filter functionality
    const visibleNodesMap = useMemo(() => {
        const map = new Map();

        const matches = (nodes) => {
            nodes.forEach(node => {
                const matchesSearch = (node.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (node.levelName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (node.levelCode || '').toLowerCase().includes(searchTerm.toLowerCase());
                const matchesLevel = levelFilter === 'All' || node.levelId.toString() === levelFilter;

                if (matchesSearch && matchesLevel) {
                    let currentNode = node;
                    while (currentNode) {
                        map.set(currentNode.id, true);
                        currentNode = findNodeById(currentNode.parentId, hierarchyData);
                    }
                }

                if (node.children && node.children.length > 0) {
                    matches(node.children);
                }
            });
        };

        if (hierarchyData.length > 0) {
            matches(hierarchyData);
        }
        return map;
    }, [searchTerm, levelFilter, hierarchyData]);

    // Sort function for nodes
    const sortNodes = (nodes) => {
        if (!nodes) return [];

        let sortedNodes = [...nodes];

        switch (sortBy) {
            case 'Achievement':
                sortedNodes.sort((a, b) => b.achievementPercentage - a.achievementPercentage);
                break;
            case 'Target':
                sortedNodes.sort((a, b) => b.target - a.target);
                break;
            case 'Commission':
                sortedNodes.sort((a, b) => b.commission - a.commission);
                break;
            case 'Name':
                sortedNodes.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                sortedNodes.sort((a, b) => a.levelId - b.levelId);
        }

        return sortedNodes;
    };

    // Get color based on level category
    const getLevelColor = (category) => {
        const colors = {
            'executive': 'from-emerald-600 to-emerald-400',
            'management': 'from-blue-600 to-blue-400',
            'supervisory': 'from-green-600 to-green-400',
            'staff': 'from-gray-600 to-gray-400',
            'general': 'from-primary-600 to-primary-400'
        };
        return colors[category] || 'from-primary-600 to-primary-400';
    };

    // Get icon based on level
    const getLevelIcon = (category) => {
        switch (category) {
            case 'executive':
                return Crown;
            case 'management':
                return Star;
            case 'supervisory':
                return Medal;
            default:
                return UserCircle;
        }
    };

    const handleNodeSelect = async (node) => {
        setSelectedNode(node);
        if (window.innerWidth < 1024) {
            setIsDetailDrawerOpen(true);
        }
    };

    const handleRefreshDetails = async () => {
        if (selectedNode) {
            setIsLoadingDetails(true);
            try {
                await getHierarchyById(selectedNode.id);
            } catch (err) {
                console.error('Error refreshing details:', err);
            } finally {
                setIsLoadingDetails(false);
            }
        }
    };

    const handleOpenNewDrawer = () => {
        setIsEditMode(false);
        setFormData({
            name: '',
            levelId: sortedLevels[0]?.tire_level?.toString() || '',
            parentId: 'none',
            targetAmount: '',
            userId: null
        });
        setIsDrawerOpen(true);
    };

    const handleOpenEditDrawer = () => {
        if (!selectedNode) return;
        setIsEditMode(true);
        setFormData({
            name: selectedNode.name,
            levelId: selectedNode.levelId.toString(),
            parentId: selectedNode.parentId || 'none',
            targetAmount: selectedNode.target.toString(),
            userId: selectedNode.id
        });
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => setIsDrawerOpen(false);

    const handleSave = async () => {
        if (!formData.name) return;
        // API call would go here
        console.log('Saving:', formData);
        handleCloseDrawer();
    };

    const handleDelete = async () => {
        if (!selectedNode) return;
        // API call would go here
        console.log('Deleting:', selectedNode.id);
        setSelectedNode(null);
        setSelectedNodeDetails(null);
    };

    const TreeNode = ({ node, depth = 0 }) => {
        const [isExpanded, setIsExpanded] = useState(true);
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = selectedNode?.id === node.id;

        // Get level styling
        const levelColor = getLevelColor(node.levelCategory);
        const LevelIcon = getLevelIcon(node.levelCategory);

        // Get current period data
        const periodData = node.periodData?.[selectedPeriod] || node;
        const achievementRate = periodData.achievementPercentage ||
            ((periodData.achieved / periodData.target) * 100).toFixed(2);

        if (searchTerm && !visibleNodesMap.has(node.id)) return null;

        // Children nodes are already populated as object references
        const sortedChildNodes = sortNodes(node.children || []);

        return (
            <div className="w-full relative">
                {/* Visual Connector Lines */}
                {depth > 0 && (
                    <>
                        <div
                            className="absolute left-0 top-0 bottom-1/2 w-6 border-l-2 border-b-2 border-gray-200 dark:border-gray-700 rounded-bl-xl"
                            style={{
                                marginLeft: `calc(${depth - 1} * var(--indent-size, 32px) + 16px)`,
                                transform: 'translateY(-20px)'
                            }}
                        />
                        <div
                            className="absolute left-0 top-1/2 w-6 border-l-2 border-gray-200 dark:border-gray-700"
                            style={{
                                marginLeft: `calc(${depth - 1} * var(--indent-size, 32px) + 16px)`,
                                height: hasChildren ? '50%' : '0',
                                bottom: '0'
                            }}
                        />
                    </>
                )}

                <div
                    onClick={() => handleNodeSelect(node)}
                    className={cn(
                        "group relative flex items-center justify-between p-4 md:p-5 mb-3 rounded-2xl border-2 transition-all cursor-pointer",
                        isSelected
                            ? "border-primary-500 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-900/20 shadow-xl shadow-primary-500/10 ring-2 ring-primary-500/50"
                            : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg hover:scale-[1.02]"
                    )}
                    style={{
                        marginLeft: `calc(${depth} * var(--indent-size, 32px))`
                    }}
                >


                    <div className="flex items-start gap-3 flex-1 min-w-0 pl-2">
                        <div className="flex items-start pt-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className={cn(
                                    "p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-1 z-10 mt-1.5",
                                    !hasChildren && "invisible"
                                )}
                            >
                                {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                            </button>

                            <div className={cn(
                                "w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 relative",
                                isSelected
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                                    : `bg-gradient-to-br ${levelColor} text-white shadow-lg`
                            )}>
                                {node.profileImage ? (
                                    <img src={node.profileImage} alt={node.name} className="w-full h-full rounded-xl object-cover" />
                                ) : (
                                    <LevelIcon size={20} />
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col min-w-0 flex-1 pt-1">
                            <div className="flex items-center gap-2 flex-wrap leading-none mb-1">
                                <span className="font-black text-gray-900 dark:text-white text-base md:text-lg tracking-tight truncate leading-none">
                                    {node.name}
                                </span>
                                <span className={cn(
                                    "px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider leading-none",
                                    "bg-gradient-to-r text-white",
                                    levelColor
                                )}>
                                    {node.levelName}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                    <Briefcase size={12} />
                                    {node.levelCategory}
                                </span>
                                {node.users > 0 && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                            <Users size={12} />
                                            {node.users} Reports
                                        </span>
                                    </>
                                )}
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {selectedPeriod}
                                </span>
                            </div>

                            {/* Quick Metrics */}
                            <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1.5 rounded-[10px] border border-gray-100 dark:border-gray-800">
                                    <Target size={14} className="text-gray-400" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Target:</span>
                                    <span className="text-xs font-black text-gray-900 dark:text-white leading-none">Rs. {formatCurrency(periodData.target)}</span>
                                </div>

                                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/10 px-2.5 py-1.5 rounded-[10px] border border-emerald-100 dark:border-emerald-800/30">
                                    <TrendingUp size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest leading-none">Achieved:</span>
                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 leading-none">Rs. {formatCurrency(periodData.achieved)}</span>
                                </div>

                                {periodData.commission > 0 && (
                                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/10 px-2.5 py-1.5 rounded-[10px] border border-amber-100 dark:border-amber-800/30">
                                        <Award size={14} className="text-amber-500" />
                                        <span className="text-[10px] font-bold text-amber-600/80 dark:text-amber-400/80 uppercase tracking-widest leading-none">Commission:</span>
                                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 leading-none">Rs. {formatCurrency(periodData.commission)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Achievement Display */}
                    <div className="flex flex-col justify-center ml-4 pl-4 border-l border-gray-100 dark:border-gray-800 w-24 md:w-32 min-w-[6rem]">
                        <div className="flex justify-between items-end mb-1.5 leading-none">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Achieved</span>
                            <div className="flex items-baseline gap-0.5 leading-none">
                                <span className={cn(
                                    "text-sm font-black tracking-tight",
                                    parseFloat(achievementRate) >= 100 ? "text-emerald-500" :
                                        parseFloat(achievementRate) >= 80 ? "text-primary-500" : "text-gray-900 dark:text-white"
                                )}>
                                    {achievementRate}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">%</span>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-0.5">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    parseFloat(achievementRate) >= 100 ? "bg-emerald-500" :
                                        parseFloat(achievementRate) >= 80 ? "bg-emerald-500" : "bg-primary-500"
                                )}
                                style={{ width: `${Math.min(parseFloat(achievementRate), 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Children Nodes */}
                {hasChildren && isExpanded && sortedChildNodes.length > 0 && (
                    <div className="w-full mt-2">
                        {sortedChildNodes.map(childNode => (
                            <TreeNode key={childNode.id} node={childNode} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading && !hierarchyData.length) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 size={24} className="text-primary-600 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X size={32} className="text-red-600" />
                    </div>
                    <h3 className="text-lg font-black text-red-600 mb-2">Error Loading Hierarchy</h3>
                    <p className="text-gray-500">{error}</p>
                    <button
                        onClick={() => getHierarchies()}
                        className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const sortedRootNodes = sortNodes(hierarchyData);

    return (
        <div ref={containerRef} className="animate-in fade-in duration-500 pb-10 lg:pb-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Organization Hierarchy</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">View complete organizational structure with targets, achievements, and commissions.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg mb-8 sticky top-4 z-40">
                <div className="relative flex-1 group w-full xl:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, level, or code..."
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-primary-500/30 rounded-xl text-sm font-medium transition-all outline-none dark:text-white placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Level Filter */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                        <Filter size={14} />
                        <select
                            className="bg-transparent border-none p-0 text-xs font-medium focus:ring-0 cursor-pointer"
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                        >
                            <option value="All">All Levels</option>
                            {sortedLevels.map(level => (
                                <option key={level.id} value={level.tire_level.toString()}>
                                    Level {level.tire_level} - {level.level_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Period Filter */}
                    {availablePeriods.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                            <Calendar size={14} />
                            <select
                                className="bg-transparent border-none p-0 text-xs font-medium focus:ring-0 cursor-pointer"
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                            >
                                {availablePeriods.map(period => (
                                    <option key={period} value={period}>{period}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Sort Filter */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                        <ArrowUpDown size={14} />
                        <select
                            className="bg-transparent border-none p-0 text-xs font-medium focus:ring-0 cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="Default">Default (Level)</option>
                            <option value="Achievement">Achievement %</option>
                            <option value="Target">Target Amount</option>
                            <option value="Commission">Commission</option>
                            <option value="Name">Name</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tree View */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <LayoutGrid className="text-primary-600" size={20} />
                                    Reporting Structure
                                </h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">
                                    {sortedRootNodes.length} Root Nodes • {targets?.length || 0} Active Targets •
                                    Total Commission: Rs. {formatCurrency(total_commission)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {sortedLevels.slice(0, 4).map(level => (
                                    <div key={level.id} className="flex items-center gap-1">
                                        <div className={cn("w-2 h-2 rounded-full bg-gradient-to-r", getLevelColor(level.category))} />
                                        <span className="text-[8px] font-bold text-gray-500">{level.level_name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {sortedRootNodes.length > 0 ? (
                                sortedRootNodes.map(node => (
                                    <TreeNode key={node.id} node={node} depth={0} />
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-400 font-medium text-lg">No hierarchy data available</p>
                                    <p className="text-gray-400 text-sm mt-2">Add positions to build your organization structure</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detail Panel - Desktop */}
                <div ref={detailsPanelRef} className="hidden lg:block lg:col-span-4">
                    <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 sticky top-32">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                Position Details
                            </h3>
                            {selectedNode && (
                                <button
                                    onClick={handleRefreshDetails}
                                    disabled={isLoadingDetails}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <RefreshCw size={14} className={cn("text-gray-400", isLoadingDetails && "animate-spin")} />
                                </button>
                            )}
                        </div>

                        {selectedNode ? (
                            isLoadingDetails ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 size={32} className="text-primary-600 animate-spin mb-3" />
                                    <p className="text-sm text-gray-500">Loading details...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
                                            getLevelColor(selectedNode.levelCategory)
                                        )}>
                                            {selectedNode.profileImage ? (
                                                <img src={selectedNode.profileImage} alt={selectedNode.name} className="w-full h-full rounded-2xl object-cover" />
                                            ) : (
                                                <UserCircle size={28} />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 dark:text-white">{selectedNode.name}</h4>
                                            <p className="text-xs text-gray-500">{selectedNode.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                                                    {selectedNode.levelName}
                                                </span>
                                                <span className="text-[10px] text-gray-400">{selectedNode.levelCode}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Period Info */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase">Period</span>
                                            <span className="text-xs font-black text-primary-600">{selectedPeriod}</span>
                                        </div>
                                        {selectedNodeDetails?.fromCache && (
                                            <div className="mt-2 text-[8px] text-gray-400 flex items-center gap-1">
                                                <Info size={10} />
                                                Data from overview
                                            </div>
                                        )}
                                    </div>

                                    {/* Target Achievement */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-transparent dark:border-gray-800">
                                        <h5 className="text-[9px] font-bold text-gray-400 uppercase mb-3 px-1">Target Performance</h5>
                                        <div className="space-y-3">
                                            {(() => {
                                                const nodeTarget = selectedNodeDetails?.targets?.find(t => t.period_key === selectedPeriod);
                                                const targetAmt = parseFloat(nodeTarget?.target_amount || selectedNode.target || 0);
                                                const achievedAmt = parseFloat(nodeTarget?.achieved_amount || selectedNode.achieved || 0);
                                                const remainingAmt = parseFloat(nodeTarget?.remaining_amount || selectedNode.remainingAmount || 0);
                                                const achievementPct = parseFloat(nodeTarget?.achievement_percentage || selectedNode.achievementPercentage || 0);
                                                return (
                                                    <>
                                                        <div className="flex justify-between items-center group/item hover:bg-white dark:hover:bg-gray-800 p-2 rounded-lg transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Target Amount</span>
                                                            <span className="text-sm font-black text-gray-900 dark:text-white">Rs. {formatCurrency(targetAmt)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center group/item hover:bg-white dark:hover:bg-gray-800 p-2 rounded-lg transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Achieved Amount</span>
                                                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">Rs. {formatCurrency(achievedAmt)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center group/item hover:bg-white dark:hover:bg-gray-800 p-2 rounded-lg transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Remaining</span>
                                                            <span className="text-sm font-black text-amber-600 dark:text-amber-500">Rs. {formatCurrency(remainingAmt)}</span>
                                                        </div>
                                                        <div className="pt-2 px-1">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Achievement</span>
                                                                <span className="text-xs font-black text-gray-900 dark:text-white">{achievementPct.toFixed(2)}%</span>
                                                            </div>
                                                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${Math.min(achievementPct, 100)}%` }}
                                                                    className={cn(
                                                                        "h-full rounded-full",
                                                                        achievementPct >= 80
                                                                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                                            : "bg-gradient-to-r from-primary-600 to-primary-400"
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Commission Details - using Commission model fields: commission_amount, tier, investment_amount */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-transparent dark:border-gray-800">
                                        <h5 className="text-[9px] font-bold text-gray-400 uppercase mb-3 px-1">Commission & Incentives</h5>
                                        <div className="space-y-3">
                                            {(() => {
                                                // Filter commissions for this user in the selected period
                                                const periodCommissions = selectedNodeDetails?.commissions?.filter(
                                                    c => c.period_key === selectedPeriod
                                                ) || [];
                                                const totalCommission = periodCommissions.reduce(
                                                    (sum, c) => sum + parseFloat(c.commission_amount || 0), 0
                                                );
                                                const unitHeadCommission = periodCommissions
                                                    .filter(c => c.tier === 'unit_head')
                                                    .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);
                                                const parentCommission = periodCommissions
                                                    .filter(c => c.tier === 'parent')
                                                    .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);
                                                const totalInvestment = periodCommissions.reduce(
                                                    (sum, c) => sum + parseFloat(c.investment_amount || 0), 0
                                                );
                                                // Fallback to overview data if no detailed data
                                                const displayCommission = periodCommissions.length > 0 ? totalCommission : (selectedNode.commission || 0);
                                                const displayUnitHead = periodCommissions.length > 0 ? unitHeadCommission : (selectedNode.commissionBreakdown?.unit_head || 0);
                                                const displayParent = periodCommissions.length > 0 ? parentCommission : (selectedNode.commissionBreakdown?.parent || 0);
                                                const displayInvestment = periodCommissions.length > 0 ? totalInvestment : (selectedNode.investmentAmount || 0);
                                                const displayCount = periodCommissions.length > 0 ? periodCommissions.length : (selectedNode.investmentCount || 0);
                                                return (
                                                    <>
                                                        <div className="flex justify-between items-center group/item hover:bg-white dark:hover:bg-gray-800 p-2 rounded-lg transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Commission</span>
                                                            <span className="text-sm font-black text-amber-600 dark:text-amber-500">Rs. {formatCurrency(displayCommission)}</span>
                                                        </div>
                                                        <div className="space-y-2 pl-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Unit Head Share</span>
                                                                <span className="text-xs font-black text-gray-600 dark:text-gray-300">Rs. {formatCurrency(displayUnitHead)}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Parent Share</span>
                                                                <span className="text-xs font-black text-gray-600 dark:text-gray-300">Rs. {formatCurrency(displayParent)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-800 p-2 rounded-lg">
                                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Investment</span>
                                                            <span className="text-sm font-black text-gray-900 dark:text-white">Rs. {formatCurrency(displayInvestment)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center group/item hover:bg-white dark:hover:bg-gray-800 p-2 rounded-lg transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Investments Count</span>
                                                            <span className="text-sm font-black text-gray-900 dark:text-white">{displayCount}</span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Team Info */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                        <h5 className="text-[9px] font-bold text-gray-400 uppercase mb-3">Team Structure</h5>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-gray-400" />
                                            <span className="text-sm font-black text-gray-900 dark:text-white">{selectedNode.users} Direct Reports</span>
                                        </div>
                                        {selectedNode.users === 0 && (
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">No direct reports under this position</p>
                                        )}
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Info size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-400 text-sm font-medium">Select a position to view details</p>
                                <p className="text-gray-400 text-xs mt-2">Click on any node in the hierarchy</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Detail Drawer */}
            <AnimatePresence>
                {isDetailDrawerOpen && selectedNode && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDetailDrawerOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white dark:bg-gray-950 z-[101] shadow-2xl overflow-y-auto rounded-t-3xl lg:hidden"
                        >
                            <div className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white",
                                        getLevelColor(selectedNode.levelCategory)
                                    )}>
                                        {selectedNode.profileImage ? (
                                            <img src={selectedNode.profileImage} alt={selectedNode.name} className="w-full h-full rounded-xl object-cover" />
                                        ) : (
                                            <UserCircle size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 dark:text-white">{selectedNode.name}</h3>
                                        <p className="text-xs text-gray-500">{selectedNode.levelName} • {selectedNode.levelCode}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailDrawerOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <X size={18} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {isLoadingDetails ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <Loader2 size={24} className="text-primary-600 animate-spin mb-2" />
                                        <p className="text-xs text-gray-500">Loading details...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                            <h4 className="text-[9px] font-bold text-gray-400 uppercase mb-3">Period: {selectedPeriod}</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500">Target</span>
                                                    <span className="text-sm font-black">Rs. {formatCurrency(selectedNode.target)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500">Achieved</span>
                                                    <span className="text-sm font-black text-emerald-600">Rs. {formatCurrency(selectedNode.achieved)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500">Commission</span>
                                                    <span className="text-sm font-black text-amber-600">Rs. {formatCurrency(selectedNode.commission)}</span>
                                                </div>
                                            </div>
                                        </div>

                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Create/Edit Drawer */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseDrawer}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-950 z-[101] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                    {isEditMode ? 'Edit Position' : 'Add New Position'}
                                </h2>
                                <button onClick={handleCloseDrawer} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Level</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                            value={formData.levelId}
                                            onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                                        >
                                            <option value="">Select Level</option>
                                            {sortedLevels.map(level => (
                                                <option key={level.id} value={level.tire_level.toString()}>
                                                    Level {level.tire_level} - {level.level_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Parent</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                            value={formData.parentId}
                                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                        >
                                            <option value="none">No Parent (Root)</option>
                                            {hierarchyData.map(node => (
                                                <option key={node.id} value={node.id}>
                                                    {node.name} ({node.levelName})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Target Amount (Rs.)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                        value={formData.targetAmount}
                                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={handleSave}
                                    className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    {isEditMode ? 'Update Position' : 'Create Position'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// Add custom styles for indentation
const styles = `
    :root {
        --indent-size: 32px;
    }
    @media (max-width: 1024px) {
        :root {
            --indent-size: 24px;
        }
    }
    @media (max-width: 768px) {
        :root {
            --indent-size: 20px;
        }
    }
`;

if (typeof document !== 'undefined') {
    const styleTag = document.createElement('style');
    styleTag.id = 'hierarchy-styles';
    if (!document.getElementById(styleTag.id)) {
        styleTag.innerHTML = styles;
        document.head.appendChild(styleTag);
    }
}

export default Hierarchy;