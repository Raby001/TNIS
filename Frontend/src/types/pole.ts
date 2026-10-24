import type {
    Asset,
    CreateAssetRequest,
} from './asset'

export interface Pole extends Asset {
    heightM: number
    material: string
    owner: string
    foundation: string
}

export interface PoleFormData {
    heightM: number | null
    material: string | null
    owner: string | null
    foundation: string | null
}

export interface CreatePoleRequest
    extends CreateAssetRequest {
    heightM: number | null
    material: string | null
    owner: string | null
    foundation: string | null
}

export type UpdatePoleRequest = Partial<
    Omit<CreatePoleRequest, 'assetTypeId' | 'siteId'>
>