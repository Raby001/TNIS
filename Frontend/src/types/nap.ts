import type { CreateAssetRequest } from './asset'

export interface NapFormData {
    capacity: number | null
}

export interface CreateNapRequest
    extends CreateAssetRequest {
    capacity: number
}

export type UpdateNapRequest = Partial<
    Omit<CreateNapRequest, 'assetTypeId' | 'siteId'>
>