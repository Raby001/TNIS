import type {
    Feature,
    FeatureCollection,
    Point,
    LineString,
} from 'geojson'

export interface InstallationSegmentFeature {
    id: string

    from: {
        connectionId: string
        sequence: number
        connectionRole: 'START' | 'MIDDLE' | 'END'
        targetType: 'ASSET' | 'SITE' | null
        assetId: string | null
        siteId: string | null
    }

    to: {
        connectionId: string
        sequence: number
        connectionRole: 'START' | 'MIDDLE' | 'END'
        targetType: 'ASSET' | 'SITE' | null
        assetId: string | null
        siteId: string | null
    }

    installationMethod: {
        id: string
        name: string
        lineStyle: string
    }

    geometry: {
        type: 'LineString'
        coordinates: [number, number][]
    }
}

export interface MapFeatureProperties {
    id?: string
    assetId?: string

    type: string
    name: string
    code?: string

    statusId?: string
    cableTypeId?: string
    coreCountId?: string
    installationMethodId?: string
    segmentTypeId?: string

    installationSegments?: InstallationSegmentFeature[]

    suggestedHexColor?: string
    lineStyle?: string

    length?: number | null
    installedLengthM?: number | null
    installationDate?: string | null

    siteId?: string
    cityId?: string
    provinceId?: string

    [key: string]: unknown
}

export type MapFeature = Feature<
    Point | LineString,
    MapFeatureProperties
>

export type MapFeatureCollection =
    FeatureCollection<
        Point | LineString,
        MapFeatureProperties
    >

export interface MapFeatureFilters {
    types?: string[]

    provinceId?: string
    cityId?: string
    siteId?: string
    statusId?: string

    coreCountId?: string
    segmentTypeId?: string
    cableTypeId?: string
    installationMethodId?: string

    customerId?: string

    limit?: number
}