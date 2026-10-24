import type { Map } from 'maplibre-gl'

import type { MapFilters } from '@/stores/map.store'
import type { MapFeature } from '@/types/map-feature'
import type { Site } from '@/types/site'
import type { Cable } from '@/types/cable'
import type { AssetPoint } from '@/types/asset-point'
import type { FieldObservation } from './field-observation'

export interface IMapService {
    initialize(
        container: HTMLElement,
    ): Map

    destroy(): void

    getMap(): Map | null

    syncMapFeatures(
        features: MapFeature[],
        filters: MapFilters,
    ): {
        sites: Site[]
        assetPoints: AssetPoint[]
        cables: Cable[]
    }

    focusLocation(
        longitude: number,
        latitude: number,
        zoom?: number,
    ): void

    focusFeature(
        feature: MapFeature,
        zoom?: number,
    ): void

    showSearchFeaturePopup(
        feature: MapFeature,
    ): void

    setSiteClickHandler(
        onSiteClick: (
            site: Site
        ) => void,
    ): void

    setEndpointClickHandlers(
        onAssetPointClick: (
            assetPoint: AssetPoint,
        ) => void,
    ): void

    showCablePopup(
        cable: Cable,
        longitude: number,
        latitude: number,
    ): void

    setCablePopupCloseHandler(
        callback: () => void,
    ): void

    setCoordinateMarkerClickHandler(
        callback: (
            longitude: number,
            latitude: number,
        ) => void,
    ): void

    setFieldObservationConvertHandler(
        handler: (observation: FieldObservation) => void,
    ): void

    setFieldObservationCancelHandler(
        handler: (observation: FieldObservation) => void,
    ): void
}