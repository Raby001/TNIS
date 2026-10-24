import api from './api'
import type { LocationSite } from '@/types/site'

export interface LocationCity {
    id: string
    name: string
}

export const locationsApi = {
    getCitiesByProvince: (provinceId: string) =>
        api.get<LocationCity[]>(
            `/locations/provinces/${provinceId}/cities`,
        ),

    getSitesByCity: (cityId: string) =>
        api.get<LocationSite[]>(
            `/locations/cities/${cityId}/sites`,
        ),

    getSitesByProvince: (provinceId: string) =>
        api.get<LocationSite[]>(
            `/locations/provinces/${provinceId}/sites`,
        ),
}