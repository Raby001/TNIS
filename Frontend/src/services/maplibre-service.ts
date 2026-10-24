import {
    Map,
    Popup,
    Marker,
} from 'maplibre-gl'

import type { MapFilters } from '@/stores/map.store'
import type { IMapService } from '@/types/map-service'
import type { Site } from '@/types/site'
import type {
    Cable,
    CableConnectionEndpoint,
    CableDetailResponse,
    CableTarget,
} from '@/types/cable'
import type { AssetPoint } from '@/types/asset-point'
import type { MapFeature } from '@/types/map-feature'
import type { FieldObservation } from '@/types/field-observation'

import { AssetPointLayer } from './map/asset-point/asset-point-layer'
import { createAssetPointPopupHtml } from './map/asset-point/asset-point-popup'
import { SiteLayer } from './map/site/site-layer'
import { createSitePopupHtml } from './map/site/site-popup'
import { mapFeatureAdapter } from './map/map-feature-adapter'
import { createCablePopupHtml } from './map/cable/cable-popup'
import { fiberCableApi } from '@/services/api/fiber-cable.api'
import { FieldObservationLayer } from './map/field-observation/field-observation-layer'
import { createFieldObservationPopupHtml } from './map/field-observation/field-observation-popup'

const mapConnectionToCableTarget = (
    endpoint: CableConnectionEndpoint,
): CableTarget | null => {
    const target = endpoint.target.asset ?? endpoint.target.site

    if (!target?.id) {
        return null
    }

    const [longitude, latitude] = target.geometry.coordinates

    if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude)
    ) {
        return null
    }

    return {
        id: target.id,
        type: endpoint.targetType ?? (
            endpoint.target.asset
                ? 'ASSET'
                : 'SITE'
        ),
        name: target.name ?? target.code ?? target.id,
        longitude,
        latitude,
    }
}

const createEditableMapCable = (
    cable: Cable,
    detail: CableDetailResponse,
): Cable => {
    const startTarget = mapConnectionToCableTarget(
        detail.start,
    )
    const middleTargets = detail.middle
        .map(mapConnectionToCableTarget)
        .filter(
            (target): target is CableTarget =>
                target !== null,
        )
    const endTarget = mapConnectionToCableTarget(
        detail.end,
    )
    const route = detail.fiberCable.geometry.coordinates.map(
        ([longitude, latitude]) => [
            longitude,
            latitude,
        ] as [number, number],
    )
    const routeTargets = [
        startTarget,
        ...middleTargets,
        endTarget,
    ].filter(
        (target): target is CableTarget =>
            target !== null,
    )

    return {
        ...cable,
        name: detail.fiberCable.name,
        assetTypeId: detail.fiberCable.assetType.id,
        statusId: detail.fiberCable.status.id,
        siteId: detail.fiberCable.site.id,
        cableTypeId: detail.fiberCable.cableType.id,
        coreCountId: detail.fiberCable.coreCount.id,
        installationMethodId:
            detail.fiberCable.installationMethod.id,
        segmentTypeId:
            detail.fiberCable.segmentType?.id ?? null,
        assetTag: detail.fiberCable.assetTag,
        serialNumber: detail.fiberCable.serialNumber,
        purchaseDate: detail.fiberCable.purchaseDate,
        installationDate:
            detail.fiberCable.installationDate,
        description: detail.fiberCable.description ?? '',
        startTarget,
        middleTargets,
        endTarget,
        route,
        subPoints: route
            .slice(1, -1)
            .filter(
                ([longitude, latitude]) =>
                    !routeTargets.some(
                        (target) =>
                            target.longitude === longitude &&
                            target.latitude === latitude,
                    ),
            )
            .map(([longitude, latitude]) => ({
                longitude,
                latitude,
            })),
    }
}

export class MapLibreService implements IMapService {
    private map: Map | null = null
    private activePopup: Popup | null = null
    private siteLayer = new SiteLayer()
    private assetPointLayer = new AssetPointLayer()
    private fieldObservationLayer = new FieldObservationLayer()
    private coordinateMarker: Marker | null = null
    private isCableDrawing = false
    private canManageMap = false

    private fieldObservationConvertHandler:
        ((observation: FieldObservation) => void) | null = null

    private fieldObservationCancelHandler:
        ((observation: FieldObservation) => void) | null = null

    private onSiteClick:
        | ((site: Site) => void) | null = null

    private onEditSite:
        ((site: Site) => void) | null = null

    private onRemoveSite:
        ((site: Site) => void) | null = null

