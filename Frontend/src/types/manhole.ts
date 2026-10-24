import type {
    Asset,
    CreateAssetRequest,
} from './asset'

export interface Manhole extends Asset {
    depthM: number
    material: string
    coverType: string
}

export interface ManholeFormData {
    depthM: number | null
    material: string | null
    coverType: string | null
}

export interface CreateManholeRequest
    extends CreateAssetRequest {
    depthM: number | null
    material: string | null
    coverType: string | null
}

export type UpdateManholeRequest = Partial<
    Omit<CreateManholeRequest, 'assetTypeId' | 'siteId'>
>