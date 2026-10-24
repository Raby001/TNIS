import api from './api'
import type {
    MapFeatureCollection,
    MapFeatureFilters,
} from '@/types/map-feature'

export const mapApi = {
    getFeatures(
        filters?: MapFeatureFilters,
        search?: string,
    ) {
        const params: Record<string, string> = {}

        if (filters?.types?.length) {
            params.types = filters.types
                .map((type) => type.toLowerCase())
                .join(',')
        }

        if (filters?.provinceId) {
            params.provinceId = filters.provinceId
        }

        if (filters?.cityId) {
            params.cityId = filters.cityId
        }

        if (filters?.statusId) {
            params.statusId = filters.statusId
        }

        if (filters?.siteId) {
            params.siteId = filters.siteId
        }

        if (filters?.coreCountId) {
            params.coreCountId = filters.coreCountId
        }

        if (filters?.segmentTypeId) {
            params.segmentTypeId = filters.segmentTypeId
        }

        if (filters?.cableTypeId) {
            params.cableTypeId = filters.cableTypeId
        }

        if (filters?.installationMethodId) {
            params.installationMethodId =
                filters.installationMethodId
        }

        if (filters?.customerId) {
            params.customerId = filters.customerId
        }

        if (filters?.limit !== undefined) {
            params.limit = String(filters.limit)
        }

        if (search?.trim()) {
            params.search = search.trim()
        }

        return api.get<MapFeatureCollection>(
            '/map/features',
            {
                params,
            },
        )
    },
}