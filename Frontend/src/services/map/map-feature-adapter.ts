import type { MapFeature } from '@/types/map-feature'
import type { Site } from '@/types/site'
import type {
    AssetPoint,
    AssetPointType,
} from '@/types/asset-point'
import type {
    Cable,
} from '@/types/cable'

import type {
    InstallationSegmentFeature,
} from '@/types/map-feature'

import {
    getString,
    getNullableNumber,
    getGeneralAssetData,
    getAssetData,
} from './map-feature-asset-data'
import type { FieldObservation } from '@/types/field-observation'

const ASSET_POINT_TYPE_MAP: Record<
    string,
    AssetPointType
> = {
    NAP: 'nap',
    TOWER: 'tower',
    CLOSURE: 'closure',
    MANHOLE: 'manhole',
    HANDHOLE: 'handhole',
    POLE: 'pole',
    ONU: 'onu',
    OCC: 'occ',
    LCP: 'lcp'
}

const normalizeFeatureType = (
    value: unknown,
): string => {
    return getString(value)
        .trim()
        .toUpperCase()
        .replace(/[-\s]+/g, '_')
}

const resolveAssetPointType = (
    properties: MapFeature['properties'],
): AssetPointType | null => {
    const candidates = [
        properties.qualifier,
        properties.assetType,
        properties.type,
    ]

    for (const candidate of candidates) {
        const normalized =
            normalizeFeatureType(candidate)

        const type =
            ASSET_POINT_TYPE_MAP[normalized]

        if (type) {
            return type
        }
    }

    return null
}

const getPointCoordinates = (
    feature: MapFeature,
): [number, number] | null => {
    if (feature.geometry.type !== 'Point') {
        return null
    }

    const coordinates =
        feature.geometry.coordinates

    if (
        coordinates.length < 2 ||
        typeof coordinates[0] !== 'number' ||
        typeof coordinates[1] !== 'number'
    ) {
        return null
    }

    return [
        coordinates[0],
        coordinates[1],
    ]
}

const getLineCoordinates = (
    feature: MapFeature,
): [number, number][] | null => {
    if (
        getString(feature.geometry.type).toLowerCase() !==
        'linestring'
    ) {
        return null
    }

    const coordinates =
        feature.geometry.coordinates

    const route: [number, number][] = []

    for (const coordinate of coordinates) {
        const [longitude, latitude] =
            coordinate as unknown as [
                unknown,
                unknown,
            ]

        const parsedLongitude =
            Number(longitude)

        const parsedLatitude =
            Number(latitude)

        if (
            !Number.isFinite(parsedLongitude) ||
            !Number.isFinite(parsedLatitude)
        ) {
            return null
        }

        route.push([
            parsedLongitude,
            parsedLatitude,
        ])
    }

    return route.length >= 2
        ? route
        : null
}

