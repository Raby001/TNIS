import type { Map } from 'maplibre-gl'
import type { AssetPointType } from './asset-point'

export interface MapState {
    instance: Map | null
    loaded: boolean
}

export type DeleteTarget = {
    type: 'site' | 'asset-point' | 'cable' | 'field-observation'
    id: string
    name: string
    assetPointType?: AssetPointType
}
