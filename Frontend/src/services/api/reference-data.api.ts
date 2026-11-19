import api from "./api"
import type {
    City,
    Province,
    AssetType,
    AssetStatus,
    AssetCondition,
    CableCoreCount,
    CableType,
    FiberCoreStatus,
    FiberSpliceStatus,
    InstallationMethod,
    NapDeviceStatus,
    NapPortStatus,
    FiberSegmentType
} from '@/types/reference-data'

export const referenceDataApi = {
    getCities() {
        return api.get<City[]>(
            '/reference-data/cities',
        )
    },

    getProvinces() {
        return api.get<Province[]>(
            '/reference-data/provinces',
        )
    },

    getAssetTypes() {
        return api.get<AssetType[]>(
            '/reference-data/asset-types',
        )
    },

    getStatuses() {
        return api.get<AssetStatus[]>(
            '/reference-data/asset-lifecycle-statuses',
        )
    },

    getAssetConditions() {
        return api.get<AssetCondition[]>(
            '/reference-data/asset-conditions',
        )
    },

    getCableCoreCounts() {
        return api.get<CableCoreCount[]>(
            '/reference-data/cable-core-counts',
        )
    },

    getCableTypes() {
        return api.get<CableType[]>(
            '/reference-data/cable-types',
        )
    },

    getFiberCoreStatuses() {
        return api.get<FiberCoreStatus[]>(
            '/reference-data/fiber-core-statuses',
        )
    },

    getFiberSpliceStatuses() {
        return api.get<FiberSpliceStatus[]>(
            '/reference-data/fiber-splice-statuses',
        )
    },

    getInstallationMethods() {
        return api.get<InstallationMethod[]>(
            '/reference-data/installation-methods',
        )
    },

    getNapDeviceStatuses() {
        return api.get<NapDeviceStatus[]>(
            '/reference-data/nap-device-statuses',
        )
    },

    getNapPortStatuses() {
        return api.get<NapPortStatus[]>(
            '/reference-data/nap-port-statuses',
        )
    },

    getFiberSegmentTypes() {
        return api.get<FiberSegmentType[]>(
            '/reference-data/fiber-segment-types',
        )
    },
}