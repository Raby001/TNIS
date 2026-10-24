import type { Asset, CreateAssetRequest } from './asset'

export interface SpliceClosureFormData {
    closureType: string | null
    capacity: number | null
}

export interface CreateSpliceClosureRequest
    extends CreateAssetRequest {
    closureType: string | null
    capacity: number | null
    /** Optional: a closure may stand alone, but normally sits in a Manhole/Handhole. */
    containerAssetId?: string | null
}

export type UpdateSpliceClosureRequest = Partial<
  Omit<CreateSpliceClosureRequest, 'assetTypeId' | 'siteId' | 'code' | 'containerAssetId'>
>

/**
 * Shape returned by `GET /splice-closures/{id}`.
 *
 * Unlike towers (which return a flat record), this wraps the full asset
 * under `asset` and exposes the closure specifics alongside it.
 */
export interface SpliceClosureDetailResponse {
    assetId: string
    asset: Asset
    containerAssetId: string | null
    containerAsset: Asset | null
    ports: unknown[]
    closureType: string | null
    capacity: number | null
    description: string | null
}