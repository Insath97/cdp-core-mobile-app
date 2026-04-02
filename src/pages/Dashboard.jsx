import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDashboard } from '../context/DashboardContext';
import {
    DollarSign,
    ShoppingBag,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Target,
    Filter,
    CheckCircle2,
    Shield,
    Clock,
    AlertCircle
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const getCurrentFiscalYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0 is January, 3 is April
    if (month >= 3) {
        return `Fiscal Year ${year}-${(year + 1).toString().slice(-2)}`;
    }
    return `Fiscal Year ${year - 1}-${year.toString().slice(-2)}`;
};
const fiscalYearString = getCurrentFiscalYear();

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, change, isPositive, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl dark:hover:shadow-primary-900/10 hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={cn("p-2.5 rounded-xl", colorClass)}>
                <Icon size={18} />
            </div>
            <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                isPositive
                    ? 'text-green-600 bg-green-50 dark:bg-green-500/10'
                    : 'text-red-600 bg-red-50 dark:bg-red-500/10'
            )}>
                {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {change}
            </div>
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-[13px] font-semibold tracking-tight">{title}</h3>
        <p className="text-lg xl:text-xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
    </div>
);

const KPICards = ({ performance, role }) => {
    const isCustomer = role === 'customer';
    const targetAmt = Number(performance?.target) || 0;
    const achievedAmt = Number(performance?.achieved) || 0;
    const pendingAmt = Number(performance?.pending) || 0;
    const percentage = targetAmt > 0 ? ((achievedAmt / targetAmt) * 100).toFixed(2) : '0.00';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
                title={isCustomer ? "My Profit" : "Total Revenue"}
                value={`Rs. ${formatCurrency(achievedAmt)}`}
                change={performance?.trend || "+0%"}
                isPositive={true}
                icon={DollarSign}
                colorClass="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600"
            />
            <StatCard
                title={isCustomer ? "Commission" : "Target Quota"}
                value={isCustomer ? `Rs. ${formatCurrency(achievedAmt * 0.1)}` : `Rs. ${formatCurrency(targetAmt)}`}
                change="+5.2%"
                isPositive={true}
                icon={Target}
                colorClass="bg-primary-100 dark:bg-primary-500/20 text-primary-600"
            />
            <StatCard
                title="Achievement %"
                value={`${percentage}%`}
                change="-2.4%"
                isPositive={false}
                icon={TrendingUp}
                colorClass="bg-blue-100 dark:bg-blue-500/20 text-blue-600"
            />
            <StatCard
                title="Pending Action"
                value={`Rs. ${formatCurrency(pendingAmt)}`}
                change="+4.1%"
                isPositive={true}
                icon={Users}
                colorClass="bg-purple-100 dark:bg-purple-500/20 text-purple-600"
            />
        </div>
    );
};