    private onAssetPointClick:
        | ((AssetPoint: AssetPoint) => void) | null = null

    private onEditAssetPoint:
        ((assetPoint: AssetPoint) => void) | null = null

    private onRemoveAssetPoint:
        ((assetPoint: AssetPoint) => void) | null = null

    private onCablePopupClose:
        (() => void) | null = null

    private onEditCable:
        ((cable: Cable) => void) | null = null

    private onRemoveCable:
        ((cable: Cable) => void) | null = null

    private onCoordinateMarkerClick:
        | ((longitude: number, latitude: number) => void) | null = null

    initialize(container: HTMLElement): Map {
        this.map = new Map({
            container,
            center: [104.9282, 12.5657],
            zoom: 7,
            minZoom: 7,
            maxZoom: 18,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: 'raster',
                        tiles: [
                            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        ],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap contributors',
                    },

                    satellite: {
                        type: 'raster',
                        tiles: [
                            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                        ],
                        tileSize: 256,
                        attribution: 'Tiles &copy; Esri',
                    },
                },

                layers: [
                    {
                        id: 'satellite',
                        type: 'raster',
                        source: 'satellite',
                        layout: {
                            visibility: 'none',
                        },
                    },
                    {
                        id: 'osm',
                        type: 'raster',
                        source: 'osm',
                    },
                ],
            },
        })
        return this.map
    }

    setBaseMap(type: 'osm' | 'satellite') {
        if (!this.map) return

        this.map.setLayoutProperty(
            'osm',
            'visibility',
            type === 'osm' ? 'visible' : 'none',
        )

        this.map.setLayoutProperty(
            'satellite',
            'visibility',
            type === 'satellite' ? 'visible' : 'none',
        )
    }

    destroy() {
        this.activePopup?.remove()
        this.activePopup = null
        this.coordinateMarker?.remove()
        this.coordinateMarker = null
        this.onSiteClick = null
        this.onEditSite = null
        this.onRemoveSite = null
        this.onAssetPointClick = null
        this.onEditAssetPoint = null
        this.onRemoveAssetPoint = null
        this.onCablePopupClose = null
        this.onEditCable = null
        this.onRemoveCable = null
        this.onCoordinateMarkerClick = null
        this.fieldObservationConvertHandler = null
        this.fieldObservationCancelHandler = null
        this.siteLayer.clear()
        this.assetPointLayer.clear()
        this.fieldObservationLayer.clear()
        this.map?.remove()
        this.map = null
    }

    getMap() {
        return this.map
    }

    closePopup() {
        this.activePopup?.remove()
        this.activePopup = null
    }

    setSiteClickHandler(
        onSiteClick: (site: Site) => void,
    ) {
        this.onSiteClick = onSiteClick
    }

    setEndpointClickHandlers(
        onAssetPointClick: (
            assetPoint: AssetPoint,
        ) => void,
    ) {
        this.onAssetPointClick = onAssetPointClick
    }

    setSiteActionHandlers(
        onEdit: (site: Site) => void,
        onRemove: (site: Site) => void,
    ) {
        this.onEditSite = onEdit
        this.onRemoveSite = onRemove
    }

    setAssetPointActionHandlers(
        onEdit: (assetPoint: AssetPoint) => void,
        onRemove: (assetPoint: AssetPoint) => void,
    ) {
        this.onEditAssetPoint = onEdit
        this.onRemoveAssetPoint = onRemove
    }

    setCableActionHandlers(
        onEdit: (cable: Cable) => void,
        onRemove: (cable: Cable) => void,
    ) {
        this.onEditCable = onEdit
        this.onRemoveCable = onRemove
    }

    setCableDrawingState(isDrawing: boolean) {
        this.isCableDrawing = isDrawing

        if (isDrawing) {
            this.activePopup?.remove()
        }
    }

    setMapManagementPermission(canManage: boolean) {
        this.canManageMap = canManage
    }

    setCablePopupCloseHandler(
        callback: () => void,
    ) {
        this.onCablePopupClose = callback
    }

    setCoordinateMarkerClickHandler(
        callback: (
            longitude: number,
            latitude: number,
        ) => void,
    ) {
        this.onCoordinateMarkerClick = callback
    }

    setFieldObservationConvertHandler(
        handler: (observation: FieldObservation) => void,
    ) {
        this.fieldObservationConvertHandler = handler
    }

    setFieldObservationCancelHandler(
        handler: (observation: FieldObservation) => void,
    ) {
        this.fieldObservationCancelHandler = handler
    }

    syncMapFeatures(
        features: MapFeature[],
        filters: MapFilters,
    ) {
        if (!this.map) {
            return {
                sites: [],
                assetPoints: [],
                cables: [],
                fieldObservations: [],
            }
        }

        const sites =
            mapFeatureAdapter.getSites(features)

        const assetPoints =
            mapFeatureAdapter.getAssetPoints(features)

        const cables =
            mapFeatureAdapter.getCables(features)

        const fieldObservations =
            mapFeatureAdapter.getFieldObservations(features)

        this.renderMapData(
            sites,
            cables,
            assetPoints,
            fieldObservations,
            filters,
        )

        return {
            sites,
            assetPoints,
            cables,
            fieldObservations,
        }
    }

    showSearchFeaturePopup(
        feature: MapFeature,
    ) {
        if (!this.map) {
            return
        }

        const type =
            String(feature.properties.type)
                .toUpperCase()

        if (type === 'SITE') {
            const sites =
                mapFeatureAdapter.getSites([
                    feature,
                ])

            const site = sites[0]

            if (!site) {
                return
            }

            this.bindSitePopup(site)
            return
        }

        if (type === 'FIBER_CABLE') {
            const cables =
                mapFeatureAdapter.getCables([
                    feature,
                ])

            const cable = cables[0]

            if (!cable) {
                return
            }

            const geometry = feature.geometry

            if (
                geometry.type !== 'LineString' ||
                geometry.coordinates.length === 0
            ) {
                return
            }

            const middleIndex =
                Math.floor(
                    geometry.coordinates.length / 2,
                )

            const middlePoint =
                geometry.coordinates[middleIndex]

            if (!middlePoint) {
                return
            }

            const longitude =
                middlePoint[0]

            const latitude =
                middlePoint[1]

            if (
                longitude === undefined ||
                latitude === undefined
            ) {
                return
            }

            this.showCablePopup(
                cable,
                longitude,
                latitude,
            )

            return
        }

        if (type === 'FIELD_OBSERVATION') {
            const fieldObservations =
                mapFeatureAdapter.getFieldObservations([
                    feature,
                ])

            const fieldObservation =
                fieldObservations[0]

            if (!fieldObservation) {
                return
            }

            this.bindFieldObservationPopup(
                fieldObservation,
            )

            return
        }

        const assetPoints =
            mapFeatureAdapter.getAssetPoints([
                feature,
            ])

        const assetPoint =
            assetPoints[0]

        if (!assetPoint) {
            return
        }

        this.bindAssetPointPopup(
            assetPoint,
        )
    }

    async syncNetwork(
        sites: Site[],
        cables: Cable[],
        filters: MapFilters,
        assetPoints: AssetPoint[],
        fieldObservations: FieldObservation[],
    ) {
        this.renderMapData(
            sites,
            cables,
            assetPoints,
            fieldObservations,
            filters,
        )
    }

    private bindSitePopup(
        site: Site,
    ) {
        if (!this.map) return

        this.activePopup?.remove()

        const showActions =
            !this.isCableDrawing && this.canManageMap

        const popup = new Popup({
            offset: 18,
            closeButton: true,
            closeOnClick: true,
            maxWidth: '320px',
        })
            .setLngLat([
                site.longitude,
                site.latitude,
            ])
            .setHTML(
                createSitePopupHtml(
                    site,
                    {
                        showActions,
                    },
                ),
            )
            .addTo(this.map)

        this.activePopup = popup

        if (!showActions) {
            return
        }

        const popupElement =
            popup.getElement()

        if (!popupElement) return

        const editButton =
            popupElement.querySelector(
                '[data-action="edit-site"]',
            )

        if (editButton instanceof HTMLElement) {
            editButton.addEventListener(
                'click',
                (event) => {
                    event.preventDefault()
                    event.stopPropagation()

                    this.onEditSite?.(site)
                },
            )
        }

        const removeButton =
            popupElement.querySelector(
                '[data-action="remove-site"]',
            )

        if (removeButton instanceof HTMLElement) {
            removeButton.addEventListener(
                'click',
                (event) => {
                    event.preventDefault()
                    event.stopPropagation()

                    this.onRemoveSite?.(site)
                },
            )
        }
    }

    private bindAssetPointPopup(
        assetPoint: AssetPoint,
    ) {
        if (!this.map) return

        this.activePopup?.remove()

        const showActions =
            !this.isCableDrawing && this.canManageMap

        const popup = new Popup({
            offset: 16,
            closeButton: true,
            closeOnClick: true,
        })
            .setLngLat([
                assetPoint.longitude,
                assetPoint.latitude,
            ])
            .setHTML(
                createAssetPointPopupHtml(
                    assetPoint,
                    {
                        showActions,
                    },
                ),
            )
            .addTo(this.map)

        this.activePopup = popup

        if (!showActions) {
            return
        }

        const popupElement = popup.getElement()

        if (!popupElement) return

        const editButton = popupElement.querySelector(
            '[data-action="edit-asset-point"]',
        )

        if (editButton instanceof HTMLElement) {
            editButton.addEventListener('click', (event) => {
                event.preventDefault()
                event.stopPropagation()

                this.onEditAssetPoint?.(assetPoint)
            })
        }

        const removeButton = popupElement.querySelector(
            '[data-action="remove-asset-point"]',
        )

        if (removeButton instanceof HTMLElement) {
            removeButton.addEventListener('click', (event) => {
                event.preventDefault()
                event.stopPropagation()

                this.onRemoveAssetPoint?.(assetPoint)
            })
        }
    }

    private async bindCablePopup(
        cable: Cable,
        longitude: number,
        latitude: number,
    ) {
        if (!this.map) return

        this.activePopup?.remove()

        try {
            const detail =
                await fiberCableApi.getDetail(
                    cable.id,
                )

            console.log(
                '[Cable Popup] API detail:',
                detail,
            )

            const popup = new Popup({
                offset: 16,
                closeButton: true,
                closeOnClick: true,
                maxWidth: '360px',
            })
                .setLngLat([
                    longitude,
                    latitude,
                ])
                .setHTML(
                    createCablePopupHtml(
                        detail.fiberCable,
                        detail.start,
                        detail.end,
                        detail.splicePoints,
                        {
                            showActions:
                                !this.isCableDrawing &&
                                this.canManageMap,
                        },
                    ),
                )
                .addTo(this.map)

            popup.on('close', () => {
                this.onCablePopupClose?.()
            })

            this.activePopup = popup

            if (this.isCableDrawing) {
                return
            }

            const popupElement =
                popup.getElement()

            if (!popupElement) return

            // Edit
            const editButton =
                popupElement.querySelector(
                    '[data-action="edit-cable"]',
                )

            if (editButton instanceof HTMLElement) {
                editButton.addEventListener(
                    'click',
                    (event) => {
                        event.preventDefault()
                        event.stopPropagation()

                        console.log(
                            '[MapLibreService] Edit cable:',
                            cable,
                        )

                        this.onEditCable?.(
                            createEditableMapCable(
                                cable,
                                detail,
                            ),
                        )
                    },
                )
            }

            // Delete
            const removeButton =
                popupElement.querySelector(
                    '[data-action="remove-cable"]',
                )

            if (removeButton instanceof HTMLElement) {
                removeButton.addEventListener(
                    'click',
                    (event) => {
                        event.preventDefault()
                        event.stopPropagation()

                        console.log(
                            '[MapLibreService] Remove cable:',
                            cable,
                        )

                        this.onRemoveCable?.(cable)
                    },
                )
            }
        } catch (error) {
            console.error(
                'Failed to load cable detail:',
                error,
            )
        }
    }

    private bindFieldObservationPopup(
        observation: FieldObservation,
    ) {
        if (!this.map) return

        this.activePopup?.remove()

        const popup = new Popup({
            offset: 16,
            closeButton: true,
            closeOnClick: true,
            maxWidth: '320px',
        })
            .setLngLat([
                observation.longitude,
                observation.latitude,
            ])
            .setHTML(
                createFieldObservationPopupHtml(
                    observation,
                    {
                        showActions: this.canManageMap,
                    },
                ),
            )
            .addTo(this.map)

        this.activePopup = popup

        const popupElement = popup.getElement()

        if (!popupElement) return

        const convertButton = popupElement.querySelector(
            '[data-action="convert-field-observation"]',
        )

        if (!(convertButton instanceof HTMLElement)) return

        convertButton.addEventListener('click', (event) => {
            event.preventDefault()
            event.stopPropagation()

            console.log(
                '[MapLibreService] Convert field observation:',
                observation,
            )

            this.fieldObservationConvertHandler?.(
                observation,
            )

            popup.remove()
        })

        const cancelButton = popupElement.querySelector(
            '[data-action="cancel-field-observation"]',
        )

        if (cancelButton instanceof HTMLElement) {
            cancelButton.addEventListener('click', (event) => {
                event.preventDefault()
                event.stopPropagation()

                console.log(
                    '[MapLibreService] Cancel field observation:',
                    observation,
                )

                this.fieldObservationCancelHandler?.(
                    observation,
                )

                popup.remove()
            })
        }
    }

    showCablePopup(
        cable: Cable,
        longitude: number,
        latitude: number,
    ) {
        void this.bindCablePopup(
            cable,
            longitude,
            latitude,
        )
    }

    focusLocation(longitude: number, latitude: number, zoom = 14) {
        this.map?.flyTo({
            center: [longitude, latitude],
            zoom,
            essential: true,
        })
    }

    focusCoordinate(
        longitude: number,
        latitude: number,
        zoom = 17,
    ) {
        if (!this.map) return

        const position: [number, number] = [
            longitude,
            latitude,
        ]

        this.map.flyTo({
            center: position,
            zoom,
            essential: true,
        })

        this.coordinateMarker?.remove()

        this.coordinateMarker = new Marker({
            color: '#ef4444',
            scale: 0.6,
        })
            .setLngLat(position)
            .addTo(this.map)

        const markerElement =
            this.coordinateMarker.getElement()

        markerElement.style.cursor = 'pointer'

        markerElement.addEventListener(
            'click',
            (event) => {
                event.stopPropagation()

                console.log(
                    '[MapLibreService] Coordinate marker clicked:',
                    {
                        longitude,
                        latitude,
                    },
                )

                this.onCoordinateMarkerClick?.(
                    longitude,
                    latitude,
                )
            },
        )
    }

    focusFeature(
        feature: MapFeature,
        zoom = 14,
    ) {
        if (!this.map) return

        const geometry = feature.geometry

        if (geometry.type === 'Point') {
            const [longitude, latitude] =
                geometry.coordinates

            if (
                longitude === undefined ||
                latitude === undefined
            ) {
                return
            }

            this.focusLocation(
                longitude,
                latitude,
                zoom,
            )

            return
        }

        if (geometry.type === 'LineString') {
            const coordinates =
                geometry.coordinates

            if (coordinates.length === 0) {
                return
            }

            const middleIndex =
                Math.floor(
                    coordinates.length / 2,
                )

            const middlePoint =
                coordinates[middleIndex]

            if (!middlePoint) {
                return
            }

            const [
                longitude,
                latitude,
            ] = middlePoint

            if (
                longitude === undefined ||
                latitude === undefined
            ) {
                return
            }

            this.focusLocation(
                longitude,
                latitude,
                zoom,
            )
        }
    }

    zoomIn() {
        this.map?.zoomIn()
    }

    zoomOut() {
        this.map?.zoomOut()
    }

    locateUser() {
        if (!this.map) return

        if (!('geolocation' in navigator)) {
            this.focusLocation(104.9282, 11.5564, 12)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords

                this.focusLocation(longitude, latitude, 14)
            },
            () => this.focusLocation(104.9282, 11.5564, 12),
            { enableHighAccuracy: true, timeout: 5000 },
        )
    }

    private renderMapData(
        sites: Site[],
        cables: Cable[],
        assetPoints: AssetPoint[],
        fieldObservations: FieldObservation[],
        filters: MapFilters,
    ) {
        if (!this.map) return

        const filteredSites =
            this.filterSites(
                sites,
                filters.search,
                filters.sites,
            )

        if (filters.sites) {
            this.siteLayer.render(
                this.map,
                filteredSites,
                (site) => {
                    this.onSiteClick?.(site)

                    this.bindSitePopup(site)
                },
            )
        } else {
            this.siteLayer.clear()
        }

        if (filters.assetPoints) {
            this.assetPointLayer.render(
                this.map,
                assetPoints,
                (assetPoint) => {
                    this.onAssetPointClick?.(
                        assetPoint,
                    )

                    this.bindAssetPointPopup(
                        assetPoint,
                    )
                },
            )
        } else {
            this.assetPointLayer.clear()
        }

        if (filters.fieldObservations) {
            this.fieldObservationLayer.render(
                this.map,
                fieldObservations,
                (observation) => {
                    this.bindFieldObservationPopup(
                        observation,
                    )
                },
            )
        } else {
            this.fieldObservationLayer.clear()
        }
    }

    private filterSites(
        sites: Site[],
        search: string,
        enabled: boolean,
    ) {
        if (!enabled) return []

        const keyword = search.trim().toLowerCase()

        return sites.filter((site) => {
            const haystack = [
                site.id,
                site.code,
                site.name,
                site.cityId,
                site.address,
                site.elevation ?? '',
                site.description,
            ]
                .join(' ')
                .toLowerCase()

            return !keyword || haystack.includes(keyword)
        })
    }

}
