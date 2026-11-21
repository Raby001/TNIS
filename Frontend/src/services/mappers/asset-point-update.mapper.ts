import type { AssetFormData } from '@/types/asset'

import type {
    AssetPointFormModelMap,
    AssetPointType,
} from '@/types/asset-point'

import type { UpdateSpliceClosureRequest } from '@/types/splice-closure'
import type { UpdateNapRequest } from '@/types/nap'
import type { UpdateTowerRequest } from '@/types/tower'
import type { UpdatePoleRequest } from '@/types/pole'
import type { UpdateManholeRequest } from '@/types/manhole'
import type { UpdateHandholeRequest } from '@/types/handhole'
import type { UpdateOnuRequest } from '@/types/onu'
import type { UpdateOccRequest } from '@/types/occ'
import type { UpdateLcpRequest } from '@/types/lcp'

type AssetPointUpdateRequestMap = {
    closure: UpdateSpliceClosureRequest
    nap: UpdateNapRequest
    tower: UpdateTowerRequest
    pole: UpdatePoleRequest
    manhole: UpdateManholeRequest
    handhole: UpdateHandholeRequest
    onu: UpdateOnuRequest
    occ: UpdateOccRequest
    lcp: UpdateLcpRequest
}

interface AssetPointLocation {
    latitude: number
    longitude: number
}

const mapGeneralUpdateData = (
    asset: AssetFormData,
    location: AssetPointLocation,
) => ({
    name: asset.name.trim(),

    lifecycleStatusId: asset.statusId!,

    assetTag: asset.assetTag.trim(),

    serialNumber: asset.serialNumber,

    description: asset.description?.trim(),

    purchaseDate: asset.purchaseDate,

    installationDate: asset.installationDate,

    warrantyStart: asset.warrantyStart,

    warrantyEnd: asset.warrantyEnd,

    geometry: {
        type: 'Point' as const,
        coordinates: [
            location.longitude,
            location.latitude,
        ],
    },
})

const mapOnuUpdateData = (
    specific: AssetPointFormModelMap['onu'],
): UpdateOnuRequest => ({
    macAddressONU:
        specific.macAddressONU || undefined,

    macAddressRouter:
        specific.macAddressRouter || undefined,

    ponType:
        specific.ponType || undefined,

    downloadSpeedMbps:
        specific.downloadSpeedMbps ?? undefined,

    uploadSpeedMbps:
        specific.uploadSpeedMbps ?? undefined,

    dataAllowanceGb:
        specific.dataAllowanceGb ?? undefined,

    customerId:
        specific.customerId ?? null,
})

export function mapAssetPointUpdatePayload<
    T extends AssetPointType,
>(
    type: T,
    asset: AssetFormData,
    specific: AssetPointFormModelMap[T],
    location: AssetPointLocation,
): AssetPointUpdateRequestMap[T] {
    const general = mapGeneralUpdateData(
        asset,
        location,
    )

    if (type === 'onu') {
        return {
            ...general,
            ...mapOnuUpdateData(
                specific as AssetPointFormModelMap['onu'],
            ),
        } as AssetPointUpdateRequestMap[T]
    }

    return {
        ...general,
        ...specific,
    } as AssetPointUpdateRequestMap[T]
}