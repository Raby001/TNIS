import type { Device } from '@/types/device'

export const MOCK_DEVICES: Device[] = [
    {
        id: 'DEV-001',
        name: 'Core Router A',
        category: 'ROUTER',
        status: 'active',
        siteId: 'SITE-001',
        latitude: 11.5569,
        longitude: 104.9289,
    },
    {
        id: 'DEV-002',
        name: 'Aggregation Switch',
        category: 'SWITCH',
        status: 'planned',
        siteId: 'SITE-004',
        latitude: 10.6282,
        longitude: 103.5229,
    },
    {
        id: 'DEV-003',
        name: 'Microwave Unit',
        category: 'TRANSMISSION',
        status: 'pending',
        siteId: 'SITE-005',
        latitude: 11.9942,
        longitude: 105.4651,
    },
]
