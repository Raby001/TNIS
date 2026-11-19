import type { AssetFormData } from '@/types/asset'
import type {
    AssetPointFormModel,
    AssetPointType,
    CreateAssetPointRequest,
} from '@/types/asset-point'

import type { CreateSpliceClosureRequest } from '@/types/splice-closure'
import type { CreateNapRequest } from '@/types/nap'
import type { CreateTowerRequest } from '@/types/tower'
import type { CreatePoleRequest } from '@/types/pole'
import type { CreateManholeRequest } from '@/types/manhole'
import type { CreateHandholeRequest } from '@/types/handhole'
import type { CreateOnuRequest } from '@/types/onu'
import type { CreateOccRequest } from '@/types/occ'
import type { CreateLcpRequest } from '@/types/lcp'

import {
    isSpliceClosureForm,
    isNapForm,
    isTowerForm,
    isPoleForm,
    isManholeForm,
    isHandholeForm,
    isOnuForm,
    isOccForm,
    isLcpForm
} from '@/config/asset-point-form.config'

const mapGeneralAssetDetails = (
    asset: AssetFormData,
): Record<string, unknown> => ({
    name: asset.name.trim(),
    assetTypeId: asset.assetTypeId!,
    lifecycleStatusId: asset.statusId!,
    conditionId: asset.conditionId!,
    siteId: asset.siteId!,
    assetTag: asset.assetTag.trim(),
    serialNumber: asset.serialNumber,
    description: asset.description?.trim(),
    purchaseDate: asset.purchaseDate,
    installationDate: asset.installationDate,
    warrantyStart: asset.warrantyStart,
    warrantyEnd: asset.warrantyEnd,
})

type SpliceClosureDetails = Pick<
    CreateSpliceClosureRequest,
    'closureType' | 'capacity'
>

type NapDetails = Pick<
    CreateNapRequest,
    'capacity'
>

type TowerDetails = Pick<
    CreateTowerRequest,
    | 'heightM'
    | 'foundation'
    | 'maximumLoad'
    | 'occupiedSpace'
    | 'availableSpace'
    | 'owner'
    | 'power'
    | 'generator'
    | 'battery'
    | 'gps'
    | 'leaseExpiry'
>

type PoleDetails = Pick<
    CreatePoleRequest,
    'heightM' | 'material' | 'owner' | 'foundation'
>

type ManholeDetails = Pick<
    CreateManholeRequest,
    'depthM' | 'material' | 'coverType'
>

type HandholeDetails = Pick<
    CreateHandholeRequest,
    'size' | 'material' | 'coverType'
>

type OnuDetails = Pick<
    CreateOnuRequest,
    | 'macAddressONU'
    | 'macAddressRouter'
    | 'ponType'
    | 'downloadSpeedMbps'
    | 'uploadSpeedMbps'
    | 'dataAllowanceGb'
    | 'customerId'
    | 'customer'
>

type OccDetails = Pick<
    CreateOccRequest,
    'portCount'
>

type LcpDetails = Pick<
    CreateLcpRequest,
    'splitterCapacity'
>

export function mapAssetPointSpecificDetails(
    type: 'closure',
    form: AssetPointFormModel | null,
): SpliceClosureDetails

export function mapAssetPointSpecificDetails(
    type: 'nap',
    form: AssetPointFormModel | null,
): NapDetails

export function mapAssetPointSpecificDetails(
    type: 'tower',
    form: AssetPointFormModel | null,
): TowerDetails

export function mapAssetPointSpecificDetails(
    type: 'pole',
    form: AssetPointFormModel | null,
): PoleDetails

export function mapAssetPointSpecificDetails(
    type: 'manhole',
    form: AssetPointFormModel | null,
): ManholeDetails

export function mapAssetPointSpecificDetails(
    type: 'handhole',
    form: AssetPointFormModel | null,
): HandholeDetails

export function mapAssetPointSpecificDetails(
    type: 'onu',
    form: AssetPointFormModel | null,
): OnuDetails

export function mapAssetPointSpecificDetails(
    type: 'occ',
    form: AssetPointFormModel | null,
): OccDetails

export function mapAssetPointSpecificDetails(
    type: 'lcp',
    form: AssetPointFormModel | null,
): LcpDetails

