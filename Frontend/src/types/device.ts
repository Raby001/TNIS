export interface Device {
    id: string
    name: string
    category: string
    status: 'active' | 'planned' | 'pending' | 'repair' | 'decommissioned'
    siteId?: string
    latitude: number
    longitude: number
}
