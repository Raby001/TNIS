import type {
    AssetPointType,
    AssetPointDraftState,
} from '@/types/asset-point'

import type { NapFormData } from '@/types/nap'
import type { TowerFormData } from '@/types/tower'
import type { SpliceClosureFormData } from '@/types/splice-closure'
import type { ManholeFormData } from '@/types/manhole'
import type { HandholeFormData } from '@/types/handhole'
import type { PoleFormData } from '@/types/pole'

import TowerForm from '@/components/map/asset-point/forms/TowerForm.vue'
import SpliceClosureForm from '@/components/map/asset-point/forms/SpliceClosureForm.vue'
import ManholeForm from '@/components/map/asset-point/forms/ManholeForm.vue'
import HandholeForm from '@/components/map/asset-point/forms/HandholeForm.vue'
import NapForm from '@/components/map/asset-point/forms/NapForm.vue'
import PoleForm from '@/components/map/asset-point/forms/PoleForm.vue'
import type { OnuFormData } from '@/types/onu'
import OnuForm from '@/components/map/asset-point/forms/OnuForm.vue'
import type { OccFormData } from '@/types/occ'
import OccForm from '@/components/map/asset-point/forms/OccForm.vue'
import LcpForm from '@/components/map/asset-point/forms/LcpForm.vue'
import type { LcpFormData } from '@/types/lcp'

export const siteRequiredTypes: AssetPointType[] = [
    'tower',
    'manhole',
    'handhole',
    'onu',
    'pole',
    'occ',
    'lcp'
]

export const assetPointFormComponents = {
    tower: TowerForm,
    closure: SpliceClosureForm,
    manhole: ManholeForm,
    handhole: HandholeForm,
    nap: NapForm,
    pole: PoleForm,
    onu: OnuForm,
    occ: OccForm,
    lcp: LcpForm
} satisfies Partial<
    Record<AssetPointType, unknown>
>

export const assetPointTypeLabels: Record<
    AssetPointType,
    string
> = {
    tower: 'Tower',
    closure: 'Closure',
    manhole: 'Manhole',
    handhole: 'Handhole',
    nap: 'NAP',
    onu: 'ONU',
    pole: 'Pole',
    occ: 'OCC',
    lcp: 'LCP',
}

export const isSpliceClosureForm = (
    data: unknown,
): data is SpliceClosureFormData => {
    if (!data || typeof data !== 'object') {
        return false
    }

    return (
        'closureType' in data &&
        'capacity' in data
    )
}

export const isNapForm = (
    data: unknown,
): data is NapFormData => {
    if (!data || typeof data !== 'object') {
        return false
    }

    return 'capacity' in data
}

export const isTowerForm = (
    data: unknown,
): data is TowerFormData => {
    if (!data || typeof data !== 'object') {
        return false
    }

    return (
        'heightM' in data &&
        'foundation' in data &&
        'maximumLoad' in data &&
        'occupiedSpace' in data &&
        'availableSpace' in data &&
        'owner' in data &&
        'power' in data &&
        'generator' in data &&
        'battery' in data &&
        'gps' in data &&
        'leaseExpiry' in data
    )
}

export const isHandholeForm = (
    data: unknown,
): data is HandholeFormData => {
    if (!data || typeof data !== 'object') {
        return false
    }

    return (
        'size' in data &&
        'material' in data &&
        'coverType' in data
    )
}

export const isManholeForm = (
    data: unknown,
): data is ManholeFormData => {
    if (!data || typeof data !== 'object') {
        return false
    }

    return (
        'depthM' in data &&
        'material' in data &&
        'coverType' in data
    )
}

export const isPoleForm = (
    data: unknown,
): data is PoleFormData => {
    if (!data || typeof data !== 'object') {
        return false
    }

    return (
        'heightM' in data &&
        'material' in data &&
        'owner' in data &&
        'foundation' in data
    )
}

export const isOnuForm = (
    data: unknown,
): data is OnuFormData => {
    if (!data || typeof data !== 'object') {
        return false
    }

    return (
        'macAddressONU' in data &&
        'macAddressRouter' in data &&
        'ponType' in data &&
        'downloadSpeedMbps' in data &&
        'uploadSpeedMbps' in data &&
        'dataAllowanceGb' in data &&
        'customerMode' in data &&
        'customerId' in data &&
        'customer' in data
    )
}

export const isOccForm = (
    data: unknown,
): data is OccFormData => {
    if (!data || typeof data !== 'object') {
        return false
    }

    return (
        'portCount' in data
    )
}

export const isLcpForm = (
    data: unknown,
): data is LcpFormData => {
    if (!data || typeof data !== 'object') {
        return false
    }

    return 'splitterCapacity' in data
}

export const createDefaultAssetForm = (
    type: AssetPointType,
): AssetPointDraftState['assetData'] => {
    switch (type) {
        case 'tower':
            return {
                heightM: null,
                foundation: '',
                maximumLoad: null,
                occupiedSpace: null,
                availableSpace: null,
                owner: '',
                power: '',
                generator: false,
                battery: false,
                gps: false,
                leaseExpiry: null,
            } satisfies TowerFormData

        case 'closure':
            return {
                closureType: 'N/A',
                capacity: null,
            } satisfies SpliceClosureFormData

        case 'manhole':
            return {
                depthM: null,
                material: '',
                coverType: '',
            } satisfies ManholeFormData

        case 'handhole':
            return {
                size: '',
                material: '',
                coverType: '',
            } satisfies HandholeFormData

        case 'nap':
            return {
                capacity: null,
            } satisfies NapFormData

        case 'pole':
            return {
                heightM: null,
                material: '',
                owner: '',
                foundation: '',
            } satisfies PoleFormData

        case 'onu':
            return {
                macAddressONU: '',
                macAddressRouter: '',
                ponType: '',
                downloadSpeedMbps: null,
                uploadSpeedMbps: null,
                dataAllowanceGb: null,

                customerMode: 'existing',
                customerId: null,

                customer: {
                    name: '',
                    phone: '',
                    email: '',
                    address: '',
                    description: '',
                },
            } satisfies OnuFormData

        case 'occ':
            return {
                portCount: null,
            } satisfies OccFormData

        case 'lcp':
            return {
                splitterCapacity: 0,
            } satisfies LcpFormData

        default:
            return null
    }
}

export const createEmptyAssetPointDraft = (
    type: AssetPointType,
    longitude: number,
    latitude: number,
): AssetPointDraftState => ({
    type,

    asset: {
        assetTypeId: null,
        statusId: null,
        conditionId: null,
        siteId: null,
        assetTag: '',
        serialNumber: null,
        code: '',
        name: '',
        description: '',
        purchaseDate: null,
        installationDate: null,
        warrantyStart: null,
        warrantyEnd: null,
    },

    latitude,
    longitude,

    assetData: createDefaultAssetForm(type),
})