export const HIERARCHY_LEVELS = [
    'Admin',
    'Zone Head',
    'Regional Head',
    'Branch Manager',
    'BDM',
    'Agency',
    'Individual'
];

import { ALL_PERMISSIONS, PERMISSIONS } from '../constants/permissions';

const createMockRole = (name, permissionNames) => ({
    id: Math.floor(Math.random() * 1000),
    name: name,
    permissions: permissionNames.map((p, index) => ({
        id: index + 1,
        name: p
    }))
});

export const MOCK_USERS = [
    {
        id: '1',
        name: 'Admin User',
        user_type: 'admin',
        level: 'Admin',
        email: 'admin@cdp.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        parentId: null,
        roles: [createMockRole('Super Admin', ALL_PERMISSIONS)]
    },
    {
        id: '2',
        name: 'Sarah Chen',
        user_type: 'management',
        level: 'Zone Head',
        email: 'sarah.c@nexus.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        parentId: '1',
        roles: [createMockRole('Regional Manager', [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.INVESTMENT_INDEX,
            PERMISSIONS.QUOTATION_INDEX,
            PERMISSIONS.CUSTOMER_INDEX
        ])]
    },
    {
        id: '3',
        name: 'Michael Ross',
        user_type: 'management',
        level: 'Regional Head',
        email: 'michael.r@nexus.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        parentId: '2',
        roles: [createMockRole('Regional Manager', [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.INVESTMENT_INDEX,
            PERMISSIONS.QUOTATION_INDEX,
            PERMISSIONS.CUSTOMER_INDEX
        ])]
    },
    {
        id: '4',
        name: 'David BDM',
        user_type: 'bdm',
        level: 'BDM',
        email: 'david.bdm@nexus.com',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop',
        parentId: '3',
        roles: [createMockRole('BDM', [
            PERMISSIONS.MY_TARGETS,
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.INVESTMENT_INDEX,
            PERMISSIONS.QUOTATION_INDEX,
            PERMISSIONS.CUSTOMER_INDEX
        ])]
    },
    {
        id: '5',
        name: 'Premier Agency',
        user_type: 'customer',
        level: 'Agency',
        email: 'contact@premier.com',
        avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
        parentId: '4',
        roles: [createMockRole('Agency', [
            PERMISSIONS.INVESTMENT_INDEX
        ])]
    },
    {
        id: '6',
        name: 'Branch Coordinator',
        user_type: 'coordinator',
        level: 'Individual',
        email: 'coord@cdp.com',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
        parentId: '3',
        roles: [createMockRole('Coordinator', [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.INVESTMENT_INDEX,
            PERMISSIONS.QUOTATION_INDEX,
            PERMISSIONS.CUSTOMER_INDEX
        ])]
    }
];

export const MOCK_PERFORMANCE = {
    '1': { target: 10000000, achieved: 8500000, pending: 1500000, trend: '+12%' },
    '2': { target: 5000000, achieved: 4200000, pending: 800000, trend: '+8%' },
    '3': { target: 2000000, achieved: 1800000, pending: 200000, trend: '+5%' },
    '4': { target: 500000, achieved: 450000, pending: 50000, trend: '+15%' },
    '5': { target: 100000, achieved: 95000, pending: 5000, trend: '+20%' },
    '6': { target: 2000000, achieved: 1200000, pending: 800000, trend: '+10%' }
};

export const MOCK_MONTHLY_DATA = [
    { month: 'Jan', revenue: 4500000, target: 4000000 },
    { month: 'Feb', revenue: 5200000, target: 4200000 },
    { month: 'Mar', revenue: 4800000, target: 4500000 },
    { month: 'Apr', revenue: 6100000, target: 5000000 },
    { month: 'May', revenue: 5900000, target: 5500000 },
    { month: 'Jun', revenue: 7200000, target: 6000000 },
    { month: 'Jul', revenue: 8500000, target: 7000000 },
];

export const MOCK_DISTRIBUTION_DATA = [
    { name: 'Motor', value: 45 },
    { name: 'Health', value: 30 },
    { name: 'Life', value: 15 },
    { name: 'Marine', value: 10 },
];

