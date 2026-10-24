import type { CreateAssetRequest } from './asset'

export interface OccFormData {
    portCount: number | null
}

export interface CreateOccRequest extends CreateAssetRequest {
    portCount: number | null
}

export type UpdateOccRequest = Partial<
    Omit<CreateOccRequest, 'assetTypeId' | 'siteId'>
>