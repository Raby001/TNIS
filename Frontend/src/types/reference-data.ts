import type { ProvinceRef } from "./user"

export interface City {
    id: string
    name: string
    code?: string
    province?: {
        id: string
        name: string
    }
}

export interface Province {
    id: string
    name: string
    code: string
}

export type ProvinceOption = Pick<ProvinceRef, 'id' | 'name' | 'code'>

export interface AssetType {
    id: string
    name: string
    description?: string
    geometryType?: 'Point' | 'Polygon' | 'LineString'
    canConnectToFiber?: boolean
    qualifier?: string
}

export interface AssetStatus {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
    color?: 'green' | 'amber' | 'red' | 'blue' | 'slate' | 'purple' | 'teal'
}

export interface AssetCondition {
    id: string
    name: string
    description?: string
}

export interface CableCoreCount {
    id: string
    coreCount: number
    displayCode: string
    suggestedColorName: string
    suggestedHex: string
    confirmRequired: boolean
    createdAt: string
    updatedAt: string
}

export interface CableType {
    id: string
    code: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export interface FiberCoreStatus {
    id: string
    code: string
    name: string
    colorName: string
    colorHex: string
    description: string
    createdAt: string
    updatedAt: string
}

export interface FiberSpliceStatus {
    id: string
    code: string
    name: string
}

export interface InstallationMethod {
    id: string
    name: string
    lineStyle: string
    description: string
    createdAt: string
    updatedAt: string
}

export interface NapDeviceStatus {
    id: string
    code: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export interface NapPortStatus {
    id: string
    code: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export interface FiberSegmentType {
    id: string
    code: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}