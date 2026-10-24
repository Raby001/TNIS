import type {
    InstallationSegmentFeature,
} from '@/types/map-feature'

export interface CablePoint {
    latitude: number
    longitude: number
}

export type CableCoreCount =
    | '1C'
    | '2C'
    | '4C'
    | '8C'
    | '12C'
    | '24C'
    | '48C'
    | '96C'

export type CableLineType =
    | 'Aerial'
    | 'Direct-Buried'
    | 'Conduit'

export type CableTargetType =
    | 'ASSET'
    | 'SITE'

export interface CableTarget extends CablePoint {
    id: string
    type: CableTargetType
    name: string
}

export interface Cable {
    id: string
    name: string

    assetTypeId: string
    statusId: string
    siteId: string
    cableTypeId: string
    coreCountId: string
    installationMethodId: string

    segmentTypeId?: string | null
    assetTag?: string | null
    serialNumber?: string | null
    purchaseDate?: string | null
    installationDate?: string | null

    color?: string
    lineStyle?: string

    description: string

    startTarget: CableTarget | null
    middleTargets: CableTarget[]
    subPoints: CablePoint[]
    endTarget: CableTarget | null

    installationSegments: InstallationSegmentFeature[]

    route: [number, number][]
}

export interface CableDraft {
    name: string

    assetTypeId: string
    statusId: string
    siteId: string
    cableTypeId: string
    coreCountId: string
    installationMethodId: string

    segmentTypeId: string
    assetTag: string | null
    serialNumber: string | null
    purchaseDate: string | null
    installationDate: string | null

    description: string

    startTarget: CableTarget | null
    middleTargets: CableTarget[]
    subPoints: CablePoint[]
    endTarget: CableTarget | null

    installationSegments: InstallationSegment[]

    route: [number, number][]
}

export interface CableMapStyle {
    color: string
    dashed: boolean
}

export interface CableReference {
    id: string
    name: string
}

/* =========================
 * Cable detail
 * ========================= */

export interface CableDetail {
    id: string
    code: string
    name: string
    description: string | null

    assetTag: string | null
    serialNumber: string | null

    purchaseDate: string | null
    installationDate: string | null
    warrantyStart: string | null
    warrantyEnd: string | null

    geometry: {
        type: 'LineString'
        coordinates: [number, number][]
    }

    assetType: {
        id: string
        name: string
        qualifier: string
    }

    status: {
        id: string
        name: string
    }

    site: {
        id: string
        code: string
        name: string
    }

    cableType: {
        id: string
        name: string
    }

    coreCount: {
        id: string
        name: string
    }

    installationMethod: {
        id: string
        name: string
    }

    segmentType: {
        id: string
        name: string
    } | null

    createdAt: string
    updatedAt: string
}

/* =========================
 * Cable connections
 * ========================= */

export interface CableConnectionSite {
    id: string | null
    code: string | null
    name: string | null

    geometry: {
        type: 'Point'
        coordinates: [number, number]
    }
}

export interface CableConnectionAsset {
    id: string | null
    code: string | null
    name: string | null

    geometry: {
        type: 'Point'
        coordinates: [number, number]
    }
}

export interface CableConnectionTarget {
    site?: CableConnectionSite
    asset?: CableConnectionAsset
}

export interface CableConnectionEndpoint {
    sequence: number

    connectionRole:
    | 'START'
    | 'MIDDLE'
    | 'END'

    targetType:
    | 'ASSET'
    | 'SITE'
    | null

    target: CableConnectionTarget

    distanceFromPreviousM: number
    cumulativeDistanceM: number
}

export interface CableSplicePoint {
    [key: string]: unknown
}

export interface CableDetailResponse {
    fiberCable: CableDetail

    start: CableConnectionEndpoint

    middle: CableConnectionEndpoint[]

    end: CableConnectionEndpoint

    splicePoints: CableSplicePoint[]
}

/* =========================
 * Separate connection CRUD
 * ========================= */

export interface FiberCableConnection {
    id: string
    fiberCableId: string
    assetId: string

    asset?: {
        id: string
        code: string
        name: string
        assetTag?: string | null
        assetType?: {
            id: string
            name: string
            qualifier?: string
        }
    }

    connectionType: string
    endpointPosition: number

    createdAt?: string
    updatedAt?: string
}

export interface CreateFiberCableConnectionRequest {
    fiberCableId: string
    assetId: string
    connectionType: string
    endpointPosition: number
}

/* =========================
 * Create fiber cable
 * ========================= */

export interface FiberCableGeometry {
    type: 'LineString'
    coordinates: [number, number][]
}

export interface CableTargetRequest {
    targetType: 'ASSET' | 'SITE'
    assetId?: string
    siteId?: string
}

export interface InstallationSegmentTarget {
    id: string
    type: CableTargetType
}

export interface InstallationSegment {
    fromTarget: InstallationSegmentTarget
    toTarget: InstallationSegmentTarget
    installationMethodId: string | null
}

export interface InstallationSegmentRequest {
    fromTarget: CableTargetRequest
    toTarget: CableTargetRequest
    installationMethodId: string
}

export interface CreateFiberCableRequest {
    name: string
    assetTypeId: string
    statusId: string
    siteId: string
    cableTypeId: string
    coreCountId: string
    installationMethodId: string

    segmentTypeId?: string | null
    description?: string | null

    geometry: FiberCableGeometry

    startTarget: CableTargetRequest
    middleTargets: CableTargetRequest[]
    endTarget: CableTargetRequest

    installationSegments?: InstallationSegmentRequest[]

    assetTag?: string | null
    serialNumber?: string | null
    purchaseDate?: string | null
    installationDate?: string | null
    warrantyStart?: string | null
    warrantyEnd?: string | null
}

export interface FiberCable {
    id: string
    name: string

    assetTypeId: string
    statusId: string
    siteId: string

    cableTypeId: string
    coreCountId: string
    installationMethodId: string

    segmentTypeId?: string | null

    description?: string | null

    geometry: FiberCableGeometry

    startTarget: CableTargetRequest
    middleTargets: CableTargetRequest[]
    endTarget: CableTargetRequest

    installationSegments?: InstallationSegmentRequest[]

    assetTag?: string | null
    serialNumber?: string | null

    purchaseDate?: string | null
    installationDate?: string | null
}

export interface RouteSegmentRequest {
    fromTarget: CableTargetRequest
    toTarget: CableTargetRequest
    targets: CableTargetRequest[]
    geometry: FiberCableGeometry
}

export interface UpdateFiberCableRequest {
    name?: string
    description?: string | null

    assetTag?: string | null
    serialNumber?: string | null

    purchaseDate?: string | null
    installationDate?: string | null
    warrantyStart?: string | null
    warrantyEnd?: string | null

    statusId?: string
    cableTypeId?: string
    installationMethodId?: string
    coreCountId?: string
    segmentTypeId?: string | null

    startTarget?: CableTargetRequest
    middleTargets?: CableTargetRequest[]
    endTarget?: CableTargetRequest

    geometry?: FiberCableGeometry

    routeSegment?: RouteSegmentRequest

    installationSegments?: InstallationSegmentRequest[]
}
