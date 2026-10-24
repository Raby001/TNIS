import {
    Marker,
    type Map,
} from 'maplibre-gl'

import type { Site } from '@/types/site'

import {
    createSiteMarkerElement,
} from './site-marker'

export class SiteLayer {
    private markers: Marker[] = []

    render(
        map: Map,
        sites: Site[],
        onClick: (site: Site) => void,
    ) {
        this.clear()

        sites.forEach((site) => {
            const element =
                createSiteMarkerElement()

            element.addEventListener(
                'click',
                (event) => {
                    event.preventDefault()
                    event.stopPropagation()

                    onClick(site)
                },
            )

            const marker =
                new Marker({
                    element,
                    anchor: 'center',
                })
                    .setLngLat([
                        site.longitude,
                        site.latitude,
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