export const MOCK_POLICIES = [
    { id: 'POL-001', customer: 'Global Logistics', agent: 'David BDM', type: 'Marine', status: 'Active', premium: 125000, date: '2024-03-15' },
    { id: 'POL-002', customer: 'Tech Pioneers', agent: 'David BDM', type: 'Life', status: 'Pending', premium: 45000, date: '2024-03-14' },
    { id: 'POL-003', customer: 'HealthGuard Inc', agent: 'Sarah Chen', type: 'Health', status: 'Active', premium: 280000, date: '2024-03-12' },
    { id: 'POL-004', customer: 'Auto Group Ltd', agent: 'Michael Ross', type: 'Motor', status: 'Cancelled', premium: 15000, date: '2024-03-10' },
    { id: 'POL-005', customer: 'Sunrise Exports', agent: 'Sarah Chen', type: 'Marine', status: 'Active', premium: 95000, date: '2024-03-08' },
    { id: 'POL-006', customer: 'Future Soft', agent: 'Michael Ross', type: 'Life', status: 'Active', premium: 62000, date: '2024-03-05' },
    { id: 'POL-007', customer: 'Pure Water Co', agent: 'David BDM', type: 'Health', status: 'Expired', premium: 35000, date: '2024-03-01' },
    { id: 'POL-008', customer: 'City Transit', agent: 'Sarah Chen', type: 'Motor', status: 'Active', premium: 120000, date: '2024-02-28' },
];

export const MOCK_DETAILED_STATS = {
    totalPolicies: 1240,
    activeAgents: 45,
    averagePremium: 82500,
    claimRatio: '12.4%'
};

export const MOCK_PERMISSIONS = [
    {
        group: 'Dashboard',
        permissions: ['View Analytics', 'Export Reports', 'View Revenue', 'View Targets']
    },
    {
        group: 'User Management',
        permissions: ['Create User', 'Edit User', 'Delete User', 'View Hierarchy', 'Assign Roles']
    },
    {
        group: 'Financials',
        permissions: ['View Commissions', 'Process Claims', 'Audit Transactions', 'Management Fees']
    },
    {
        group: 'System',
        permissions: ['Configure System', 'View Audit Logs', 'Manage Branches', 'API Access']
    }
];

export const MOCK_ROLES = [
    {
        id: '1',
        name: 'Super Admin',
        guardName: 'api',
        createdAt: '1/19/2026',
        permissions: ['View Analytics', 'Create User', 'Configure System', 'Audit Transactions']
    },
    {
        id: '2',
        name: 'Regional Manager',
        guardName: 'api',
        createdAt: '1/18/2026',
        permissions: ['View Analytics', 'Export Reports', 'View Hierarchy']
    },
];

export const MOCK_CUSTOMERS = [
    {
        id: '1',
        fullName: 'Arshad Khan',
        nic: '12345-6789012-3',
        email: 'arshad.k@gmail.com',
        contactNumber: '+94 77 123 4567',
        address: '123 Galle Road, Colombo 03',
        amountInvestment: 500000,
        policyNumber: 'CDP-POL-2024-001',
        profit: 25000,
        status: 'approved',
        dateJoined: '2024-01-15',
        branchId: '1',
        bdmId: '4',
        agencyId: '5'
    },
    {
        id: '2',
        fullName: 'Nimra Perera',
        nic: '98765-4321098-7',
        email: 'nimra.p@outlook.com',
        contactNumber: '+94 71 987 6543',
        address: '45/1 Kandy Road, Kurunegala',
        amountInvestment: 1200000,
        policyNumber: '',
        profit: 0,
        status: 'pending',
        dateJoined: '2024-03-20',
        branchId: '1',
        bdmId: '4',
        agencyId: '5'
    },
    {
        id: '3',
        fullName: 'Kasun Jayawardena',
        nic: '45678-9012345-6',
        email: 'kasun.j@yahoo.com',
        contactNumber: '+94 70 456 7890',
        address: 'No 12, Main Street, Matara',
        amountInvestment: 250000,
        policyNumber: 'CDP-POL-2024-002',
        profit: 12500,
        status: 'approved',
        dateJoined: '2024-02-10',
        branchId: '2',
        bdmId: '4',
        agencyId: '5'
    }
];

