import {
    Marker,
    type Map,
} from 'maplibre-gl'

import type { FieldObservation } from '@/types/field-observation'

export class FieldObservationLayer {
    private markers: Marker[] = []

    render(
        map: Map,
        observations: FieldObservation[],
        onClick: (
            observation: FieldObservation,
        ) => void,
    ) {
        this.clear()

        observations.forEach(
            (observation) => {
                const marker =
                    new Marker({
                        color: '#cf0000',
                        scale: 0.6,
                    })
                        .setLngLat([
                            observation.longitude,
                            observation.latitude,
                        ])
                        .addTo(map)

                marker.getElement().style.cursor = 'pointer'

                marker
                    .getElement()
                    .addEventListener(
                        'click',
                        (event) => {
                            event.preventDefault()
                            event.stopPropagation()

                            onClick(
                                observation,
                            )
                        },
                    )

                this.markers.push(marker)
            },
        )
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