export function mapAssetPointSpecificDetails(
    type: AssetPointType,
    form: AssetPointFormModel | null,
):
    | SpliceClosureDetails
    | NapDetails
    | TowerDetails
    | PoleDetails
    | ManholeDetails
    | HandholeDetails
    | OnuDetails
    | OccDetails
    | LcpDetails

export function mapAssetPointSpecificDetails(
    type: AssetPointType,
    form: AssetPointFormModel | null,
):
    | SpliceClosureDetails
    | NapDetails
    | TowerDetails
    | PoleDetails
    | ManholeDetails
    | HandholeDetails
    | OnuDetails
    | OccDetails
    | LcpDetails {
    if (!form) {
        throw new Error('Asset-specific form data is required.')
    }

    switch (type) {
        case 'closure': {
            if (!isSpliceClosureForm(form)) {
                throw new Error('Invalid splice closure form data.')
            }

            return {
                closureType: form.closureType,
                capacity: form.capacity,
            }
        }

        case 'nap': {
            if (!isNapForm(form)) {
                throw new Error('Invalid NAP form data.')
            }

            if (form.capacity === null) {
                throw new Error('NAP capacity is required.')
            }

            return {
                capacity: form.capacity,
            }
        }

        case 'tower': {
            if (!isTowerForm(form)) {
                throw new Error('Invalid tower form data.')
            }

            return {
                heightM: form.heightM,
                foundation: form.foundation,
                maximumLoad: form.maximumLoad,
                occupiedSpace: form.occupiedSpace,
                availableSpace: form.availableSpace,
                owner: form.owner,
                power: form.power,
                generator: form.generator,
                battery: form.battery,
                gps: form.gps,
                leaseExpiry: form.leaseExpiry,
            }
        }

        case 'pole': {
            if (!isPoleForm(form)) {
                throw new Error('Invalid pole form data.')
            }

            return {
                heightM: form.heightM,
                material: form.material,
                owner: form.owner,
                foundation: form.foundation,
            }
        }

        case 'manhole': {
            if (!isManholeForm(form)) {
                throw new Error('Invalid manhole form data.')
            }

            return {
                depthM: form.depthM,
                material: form.material,
                coverType: form.coverType,
            }
        }

        case 'handhole': {
            if (!isHandholeForm(form)) {
                throw new Error('Invalid handhole form data.')
            }

            return {
                size: form.size,
                material: form.material,
                coverType: form.coverType,
            }
        }

        case 'onu': {
            if (!isOnuForm(form)) {
                throw new Error('Invalid ONU form data.')
            }

            return {
                macAddressONU:
                    form.macAddressONU?.trim() || undefined,

                macAddressRouter:
                    form.macAddressRouter?.trim() || undefined,

                ponType:
                    form.ponType?.trim() || undefined,

                downloadSpeedMbps:
                    form.downloadSpeedMbps ?? undefined,

                uploadSpeedMbps:
                    form.uploadSpeedMbps ?? undefined,

                dataAllowanceGb:
                    form.dataAllowanceGb ?? undefined,

                customerId:
                    form.customerMode === 'existing'
                        ? form.customerId || undefined
                        : undefined,

                customer:
                    form.customerMode === 'new'
                        ? {
                            name: form.customer.name.trim(),
                            phone: form.customer.phone.trim(),
                            email: form.customer.email.trim(),
                            address: form.customer.address.trim(),
                            description: form.customer.description.trim(),
                        }
                        : undefined,
            }
        }

        case 'occ': {
            if (!isOccForm(form)) {
                throw new Error('Invalid OCC form data.')
            }

            return {
                portCount: form.portCount,
            }
        }

        case 'lcp': {
            if (!isLcpForm(form)) {
                throw new Error('Invalid LCP form data.')
            }

            if (form.splitterCapacity === null) {
                throw new Error('LCP splitter capacity is required.')
            }

            return {
                splitterCapacity: form.splitterCapacity,
            }
        }
    }
}

export const buildAssetPointDetails = (
    data: CreateAssetPointRequest,
): Record<string, unknown> => {
    const generalDetails = mapGeneralAssetDetails(data.asset)

    const specificDetails = mapAssetPointSpecificDetails(
        data.type,
        data.specific,
    )

    return {
        ...generalDetails,
        ...specificDetails,
    }
}