const getInstallationSegments = (
    value: unknown,
): InstallationSegmentFeature[] => {
    if (!Array.isArray(value)) {
        return []
    }

    const segments: InstallationSegmentFeature[] = []

    for (const item of value) {
        if (
            typeof item !== 'object' ||
            item === null
        ) {
            continue
        }

        const segment =
            item as Record<string, unknown>

        const from =
            segment.from

        const to =
            segment.to

        const installationMethod =
            segment.installationMethod

        const geometry =
            segment.geometry

        if (
            typeof from !== 'object' ||
            from === null ||
            typeof to !== 'object' ||
            to === null ||
            typeof installationMethod !== 'object' ||
            installationMethod === null ||
            typeof geometry !== 'object' ||
            geometry === null
        ) {
            continue
        }

        const fromData =
            from as Record<string, unknown>

        const toData =
            to as Record<string, unknown>

        const methodData =
            installationMethod as Record<string, unknown>

        const geometryData =
            geometry as Record<string, unknown>

        const coordinates =
            geometryData.coordinates

        if (!Array.isArray(coordinates)) {
            continue
        }

        const parsedCoordinates: [number, number][] = []

        for (const coordinate of coordinates) {
            if (
                !Array.isArray(coordinate) ||
                coordinate.length < 2
            ) {
                continue
            }

            const longitude =
                Number(coordinate[0])

            const latitude =
                Number(coordinate[1])

            if (
                !Number.isFinite(longitude) ||
                !Number.isFinite(latitude)
            ) {
                continue
            }

            parsedCoordinates.push([
                longitude,
                latitude,
            ])
        }

        if (parsedCoordinates.length < 2) {
            continue
        }

        const targetType = (
            value: unknown,
        ): 'ASSET' | 'SITE' | null => {
            if (
                value === 'ASSET' ||
                value === 'SITE'
            ) {
                return value
            }

            return null
        }

        const fromTargetType =
            targetType(
                fromData.targetType,
            )

        const toTargetType =
            targetType(
                toData.targetType,
            )

        if (
            fromTargetType === null ||
            toTargetType === null
        ) {
            continue
        }

        const connectionRole = (
            value: unknown,
        ): 'START' | 'MIDDLE' | 'END' | null => {
            if (
                value === 'START' ||
                value === 'MIDDLE' ||
                value === 'END'
            ) {
                return value
            }

            return null
        }

        const fromRole =
            connectionRole(
                fromData.connectionRole,
            )

        const toRole =
            connectionRole(
                toData.connectionRole,
            )

        if (
            fromRole === null ||
            toRole === null
        ) {
            continue
        }

        segments.push({
            id: getString(
                segment.id,
            ),

            from: {
                connectionId:
                    getString(
                        fromData.connectionId,
                    ),

                sequence:
                    Number(
                        fromData.sequence,
                    ),

                connectionRole:
                    fromRole,

                targetType:
                    fromTargetType,

                assetId:
                    fromData.assetId != null
                        ? getString(
                            fromData.assetId,
                        )
                        : null,

                siteId:
                    fromData.siteId != null
                        ? getString(
                            fromData.siteId,
                        )
                        : null,
            },

            to: {
                connectionId:
                    getString(
                        toData.connectionId,
                    ),

                sequence:
                    Number(
                        toData.sequence,
                    ),

                connectionRole:
                    toRole,

                targetType:
                    toTargetType,

                assetId:
                    toData.assetId != null
                        ? getString(
                            toData.assetId,
                        )
                        : null,

                siteId:
                    toData.siteId != null
                        ? getString(
                            toData.siteId,
                        )
                        : null,
            },

            installationMethod: {
                id: getString(
                    methodData.id,
                ),

                name: getString(
                    methodData.name,
                ),

                lineStyle: getString(
                    methodData.lineStyle,
                ),
            },

            geometry: {
                type: 'LineString',

                coordinates:
                    parsedCoordinates,
            },
        })
    }

    return segments
}