export const MOCK_HIERARCHY = [
    {
        id: '1',
        name: 'Corporate (GM Office)',
        level: 0,
        levelName: 'General Manager',
        users: 5,
        target: 10000000,
        achieved: 7250000,
        parentId: null,
        children: ['2', '5'],
        periods: {
            'FY 2024-25': { target: 10000000, achieved: 7250000 },
            'Q1 Performance': { target: 2500000, achieved: 2200000 },
            'Q2 Performance': { target: 2500000, achieved: 1800000 },
            'Monthly': { target: 850000, achieved: 710000 }
        }
    },
    {
        id: '2',
        name: 'North Region',
        level: 1,
        levelName: 'Regional Manager',
        users: 12,
        target: 5000000,
        achieved: 3800000,
        parentId: '1',
        children: ['3', '4'],
        periods: {
            'FY 2024-25': { target: 5000000, achieved: 3800000 },
            'Q1 Performance': { target: 1250000, achieved: 1100000 },
            'Q2 Performance': { target: 1250000, achieved: 950000 },
            'Monthly': { target: 400000, achieved: 320000 }
        }
    },
    {
        id: '3',
        name: 'Delhi Branch',
        level: 2,
        levelName: 'Branch Manager',
        users: 6,
        target: 2500000,
        achieved: 1900000,
        parentId: '2',
        children: [],
        periods: {
            'FY 2024-25': { target: 2500000, achieved: 1900000 },
            'Q1 Performance': { target: 625000, achieved: 550000 },
            'Q2 Performance': { target: 625000, achieved: 480000 },
            'Monthly': { target: 200000, achieved: 165000 }
        }
    },
    {
        id: '4',
        name: 'Mumbai Branch',
        level: 2,
        levelName: 'Branch Manager',
        users: 6,
        target: 2500000,
        achieved: 1900000,
        parentId: '2',
        children: [],
        periods: {
            'FY 2024-25': { target: 2500000, achieved: 1900000 },
            'Q1 Performance': { target: 625000, achieved: 550000 },
            'Q2 Performance': { target: 625000, achieved: 470000 },
            'Monthly': { target: 200000, achieved: 155000 }
        }
    },
    {
        id: '5',
        name: 'South Region',
        level: 1,
        levelName: 'Regional Manager',
        users: 10,
        target: 5000000,
        achieved: 3450000,
        parentId: '1',
        children: [],
        periods: {
            'FY 2024-25': { target: 5000000, achieved: 3450000 },
            'Q1 Performance': { target: 1250000, achieved: 1100000 },
            'Q2 Performance': { target: 1250000, achieved: 850000 },
            'Monthly': { target: 450000, achieved: 390000 }
        }
    }
];

export const MOCK_BRANCHES = [
    {
        id: '1',
        name: 'Colombo Central',
        code: 'BR-001',
        location: 'Colombo 01',
        manager: 'Saman Perera',
        hierarchy: 'GM → AGM → Provincial Manager',
        status: 'active',
        users: 25,
        target: 15000000,
        achieved: 12500000,
        lastUpdated: '2024-03-20'
    },
    {
        id: '2',
        name: 'Kandy North',
        code: 'BR-002',
        location: 'Kandy Town',
        manager: 'Nimal Silva',
        hierarchy: 'GM → AGM → Provincial Manager → Regional Manager',
        status: 'active',
        users: 18,
        target: 8000000,
        achieved: 7200000,
        lastUpdated: '2024-03-18'
    },
    {
        id: '3',
        name: 'Galle Fort',
        code: 'BR-003',
        location: 'Galle',
        manager: 'Sunil Jayasuriya',
        hierarchy: 'GM → AGM → Provincial Manager → Regional Manager → Zonal Manager',
        status: 'active',
        users: 12,
        target: 5000000,
        achieved: 3800000,
        lastUpdated: '2024-03-15'
    }
];

export const MOCK_PAST_BRANCHES = [
    {
        id: '1',
        name: 'Colombo Central',
        code: 'BR-001',
        location: 'Colombo 01',
        manager: 'Saman Perera',
        hierarchy: 'GM → AGM → Provincial Manager',
        status: 'active',
        users: 22,
        target: 12000000,
        achieved: 11500000,
        lastUpdated: '2023-12-31'
    },
    {
        id: '2',
        name: 'Kandy North',
        code: 'BR-002',
        location: 'Kandy Town',
        manager: 'Nimal Silva',
        hierarchy: 'GM → AGM → Provincial Manager → Regional Manager',
        status: 'active',
        users: 15,
        target: 7000000,
        achieved: 6800000,
        lastUpdated: '2023-12-31'
    },
    {
        id: '3',
        name: 'Galle Fort',
        code: 'BR-003',
        location: 'Galle',
        manager: 'Sunil Jayasuriya',
        hierarchy: 'GM → AGM → Provincial Manager → Regional Manager → Zonal Manager',
        status: 'active',
        users: 10,
        target: 4000000,
        achieved: 3200000,
        lastUpdated: '2023-12-31'
    }
];

export const MOCK_QUOTATIONS = [
    {
        id: 'QUO-001',
        proposalNo: 'KBT18-0012480',
        fullName: 'M C D RAJAKARUNANAYAKE',
        nic: '668170862V',
        loanAmount: 500000,
        term: '5 Years',
        totalMonthly: 13334,
        date: '2026-01-29',
        status: 'Approved'
    },
    {
        id: 'QUO-002',
        proposalNo: 'KBT18-0012481',
        fullName: 'SAMAN KUMARA',
        nic: '758170862V',
        loanAmount: 750000,
        term: '3 Years',
        totalMonthly: 21000,
        date: '2026-02-05',
        status: 'Pending'
    },
    {
        id: 'QUO-003',
        proposalNo: 'KBT18-0012482',
        fullName: 'NIMAL SILVA',
        nic: '888170862V',
        loanAmount: 1000000,
        term: '5 Years',
        totalMonthly: 26668,
        date: '2026-02-10',
        status: 'Approved'
    }
];
