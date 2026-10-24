import type { NapFormData } from './nap'
import type { TowerFormData } from './tower'
import type { SpliceClosureFormData } from './splice-closure'
import type { ManholeFormData } from './manhole'
import type { Asset, AssetFormData } from './asset'
import type { HandholeFormData } from './handhole'
import type { PoleFormData } from './pole'
import type { OnuAssetData, OnuFormData } from './onu'
import type { OccFormData } from './occ'
import type { LcpFormData } from './lcp'

export type AssetPointType =
    | 'tower'
    | 'closure'
    | 'manhole'
    | 'handhole'
    | 'nap'
    | 'onu'
    | 'pole'
    | 'occ'
    | 'lcp'

/**
 * Connects each asset point type
 * with its corresponding form data.
 */
export type AssetPointFormModelMap = {
    tower: TowerFormData
    closure: SpliceClosureFormData
    manhole: ManholeFormData
    handhole: HandholeFormData
    nap: NapFormData
    onu: OnuFormData
    pole: PoleFormData
    occ: OccFormData
    lcp: LcpFormData
}

export type AssetPointFormModel =
    AssetPointFormModelMap[AssetPointType]

export type AssetPointSavedData =
    | NapFormData
    | TowerFormData
    | SpliceClosureFormData
    | ManholeFormData
    | HandholeFormData
    | PoleFormData
    | OnuAssetData
    | OccFormData
    | LcpFormData
    | null

export type AssetPointFormData =
    | AssetPointFormModel
    | null

export interface AssetPointDraftState {
    type: AssetPointType
    asset: AssetFormData
    latitude: number
    longitude: number
    assetData: AssetPointFormData
}

export interface AssetPoint
    extends Omit<AssetPointDraftState, 'asset' | 'assetData'> {
    id: string
    asset: Asset
    assetData: AssetPointSavedData
}

export interface CreateAssetPointRequest {
    type: AssetPointType
    asset: AssetFormData
    location: {
        latitude: number
        longitude: number
    }
    specific: AssetPointFormModel | null
}