export const mapFeatureAdapter = {

    getSites(
        features: MapFeature[],
    ): Site[] {
        return features
            .filter(
                feature =>
                    normalizeFeatureType(
                        feature.properties.type,
                    ) === 'SITE' &&
                    feature.geometry.type === 'Point',
            )
            .map((feature): Site | null => {
                const coordinates =
                    getPointCoordinates(feature)

                if (!coordinates) {
                    return null
                }

                return {
                    id: getString(
                        feature.properties.id,
                    ),

                    code:
                        feature.properties.code
                            ? getString(
                                feature.properties.code,
                            )
                            : undefined,

                    name: getString(
                        feature.properties.name,
                    ),

                    cityId: getString(
                        feature.properties.cityId,
                    ),

                    cityName:
                        feature.properties.city
                            ? getString(
                                feature.properties.city,
                            )
                            : undefined,

                    provinceName:
                        feature.properties.province
                            ? getString(
                                feature.properties.province,
                            )
                            : undefined,

                    address: getString(
                        feature.properties.address,
                    ),

                    elevation:
                        getNullableNumber(
                            feature.properties.elevation,
                        ),

                    description:
                        feature.properties.description
                            ? getString(
                                feature.properties.description,
                            )
                            : undefined,

                    latitude: coordinates[1],

                    longitude: coordinates[0],

                    createdAt:
                        feature.properties.createdAt
                            ? getString(
                                feature.properties.createdAt,
                            )
                            : undefined,

                    updatedAt:
                        feature.properties.updatedAt
                            ? getString(
                                feature.properties.updatedAt,
                            )
                            : undefined,
                }
            })
            .filter(
                (site): site is Site =>
                    site !== null,
            )
    },

    getAssetPoints(
        features: MapFeature[],
    ): AssetPoint[] {
        const assetPoints: AssetPoint[] = []

        for (const feature of features) {
            if (
                feature.geometry.type !== 'Point'
            ) {
                continue
            }

            const properties =
                feature.properties

            const assetPointType =
                resolveAssetPointType(
                    properties,
                )

            if (!assetPointType) {
                continue
            }

            const coordinates =
                getPointCoordinates(feature)

            if (!coordinates) {
                continue
            }

            const asset =
                getGeneralAssetData(
                    properties,
                )

            const assetData =
                getAssetData(
                    assetPointType,
                    properties,
                )

            const assetPoint: AssetPoint = {
                id: getString(
                    properties.assetId ??
                    properties.id,
                ),

                type: assetPointType,

                asset,

                latitude: coordinates[1],

                longitude: coordinates[0],

                assetData,
            }

            assetPoints.push(assetPoint)
        }

        return assetPoints
    },

    getCables(
        features: MapFeature[],
    ): Cable[] {
        const cables: Cable[] = []

        for (const feature of features) {
            if (
                normalizeFeatureType(
                    feature.properties.type,
                ) !== 'FIBER_CABLE'
            ) {
                continue
            }

            const route =
                getLineCoordinates(feature)

            if (!route) {
                continue
            }

            const properties =
                feature.properties

            const cable: Cable = {
                id: getString(
                    properties.assetId,
                ),

                name: getString(
                    properties.name,
                ),

                assetTypeId:
                    getString(
                        properties.assetTypeId,
                    ),

                statusId:
                    getString(
                        properties.statusId,
                    ),

                siteId:
                    getString(
                        properties.siteId,
                    ),

                cableTypeId:
                    getString(
                        properties.cableTypeId,
                    ),

                coreCountId:
                    getString(
                        properties.coreCountId,
                    ),

                installationMethodId:
                    getString(
                        properties.installationMethodId,
                    ),

                installationSegments:
                    getInstallationSegments(
                        properties.installationSegments,
                    ),

                segmentTypeId:
                    properties.segmentTypeId
                        ? getString(
                            properties.segmentTypeId,
                        )
                        : null,

                assetTag:
                    properties.assetTag
                        ? getString(
                            properties.assetTag,
                        )
                        : null,

                serialNumber:
                    properties.serialNumber
                        ? getString(
                            properties.serialNumber,
                        )
                        : null,

                installationDate:
                    properties.installationDate
                        ? getString(
                            properties.installationDate,
                        )
                        : null,

                color:
                    getString(
                        properties.suggestedHexColor,
                    ) || undefined,

                lineStyle:
                    getString(
                        properties.lineStyle,
                    ) || undefined,

                description:
                    properties.description
                        ? getString(
                            properties.description,
                        )
                        : '',

                startTarget: null,

                middleTargets: [],

                subPoints: [],

                endTarget: null,

                route,
            }

            cables.push(cable)
        }

        return cables
    },

    getFieldObservations(
        features: MapFeature[],
    ): FieldObservation[] {
        return features
            .filter(
                feature =>
                    normalizeFeatureType(
                        feature.properties.type,
                    ) === 'FIELD_OBSERVATION' &&
                    feature.geometry.type === 'Point',
            )
            .map(
                (
                    feature,
                ): FieldObservation | null => {
                    const coordinates =
                        getPointCoordinates(
                            feature,
                        )

                    if (!coordinates) {
                        return null
                    }

                    return {
                        id: getString(
                            feature.properties.id,
                        ),

                        name: getString(
                            feature.properties.name,
                        ),

                        description:
                            getString(
                                feature.properties.description,
                            ),

                        status: getString(
                            feature.properties.status,
                        ),

                        longitude:
                            coordinates[0],

                        latitude:
                            coordinates[1],

                        createdAt:
                            feature.properties.createdAt
                                ? getString(
                                    feature.properties.createdAt,
                                )
                                : undefined,

                        updatedAt:
                            feature.properties.updatedAt
                                ? getString(
                                    feature.properties.updatedAt,
                                )
                                : undefined,
                    }
                },
            )
            .filter(
                (
                    observation,
                ): observation is FieldObservation =>
                    observation !== null,
            )
    },
}