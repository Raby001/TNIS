import type {
    Asset,
    CreateAssetRequest,
} from './asset'

export interface Handhole extends Asset {
    size: string
    material: string
    coverType: string
}

export interface HandholeFormData {
    size: string | null
    material: string | null
    coverType: string | null
}

export interface CreateHandholeRequest
    extends CreateAssetRequest {
    size: string | null
    material: string | null
    coverType: string | null
}

export type UpdateHandholeRequest = Partial<
    Omit<CreateHandholeRequest, 'assetTypeId' | 'siteId'>
>