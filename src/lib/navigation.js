import {
    LayoutDashboard,
    Users,
    Target,
    Settings,
    FileText,
    BarChart3,
    Briefcase,
    Share2,
    Wallet,
    UserCircle,
    Monitor,
    Image as ImageIcon,
    Tag,
    Star,
    HelpCircle,
    Layout,
    Shield,
    ShieldCheck,
    Lock,
    Layers,
    Clock,
    Globe,
    Upload
} from 'lucide-react';

import { PERMISSIONS } from '../constants/permissions';

export const ROLES = {
    ADMIN: 'admin',
    MANAGEMENT: 'management',
    COORDINATOR: 'coordinator',
    BDM: 'bdm',
    Investor: 'customer',
    HIERARCHY: 'hierarchy',
    GM: 'gm',
};

export const ROLE_NAVIGATION = {
    [ROLES.ADMIN]: [
        {
            group: 'OVERVIEW',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: PERMISSIONS.DASHBOARD_VIEW },
            ]
        },
        {
            group: 'ORGANIZATION',
            items: [
                { name: 'Quotation', icon: FileText, path: '/quotation', permission: PERMISSIONS.QUOTATION_INDEX },
                { name: 'Investor', icon: UserCircle, path: '/customers', permission: PERMISSIONS.Investor_INDEX },
                { name: 'Investment', icon: Wallet, path: '/my-business', permission: PERMISSIONS.INVESTMENT_INDEX },
                { name: 'Branches', icon: Briefcase, path: '/branches', permission: PERMISSIONS.BRANCH_INDEX },
                {
                    name: 'Hierarchy',
                    icon: Share2,
                    path: '/hierarchy'
                },
            ]
        },
        {
            group: 'FINANCE & CONFIG',
            items: [
                { name: 'Target Config', icon: Target, path: '/targets-config', permission: PERMISSIONS.TARGET_INDEX },
                // { name: 'Audit Logs', icon: FileText, path: '/audit-logs' },
            ]
        },
        {
            group: 'REPORTS',
            items: [
                {
                    name: 'Reports',
                    icon: BarChart3,
                    path: '/reports/investor',
                    subItems: [
                        { name: 'Investor Maturity', path: '/reports/investor', permission: PERMISSIONS.COUNTRY_INDEX },
                        { name: 'Maturity Payout', path: '/reports/investment-maturity', permission: PERMISSIONS.REGION_INDEX },
                        { name: 'Hierarchy', path: '/reports/hierarchy', permission: PERMISSIONS.PROVINCE_INDEX },
                        { name: 'Agent Performance', path: '/reports/users', permission: PERMISSIONS.ZONE_INDEX },
                    ]
                },
            ]
        },
        {
            group: 'SYSTEM',
            items: [
                { name: 'Users', icon: Users, path: '/users', permission: PERMISSIONS.USER_INDEX },
                { name: 'Roles', icon: Shield, path: '/roles', permission: PERMISSIONS.ROLE_INDEX },
                { name: 'Permissions', icon: Lock, path: '/permissions', permission: PERMISSIONS.PERMISSION_INDEX },
                { name: 'Level Management', icon: Layers, path: '/level', permission: PERMISSIONS.LEVEL_INDEX },
                { name: 'Investment Period', icon: Clock, path: '/investment-period', permission: PERMISSIONS.INVESTMENT_PRODUCT_INDEX },
                {
                    name: 'Territory Setup',
                    icon: Globe,
                    path: '/territory/country',
                    permission: [PERMISSIONS.COUNTRY_INDEX, PERMISSIONS.PROVINCE_INDEX, PERMISSIONS.REGION_INDEX, PERMISSIONS.ZONE_INDEX],
                    subItems: [
                        { name: 'Country', path: '/territory/country', permission: PERMISSIONS.COUNTRY_INDEX },
                        { name: 'Province', path: '/territory/province', permission: PERMISSIONS.PROVINCE_INDEX },
                        { name: 'Zone', path: '/territory/zone', permission: PERMISSIONS.ZONE_INDEX },
                        { name: 'Region', path: '/territory/region', permission: PERMISSIONS.REGION_INDEX },
                    ]
                },
                // { name: 'System Settings', icon: Settings, path: '/settings' },
                { name: 'Bulk Upload', icon: Upload, path: '/bulk-upload' },
            ]
        }
    ],
    [ROLES.MANAGEMENT]: [
        {
            group: 'OVERVIEW',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: PERMISSIONS.DASHBOARD_VIEW },
            ]
        },
        {
            group: 'OPERATIONS',
            items: [
                { name: 'Investment', icon: Briefcase, path: '/my-business', permission: PERMISSIONS.INVESTMENT_INDEX },
                { name: 'Quotation', icon: FileText, path: '/quotation', permission: PERMISSIONS.QUOTATION_INDEX },
                { name: 'Investor', icon: UserCircle, path: '/customers', permission: PERMISSIONS.Investor_INDEX },
                { name: 'Team Performance', icon: Users, path: '/team-performance' },
            ]
        },
        {
            group: 'REPORTS',
            items: [
                {
                    name: 'Reports',
                    icon: BarChart3,
                    path: '/reports/investor',
                    subItems: [
                        { name: 'Investor Maturity', path: '/reports/investor', permission: PERMISSIONS.INVESTOR_REPORT_INDEX },
                        { name: 'Maturity Payout', path: '/reports/investment-maturity', permission: PERMISSIONS.INVESTMENT_MATURITY_REPORT_INDEX },
                        { name: 'Hierarchy', path: '/reports/hierarchy', permission: PERMISSIONS.PROVINCE_INDEX },
                        { name: 'Agent Performance', path: '/reports/users', permission: PERMISSIONS.AGENT_PERFORMANCE_REPORT_INDEX },
                    ]
                },
            ]
        },
    ],
    [ROLES.COORDINATOR]: [
        {
            group: 'OVERVIEW',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: PERMISSIONS.DASHBOARD_VIEW },
            ]
        },
        {
            group: 'MANAGEMENT',
            items: [
                { name: 'Investment', icon: Briefcase, path: '/my-business', permission: PERMISSIONS.INVESTMENT_INDEX },
                { name: 'Quotation', icon: FileText, path: '/quotation', permission: PERMISSIONS.QUOTATION_INDEX },
                { name: 'Investor', icon: UserCircle, path: '/customers', permission: PERMISSIONS.Investor_INDEX },
            ]
        }
    ],
    [ROLES.BDM]: [
        {
            group: 'OVERVIEW',
            items: [
                { name: 'My Target', icon: Target, path: '/my-target', permission: PERMISSIONS.MY_TARGETS },
                { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: PERMISSIONS.DASHBOARD_VIEW },
            ]
        },
        {
            group: 'SALES',
            items: [
                { name: 'Investment', icon: Briefcase, path: '/my-business', permission: PERMISSIONS.INVESTMENT_INDEX },
                { name: 'Quotation', icon: FileText, path: '/quotation', permission: PERMISSIONS.QUOTATION_INDEX },
                { name: 'Customer', icon: UserCircle, path: '/customers', permission: PERMISSIONS.Investor_INDEX },
                { name: 'Agencies', icon: Users, path: '/agencies' },
            ]
        }
    ],
    [ROLES.Investor]: [
        {
            group: 'FINANCIALS',
            items: [
                { name: 'Investment', icon: Briefcase, path: '/my-business', permission: PERMISSIONS.INVESTMENT_INDEX },
                { name: 'Statements', icon: FileText, path: '/statements' },
            ]
        },
        {
            group: 'REPORTS',
            items: [
                { name: 'Profit Summary', icon: Wallet, path: '/profit' },
            ]
        }
    ],
    [ROLES.HIERARCHY]: [
        {
            group: 'OVERVIEW',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: PERMISSIONS.DASHBOARD_VIEW },
            ]
        },
        {
            group: 'ORGANIZATION',
            items: [
                { name: 'Quotation', icon: FileText, path: '/quotation', permission: PERMISSIONS.QUOTATION_INDEX },
                { name: 'Investor', icon: UserCircle, path: '/customers', permission: PERMISSIONS.Investor_INDEX },
                { name: 'Investment', icon: Wallet, path: '/my-business', permission: PERMISSIONS.INVESTMENT_INDEX },
                { name: 'Branches', icon: Briefcase, path: '/branches', permission: PERMISSIONS.BRANCH_INDEX },
                {
                    name: 'Hierarchy',
                    icon: Share2,
                    path: '/hierarchy'
                },
            ]
        },
        {
            group: 'FINANCE & CONFIG',
            items: [
                { name: 'Target Config', icon: Target, path: '/targets-config', permission: PERMISSIONS.TARGET_INDEX },
                // { name: 'Audit Logs', icon: FileText, path: '/audit-logs' },
            ]
        },
        {
            group: 'REPORTS',
            items: [
                {
                    name: 'Reports',
                    icon: BarChart3,
                    path: '/reports/investor',
                    subItems: [
                        { name: 'Investor', path: '/reports/investor', permission: PERMISSIONS.COUNTRY_INDEX },
                        { name: 'Maturity Payout', path: '/reports/investment-maturity', permission: PERMISSIONS.REGION_INDEX },
                        { name: 'Hierarchy', path: '/reports/hierarchy', permission: PERMISSIONS.PROVINCE_INDEX },
                        { name: 'Users', path: '/reports/users', permission: PERMISSIONS.ZONE_INDEX },
                    ]
                },
            ]
        },
        {
            group: 'SYSTEM',
            items: [
                { name: 'Users', icon: Users, path: '/users', permission: PERMISSIONS.USER_INDEX },
                { name: 'Roles', icon: Shield, path: '/roles', permission: PERMISSIONS.ROLE_INDEX },
                { name: 'Permissions', icon: Lock, path: '/permissions', permission: PERMISSIONS.PERMISSION_INDEX },
                { name: 'Level Management', icon: Layers, path: '/level', permission: PERMISSIONS.LEVEL_INDEX },
                { name: 'Investment Period', icon: Clock, path: '/investment-period', permission: PERMISSIONS.INVESTMENT_PRODUCT_INDEX },
                {
                    name: 'Territory Setup',
                    icon: Globe,
                    path: '/territory/country',
                    permission: [PERMISSIONS.COUNTRY_INDEX, PERMISSIONS.PROVINCE_INDEX, PERMISSIONS.REGION_INDEX, PERMISSIONS.ZONE_INDEX],
                    subItems: [
                        { name: 'Country', path: '/territory/country', permission: PERMISSIONS.COUNTRY_INDEX },
                        { name: 'Province', path: '/territory/province', permission: PERMISSIONS.PROVINCE_INDEX },
                        { name: 'Zone', path: '/territory/zone', permission: PERMISSIONS.ZONE_INDEX },
                        { name: 'Region', path: '/territory/region', permission: PERMISSIONS.REGION_INDEX },
                    ]
                },
                // { name: 'System Settings', icon: Settings, path: '/settings' },
            ]
        }
    ],
    [ROLES.GM]: [
        {
            group: 'OVERVIEW',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: PERMISSIONS.DASHBOARD_VIEW },
            ]
        },
        {
            group: 'ORGANIZATION',
            items: [
                { name: 'Quotation', icon: FileText, path: '/quotation', permission: PERMISSIONS.QUOTATION_INDEX },
                { name: 'Investor', icon: UserCircle, path: '/customers', permission: PERMISSIONS.Investor_INDEX },
                { name: 'Investment', icon: Wallet, path: '/my-business', permission: PERMISSIONS.INVESTMENT_INDEX },
                { name: 'Branches', icon: Briefcase, path: '/branches', permission: PERMISSIONS.BRANCH_INDEX },
                {
                    name: 'Hierarchy',
                    icon: Share2,
                    path: '/hierarchy'
                },
            ]
        },
        {
            group: 'FINANCE & CONFIG',
            items: [
                { name: 'Target Config', icon: Target, path: '/targets-config', permission: PERMISSIONS.TARGET_INDEX },
                // { name: 'Audit Logs', icon: FileText, path: '/audit-logs' },
            ]
        },
        {
            group: 'REPORTS',
            items: [
                {
                    name: 'Reports',
                    icon: BarChart3,
                    path: '/reports/investor',
                    subItems: [
                        { name: 'Investor', path: '/reports/investor', permission: PERMISSIONS.COUNTRY_INDEX },
                        { name: 'Maturity Payout', path: '/reports/investment-maturity', permission: PERMISSIONS.REGION_INDEX },
                        { name: 'Hierarchy', path: '/reports/hierarchy', permission: PERMISSIONS.PROVINCE_INDEX },
                        { name: 'Users', path: '/reports/users', permission: PERMISSIONS.ZONE_INDEX },
                    ]
                },
            ]
        },
        {
            group: 'SYSTEM',
            items: [
                { name: 'Users', icon: Users, path: '/users', permission: PERMISSIONS.USER_INDEX },
                { name: 'Roles', icon: Shield, path: '/roles', permission: PERMISSIONS.ROLE_INDEX },
                { name: 'Permissions', icon: Lock, path: '/permissions', permission: PERMISSIONS.PERMISSION_INDEX },
                { name: 'Level Management', icon: Layers, path: '/level', permission: PERMISSIONS.LEVEL_INDEX },
                { name: 'Investment Period', icon: Clock, path: '/investment-period', permission: PERMISSIONS.INVESTMENT_PRODUCT_INDEX },
                {
                    name: 'Territory Setup',
                    icon: Globe,
                    path: '/territory/country',
                    permission: [PERMISSIONS.COUNTRY_INDEX, PERMISSIONS.PROVINCE_INDEX, PERMISSIONS.REGION_INDEX, PERMISSIONS.ZONE_INDEX],
                    subItems: [
                        { name: 'Country', path: '/territory/country', permission: PERMISSIONS.COUNTRY_INDEX },
                        { name: 'Province', path: '/territory/province', permission: PERMISSIONS.PROVINCE_INDEX },
                        { name: 'Zone', path: '/territory/zone', permission: PERMISSIONS.ZONE_INDEX },
                        { name: 'Region', path: '/territory/region', permission: PERMISSIONS.REGION_INDEX },
                    ]
                },
                // { name: 'System Settings', icon: Settings, path: '/settings' },
            ]
        }
    ],
};