const TargetTracker = ({ performance }) => {
    const targetAmt = Number(performance?.target) || 0;
    const achievedAmt = Number(performance?.achieved) || 0;
    const percentage = targetAmt > 0 ? ((achievedAmt / targetAmt) * 100).toFixed(2) : '0.00';

    // Calculate the circle circumference (2 * π * r) where r is 44% of the viewBox
    // For a circle with r=44% of container, the circumference is approximately 276
    const circumference = 2 * Math.PI * 44; // This should match your strokeDasharray value
    const fillPercentage = targetAmt > 0 ? Math.min(100, (achievedAmt / targetAmt) * 100) : 0;

    // Calculate strokeDashoffset - when fillPercentage is 0, offset should equal circumference (empty circle)
    // When fillPercentage is 100, offset should be 0 (full circle)
    const strokeDashoffset = circumference - (circumference * fillPercentage) / 100;

    const remaining = Math.max(0, targetAmt - achievedAmt);

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl transition-all duration-500 group-hover:bg-primary-500/10"></div>

            <div className="relative flex flex-col md:flex-row md:items-center gap-8">
                {/* Visual Progress */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle (empty track) */}
                        <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="10"
                            className="text-gray-100 dark:text-gray-800"
                        />

                        {/* Progress circle (filled portion) */}
                        {targetAmt > 0 && (
                            <circle
                                cx="50"
                                cy="50"
                                r="44"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="10"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="text-primary-600 transition-all duration-1000 ease-out"
                                style={{
                                    transition: 'stroke-dashoffset 1s ease-in-out'
                                }}
                            />
                        )}
                    </svg>

                    {/* Center text - always shows the percentage */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                        <span
                            className="font-black text-gray-900 dark:text-white leading-none whitespace-nowrap transition-all duration-300"
                            style={{
                                fontSize: percentage.length > 3 ? 'clamp(14px, 1.8vw, 20px)' : 'clamp(18px, 2.5vw, 30px)'
                            }}
                        >
                            {percentage}%
                        </span>
                        <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                            {targetAmt > 0 ? 'Progress' : 'No Goal'}
                        </span>
                    </div>
                </div>

                {/* Rest of your component remains the same */}
                <div className="flex-1 space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Overall Target Achievement</h2>
                        <div className="flex flex-wrap items-center gap-3">
                            {targetAmt > 0 ? (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Tracking Active</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <AlertCircle size={14} className="text-gray-400" />
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Goal Unassigned</span>
                                </div>
                            )}
                            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{fiscalYearString}</span>
                        </div>
                    </div>

                    {/* Metrics Grid - unchanged */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
                        <div className="space-y-1.5 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-primary-500/10 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-500 group/item">
                            <div className="flex items-center gap-2 text-gray-400 group-hover/item:text-primary-500 transition-colors">
                                <Target size={12} />
                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Target Amount</span>
                            </div>
                            <p className="text-base md:text-lg xl:text-xl font-black text-gray-900 dark:text-white tracking-tight transition-all duration-500">
                                <span className="text-[11px] md:text-xs xl:text-sm font-bold text-gray-400 mr-1 opacity-50">Rs.</span>
                                {formatCurrency(performance?.target)}
                            </p>
                        </div>

                        <div className="space-y-1.5 p-4 bg-primary-50/30 dark:bg-primary-900/10 rounded-2xl border border-primary-100/30 dark:border-primary-800/30 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:shadow-lg transition-all duration-500 group/item">
                            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                                <DollarSign size={12} />
                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Achieved</span>
                            </div>
                            <p className="text-base md:text-lg xl:text-xl font-black text-gray-900 dark:text-white tracking-tight transition-all duration-500">
                                <span className="text-[11px] md:text-xs xl:text-sm font-bold text-primary-600/50 mr-1">Rs.</span>
                                {formatCurrency(performance?.achieved)}
                            </p>
                        </div>

                        <div className="space-y-1.5 p-4 bg-orange-50/30 dark:bg-orange-900/10 rounded-2xl border border-orange-100/30 dark:border-orange-800/30 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-lg transition-all duration-500 group/item">
                            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                <Clock size={12} />
                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Remaining</span>
                            </div>
                            <p className="text-base md:text-lg xl:text-xl font-black text-gray-900 dark:text-white tracking-tight transition-all duration-500">
                                <span className="text-[11px] md:text-xs xl:text-sm font-bold text-orange-600/50 mr-1">Rs.</span>
                                {formatCurrency(remaining)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label, isDarkMode }) => {
    if (active && payload && payload.length) {
        return (
            <div className={cn(
                "p-4 rounded-xl shadow-2xl border outline-none",
                isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"
            )}>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3 mt-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 capitalize">{entry.name}:</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">Rs. {formatCurrency(entry.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const COLORS = ['#298c77', '#3b82f6', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const { dashboardData, isLoading, getDashboardData } = useDashboard();
    const date = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    React.useEffect(() => {
        if (user) {
            getDashboardData();
        }
    }, [user, getDashboardData]);

    if (!user) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const userPerformance = dashboardData ? {
        target: dashboardData.target_achievement.target_amount,
        achieved: dashboardData.target_achievement.achieved_amount,
        pending: dashboardData.target_achievement.remaining_amount,
        trend: `${dashboardData.target_achievement.percentage}%`
    } : null;

    const targetAmt = Number(userPerformance?.target) || 0;
    const achievedAmt = Number(userPerformance?.achieved) || 0;
    const percentage = targetAmt > 0 ? ((achievedAmt / targetAmt) * 100).toFixed(2) : '0.00';

    if (!userPerformance) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                <AlertCircle size={48} className="text-gray-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Data Available</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                    We couldn't find any performance metrics for your account. Please contact your administrator if you believe this is an error.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-4">
            {/* Tactical Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 md:mb-6">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Real-time performance metrics and business intelligence.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 sm:flex-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 shadow-sm text-center">
                        {date}
                    </div>

                </div>
            </div>

            {/* Target Tracking Banner */}
            <div className="mb-6">
                <TargetTracker performance={userPerformance} />
            </div>

            <KPICards performance={userPerformance} role={user?.role} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Growth Chart */}
                <div className="lg:col-span-3 space-y-4 md:space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm xl:max-w-[1100px]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Business Performance</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Growth tracking and revenue distribution across the business.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary-600 transition-colors">
                                    <Filter size={18} />
                                </button>
                                <select className="text-[13px] bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-gray-600 dark:text-gray-400 font-bold focus:ring-2 focus:ring-primary-500/20 py-2.5 pl-3 pr-8 cursor-pointer">
                                    <option>Last 7 Months</option>
                                    <option>Yearly Summary</option>
                                </select>
                            </div>
                        </div>

                        <div className="h-[200px] sm:h-[260px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%" minHeight={0}>
                                <AreaChart
                                    data={(dashboardData?.performance_chart || []).map(d => ({
                                        ...d,
                                        target_display: d.target > 0 ? d.target : null
                                    }))}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#298c77" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#298c77" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1f2937' : '#f3f4f6'} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 700 }}
                                        tickFormatter={(value) => `${value / 1000000}M`}
                                    />
                                    <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#298c77"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        animationDuration={1500}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="target_display"
                                        name="target"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        fillOpacity={1}
                                        fill="url(#colorTarget)"
                                        connectNulls={false}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Activity & Distribution */}
                <div className="lg:col-span-2 space-y-6">


                    {/* Revenue Distribution */}
                    <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 md:mb-4">Sector Overview</h2>
                        <div className="h-[140px] md:h-[180px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%" minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={dashboardData?.revenue_distribution || []}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(dashboardData?.revenue_distribution || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</span>
                                <span className="text-xl font-black text-gray-900 dark:text-white mt-1">{percentage}%</span>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            {(dashboardData?.revenue_distribution || []).map((item, index) => (
                                <div key={item.name} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{item.name}</span>
                                    <span className="ml-auto text-xs font-black text-gray-900 dark:text-white">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default Dashboard;
