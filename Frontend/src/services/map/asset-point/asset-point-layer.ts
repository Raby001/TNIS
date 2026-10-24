import { Marker, type Map } from 'maplibre-gl'
import type { AssetPoint } from '@/types/asset-point'

import {
    createAssetPointMarkerElement,
} from './asset-point-marker'

export class AssetPointLayer {
    private markers: Marker[] = []

    render(
        map: Map,
        assetPoints: AssetPoint[],
        onClick: (assetPoint: AssetPoint) => void,
    ) {
        this.clear()

        assetPoints.forEach((assetPoint) => {
            const element =
                createAssetPointMarkerElement(
                    assetPoint.type,
                )

            element.addEventListener(
                'click',
                (event) => {
                    event.preventDefault()
                    event.stopPropagation()

                    onClick(assetPoint)
                },
            )

            const marker =
                new Marker({
                    element,
                    anchor: 'center',
                })
                    .setLngLat([
                        assetPoint.longitude,
                        assetPoint.latitude,
                    ])
                    .addTo(map)

            this.markers.push(marker)
        })
    }

    clear() {
        this.markers.forEach(
            (marker) => {
                marker.remove()
            },
        )

        this.markers = []
    }
}