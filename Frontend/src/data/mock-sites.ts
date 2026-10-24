import type { Site } from "@/types/site";

export const MOCK_SITES: Site[] = [
    {
        id: 'uuid-site-001',
        code: 'SITE-001',

        name: 'Phnom Penh Core',

        cityId: 'city-phnom-penh',
        cityName: 'Phnom Penh',

        address: 'Phnom Penh',
        elevation: 12.5,

        description: 'Main core exchange in Phnom Penh.',

        latitude: 11.5564,
        longitude: 104.9282,

        createdAt: '2026-08-14T00:00:00Z',
        updatedAt: '2026-08-14T00:00:00Z',
    },
    {
        id: 'uuid-site-002',
        code: 'SITE-002',

        name: 'Kampong Cham Node',

        cityId: 'city-kampong-cham',
        cityName: 'Kampong Cham',

        address: 'Kampong Cham',
        elevation: 12.5,

        description: 'Main core exchange in Kampong Cham.',

        latitude: 11.993440,
        longitude: 105.464561,

        createdAt: '2026-08-14T00:00:00Z',
        updatedAt: '2026-08-14T00:00:00Z',
    },
]
