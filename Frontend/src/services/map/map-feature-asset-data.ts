import type { MapFeature } from '@/types/map-feature'
import type {
    Asset,
} from '@/types/asset'
import type {
    AssetPoint,
    AssetPointType,
} from '@/types/asset-point'
import type { ManholeFormData } from '@/types/manhole'
import type { HandholeFormData } from '@/types/handhole'
import type { OnuAssetData } from '@/types/onu'
import type { OccFormData } from '@/types/occ'
import type { LcpFormData } from '@/types/lcp'

export const getString = (
    value: unknown,
): string => {
    return value == null
        ? ''
        : String(value)
}

export const getNumber = (
    value: unknown,
): number => {
    return value == null
        ? 0
        : Number(value)
}

export const getNullableString = (
    value: unknown,
): string | null => {
    return value == null
        ? null
        : String(value)
}

export const getNullableNumber = (
    value: unknown,
): number | null => {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return null
    }

    const number = Number(value)

    return Number.isNaN(number)
        ? null
        : number
}

export const getGeneralAssetData = (
    properties: MapFeature['properties'],
): Asset => {
    const statusId =
        getString(
            properties.statusId,
        )

    const assetTypeId =
        getString(
            properties.assetTypeId,
        )

    const statusName =
        getNullableString(
            properties.status,
        )

    return {
        id: getString(
            properties.assetId ??
            properties.id,
        ),

        code:
            getString(
                properties.code,
            ),

        name:
            getString(
                properties.name,
            ),

        description:
            getNullableString(
                properties.description,
            ) ?? undefined,

        assetTag:
            getString(
                properties.assetTag,
            ),

        serialNumber:
            getNullableString(
                properties.serialNumber,
            ) ?? undefined,

        statusId,

        statusName:
            statusName ?? undefined,

        assetTypeId,

        siteId:
            getNullableString(
                properties.siteId,
            ) ?? undefined,

        purchaseDate:
            getNullableString(
                properties.purchaseDate,
            ) ?? undefined,

        installationDate:
            getNullableString(
                properties.installationDate,
            ) ?? undefined,

        warrantyStart:
            getNullableString(
                properties.warrantyStart,
            ) ?? undefined,

        warrantyEnd:
            getNullableString(
                properties.warrantyEnd,
            ) ?? undefined,

        geometry: undefined,
    }
}

export const getAssetData = (
    type: AssetPointType,
    properties: MapFeature['properties'],
): AssetPoint['assetData'] => {
    switch (type) {
        case 'nap':
            return {
                capacity:
                    getNullableNumber(
                        properties.capacity,
                    ),
            }

        case 'closure':
            return {
                closureType:
                    getString(
                        properties.closureType,
                    ),

                capacity:
                    getNullableNumber(
                        properties.capacity,
                    ),
            }

        case 'handhole':
            return {
                size:
                    getString(
                        properties.size,
                    ),

                material:
                    getString(
                        properties.material,
                    ),

                coverType:
                    getString(
                        properties.coverType,
                    ),
            } satisfies HandholeFormData

        case 'manhole':
            return {
                depthM:
                    getNullableNumber(
                        properties.depthM,
                    ),

                material:
                    getString(
                        properties.material,
                    ),

                coverType:
                    getString(
                        properties.coverType,
                    ),
            } satisfies ManholeFormData

        case 'tower':
            return {
                heightM:
                    getNullableNumber(
                        properties.heightM,
                    ),

                foundation:
                    getString(
                        properties.foundation,
                    ),

                maximumLoad:
                    getNullableNumber(
                        properties.maximumLoad,
                    ),

                occupiedSpace:
                    getNullableNumber(
                        properties.occupiedSpace,
                    ),

                availableSpace:
                    getNullableNumber(
                        properties.availableSpace,
                    ),

                owner:
                    getString(
                        properties.owner,
                    ),

                power:
                    getString(
                        properties.power,
                    ),

                generator:
                    properties.generator === true,

                battery:
                    properties.battery === true,

                gps:
                    properties.gps === true,

                leaseExpiry:
                    getNullableString(
                        properties.leaseExpiry,
                    ),
            }

        case 'pole':
            return {
                heightM:
                    getNullableNumber(
                        properties.heightM,
                    ),

                material:
                    getString(
                        properties.material,
                    ),

                owner:
                    getString(
                        properties.owner,
                    ),

                foundation:
                    getString(
                        properties.foundation,
                    ),
            }

        case 'onu':
            return {
                macAddressONU:
                    getNullableString(
                        properties.macAddressONU,
                    ),

                macAddressRouter:
                    getNullableString(
                        properties.macAddressRouter,
                    ),

                ponType:
                    getNullableString(
                        properties.ponType,
                    ),

                downloadSpeedMbps:
                    getNullableNumber(
                        properties.downloadSpeedMbps,
                    ),

                uploadSpeedMbps:
                    getNullableNumber(
                        properties.uploadSpeedMbps,
                    ),

                dataAllowanceGb:
                    getNullableNumber(
                        properties.dataAllowanceGb,
                    ),

                customerId:
                    getNullableString(
                        properties.customerId,
                    ),

                customerCode:
                    getNullableString(
                        properties.customerCode,
                    ),

                customerName:
                    getNullableString(
                        properties.customerName,
                    ),

                customerPhone:
                    getNullableString(
                        properties.customerPhone,
                    ),
            } satisfies OnuAssetData

        case 'occ':
            return {
                portCount:
                    getNullableNumber(
                        properties.portCount,
                    ),
            } satisfies OccFormData

        case 'lcp':
            return {
                splitterCapacity:
                    getNumber(
                        properties.splitterCapacity,
                    ),
            } satisfies LcpFormData

        default:
            return null
    }
}