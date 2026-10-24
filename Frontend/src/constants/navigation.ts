import type { MenuItem } from '@/types/navigation'

import {
    LayoutDashboard,
    Map,
    FolderOpen,
    HardDrive,
    Users,
    Notebook,
    Settings,
    Package,
    MapPin,
} from 'lucide-vue-next'

export const navigation: MenuItem[] = [
    {
        name: 'Dashboard',
        to: '/app',
        exact: true,
        icon: LayoutDashboard,
        description: 'Overview of network activity and key metrics',
    },
    {
        name: 'Map',
        to: '/app/map',
        exact: true,
        icon: Map,
        description: 'Manage POPs, devices, and route planning',
        showSearch: true,
    },
    {
        name: 'Data Management',
        to: '/app/data-management',
        exact: true,
        icon: HardDrive,
        children: [
          {
            name: 'Asset Management',
            to: '/app/data-management/assets',
            icon: Package,
            description: 'Manage assets, cables, and reference data',
          },
          {
            name: 'Site Management',
            to: '/app/data-management/sites',
            icon: MapPin,
            description: 'Manage exchanges, towers, cabinets, and chambers',
          },
        ],
    },
    {
        name: 'Users & Roles',
        to: '/app/users-roles',
        exact: true,
        icon: Users,
        description: 'Manage accounts, roles, and permissions',
    },
    {
        name: 'System Logs',
        to: '/app/system-logs',
        exact: true,
        icon: Notebook,
        description: 'Review activity and audit history',
    },
    {
        name: 'Report Generation',
        to: '/app/report-generation',
        exact: true,
        icon: FolderOpen,
        description: 'Generate and export reports',
    },
    {
        name: 'System Settings',
        to: '/app/system-settings',
        exact: true,
        icon: Settings,
        description: 'Configure categories, defaults, and system options',
    },
    {
        name: 'My Account',
        to: '/app/profile',
        exact: true,
        description: 'Manage your profile and password',
        showInSidebar: false,
    },
    {
        name: 'Settings',
        to: '/app/settings',
        exact: true,
        description: 'Manage personal preference for how the app work for you',
        showInSidebar: false,
    },
]