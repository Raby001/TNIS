import type { CreateAssetRequest } from './asset'

export interface LcpFormData {
    splitterCapacity: number
}

export interface CreateLcpRequest
    extends CreateAssetRequest {

    splitterCapacity: number
}

export type UpdateLcpRequest = Partial<
  Omit<CreateLcpRequest, 'assetTypeId' | 'siteId' | 'code'>
>

/** Shape returned by `GET /lcps/{assetId}`. */
export interface LcpDetailResponse {
    assetId: string
    name: string
    code?: string
    assetTag?: string | null
    serialNumber?: string | null
    description?: string | null
    splitterCapacity: number | null
}