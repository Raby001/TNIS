import {
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    watch,
} from 'vue'

import { storeToRefs } from 'pinia'

import { mapService } from '@/services'
import { useMapStore } from '@/stores/map.store'
import { mapApi } from '@/services/api/map.api'
import { referenceDataApi } from '@/services/api/reference-data.api'
import { useMapFilters } from './useMapFilters'

import type {
    CableTarget,
    CablePoint,
    Cable,
} from '@/types/cable'
import { fieldObservationApi } from '@/services/api/field-observation.api'
import type { DeleteTarget } from '@/types/map'
import { sitesApi } from '@/services/api/sites.api'
import type { AssetPoint, AssetPointType } from '@/types/asset-point'
import { assetApi } from '@/services/api/asset.api'
import { fiberCableApi } from '@/services/api/fiber-cable.api'
import { useMapPermissions } from './useMapPermissions'

export function useMap() {
    const mapContainer =
        ref<HTMLDivElement | null>(null)

    const cableHitTest =
        ref<((x: number, y: number) => string | null) | null>(null)

    const mapStore =
        useMapStore()

    const {
        canManage,
    } = useMapPermissions()

    const {
        appliedFilters,
    } = useMapFilters()

    const {
        draftCable,
        isLoaded,
        filters,
        siteFormOpen,
        cableFormOpen,
        isCableDrawing,
        assetPointFormOpen,
        fieldObservationToConvert,
        cableDrawingStep,
        activeTool,
        assetPointType,
        assetPoints,
        deleteTarget,
        deleteDialogOpen,
        deleting,
        fieldObservations,
        fieldObservationFormOpen,
        searchKeyword,
        selectedSearchResult,
        coordinateSearch,
    } = storeToRefs(mapStore)

    const getAssetTypeForAssetPoint = async (
        assetPoint: AssetPoint,
    ) => {
        try {
            const response =
                await referenceDataApi.getAssetTypes()

            const assetType =
                response.data.find(
                    (type) =>
                        type.name.trim().toLowerCase() ===
                        assetPoint.type.trim().toLowerCase(),
                )

            if (!assetType) {
                console.error(
                    '[useMap] Asset type not found for asset point:',
                    {
                        type: assetPoint.type,
                        assetPoint,
                    },
                )

                return null
            }

            return assetType
        } catch (error) {
            console.error(
                '[useMap] Failed to load asset types:',
                error,
            )

            return null
        }
    }

    const startCableDrawing = async () => {
        if (!canManage.value) return

        try {
            const response =
                await referenceDataApi.getAssetTypes()

            const cableAssetType =
                response.data.find(
                    (assetType) =>
                        assetType.name === 'Fiber Cable' &&
                        assetType.geometryType === 'LineString',
                )

            if (!cableAssetType) {
                console.error(
                    'Fiber Cable asset type not found.',
                )
                return
            }

            mapStore.openCableForm(
                cableAssetType.id,
            )
        } catch (error) {
            console.error(
                'Failed to load cable asset type:',
                error,
            )
        }
    }

    const getDraftCablePoints = () => {
        return draftCable.value.route.map(
            ([longitude, latitude]) => ({
                longitude,
                latitude,
            }),
        )
    }

    const syncCablePreview = () => {
        if (
            !isLoaded.value ||
            !cableFormOpen.value
        ) {
            mapStore.clearDraftCablePreview()
            return
        }

        const points = getDraftCablePoints()

        if (points.length < 2) {
            mapStore.clearDraftCablePreview()
            return
        }

        const coordinates = points.map(
            (point) =>
                [
                    point.longitude,
                    point.latitude,
                ] as [number, number],
        )

        mapStore.setDraftCablePreviewRoute(
            coordinates,
        )
    }

    const syncNetwork = async () => {
        if (!isLoaded.value) return

        try {
            const response = await mapApi.getFeatures(
                appliedFilters.value,
            )

            const result = mapService.syncMapFeatures(
                response.data.features,
                filters.value,
            )

            mapStore.setSites(result.sites)
            mapStore.setAssetPoints(result.assetPoints)
            mapStore.setCables(result.cables)
            mapStore.setFieldObservations(result.fieldObservations)

        } catch (error) {
            console.error(
                'Failed to load map features:',
                error,
            )
        }
    }

    const requestDelete = (
        type: DeleteTarget['type'],
        id: string,
        name: string,
        assetPointType?: AssetPointType,
    ) => {
        if (!canManage.value) return

        deleteTarget.value = {
            type,
            id,
            name,
            assetPointType,
        }

        deleteDialogOpen.value = true
    }

    const confirmDelete = async () => {
        if (!canManage.value) return

        const target = deleteTarget.value

        if (!target || deleting.value) {
            return
        }

        deleting.value = true

        try {
            if (target.type === 'site') {
                await sitesApi.delete(target.id)
            }

            if (target.type === 'asset-point') {
                if (!target.assetPointType) {
                    throw new Error(
                        'Cannot delete asset point: asset type is missing.',
                    )
                }

                await assetApi.deleteAssetPoint(
                    target.assetPointType,
                    target.id,
                )
            }

            if (target.type === 'cable') {
                await fiberCableApi.delete(
                    target.id,
                )
            }

            if (target.type === 'field-observation') {
                await fieldObservationApi.cancel(
                    target.id,
                )
            }

            mapService.closePopup()

            deleteTarget.value = null
            deleteDialogOpen.value = false

            await syncNetwork()
        } catch (error) {
            console.error(
                `Failed to delete ${target.type}:`,
                error,
            )
        } finally {
            deleting.value = false
        }
    }

    const cancelDelete = () => {
        if (deleting.value) {
            return
        }

        deleteTarget.value = null
        deleteDialogOpen.value = false
    }

    let searchRequestId = 0
    let searchTimeout: ReturnType<typeof setTimeout> | null = null

    const searchMapFeatures = async (
        keyword: string,
    ) => {
        const value = keyword.trim()

        if (!value) {
            searchRequestId++

            mapStore.setSearchResults([])
            mapStore.setSearchLoading(false)
            return
        }

        const requestId = ++searchRequestId

        mapStore.setSearchLoading(true)

        try {
            const response = await mapApi.getFeatures(
                appliedFilters.value,
                value,
            )

            if (requestId !== searchRequestId) {
                return
            }

            mapStore.setSearchResults(
                response.data.features,
            )
        } catch (error) {
            if (requestId !== searchRequestId) {
                return
            }

            console.error(
                'Failed to search map features:',
                error,
            )

            mapStore.setSearchResults([])
        } finally {
            if (requestId === searchRequestId) {
                mapStore.setSearchLoading(false)
            }
        }
    }

    const renderNetwork = () => {
        if (!isLoaded.value) {
            return
        }

        void mapService.syncNetwork(
            mapStore.sites,
            mapStore.cables,
            filters.value,
            mapStore.assetPoints,
            mapStore.fieldObservations,
        )
    }

    const bindMapInteractions = () => {
        const map = mapService.getMap()

        if (!map) return

        const isPlacementTool = () =>
            activeTool.value === 'draw-cable' ||
            activeTool.value === 'create-site' ||
            activeTool.value === 'create-field-observation' ||
            activeTool.value === 'create-asset-point'

        map.on('mousemove', (event) => {
            mapStore.setCursor(
                event.lngLat.lng,
                event.lngLat.lat,
            )

            if (isPlacementTool()) {
                map.getCanvas().style.cursor = 'crosshair'
                return
            }

            const cableId =
                cableHitTest.value?.(
                    event.point.x,
                    event.point.y,
                ) ?? null

            map.getCanvas().style.cursor =
                cableId
                    ? 'pointer'
                    : ''
        })
    }

    const selectCableTarget = (
        target: CableTarget,
    ) => {
        if (
            !cableFormOpen.value ||
            activeTool.value !== 'draw-cable'
        ) {
            return
        }

        const cable = draftCable.value

        const selectedTargets = [
            cable.startTarget,
            ...cable.middleTargets,
            cable.endTarget,
        ].filter(
            (selectedTarget): selectedTarget is CableTarget =>
                selectedTarget !== null,
        )

        const alreadySelected = selectedTargets.some(
            (selectedTarget) =>
                selectedTarget.id === target.id &&
                selectedTarget.type === target.type,
        )

        if (alreadySelected) {
            return
        }

        switch (cableDrawingStep.value) {
            case 'selecting-start':
                mapStore.setCableStartTarget(target)
                return

            case 'selecting-end':
                mapStore.setCableEndTarget(target)
                return

            case 'adding-sub-point':
                mapStore.addCableMiddleTarget(target)
                return

            case 'replacing-middle-target':
                mapStore.replaceCableMiddleTarget(target)
                return

            default:
                return
        }
    }

    const addCableSubPoint = (
        longitude: number,
        latitude: number,
    ) => {
        if (
            !cableFormOpen.value ||
            activeTool.value !== 'draw-cable' ||
            cableDrawingStep.value !== 'adding-sub-point'
        ) {
            return
        }

        const point: CablePoint = {
            longitude,
            latitude,
        }

        mapStore.addCableSubPoint(point)
    }

    const handleMapClick = (
        longitude: number,
        latitude: number,
        x: number,
        y: number,
    ) => {
        if (
            !canManage.value &&
            activeTool.value !== 'navigate'
        ) {
            mapStore.setActiveTool('navigate')
        }

        // Asset point placement
        if (
            activeTool.value === 'create-asset-point' &&
            assetPointType.value &&
            !assetPointFormOpen.value
        ) {
            mapStore.openAssetPointForm(
                assetPointType.value,
                longitude,
                latitude,
            )

            return
        }

        // Site placement
        if (
            activeTool.value === 'create-site' &&
            !siteFormOpen.value
        ) {
            mapStore.openSiteForm(
                longitude,
                latitude,
            )

            return
        }

        // Field observation placement
        if (
            activeTool.value === 'create-field-observation' &&
            !fieldObservationFormOpen.value
        ) {
            mapStore.openFieldObservationForm(
                longitude,
                latitude,
            )

            return
        }

        // Cable drawing
        if (
            activeTool.value === 'draw-cable' &&
            cableFormOpen.value &&
            cableDrawingStep.value === 'adding-sub-point'
        ) {
            addCableSubPoint(
                longitude,
                latitude,
            )

            return
        }

        if (
            activeTool.value === 'draw-cable' &&
            cableFormOpen.value &&
            cableDrawingStep.value === 'replacing-sub-point'
        ) {
            mapStore.replaceCableSubPoint(
                longitude,
                latitude,
            )

            return
        }

        // Normal navigation: check cable hit
        const cableId =
            cableHitTest.value?.(x, y) ?? null

        if (cableId) {
            console.log(
                '[useMap] Cable clicked:',
                cableId,
            )

            const cable = mapStore.cables.find(
                (item: Cable) => item.id === cableId,
            )

            if (cable) {
                mapStore.setSelectedCable(cableId)

                mapService.showCablePopup(
                    cable,
                    longitude,
                    latitude,
                )
            }

            return
        }
    }

    onMounted(() => {
        if (!mapContainer.value) {
            return
        }

        const map =
            mapService.initialize(
                mapContainer.value,
            )

        mapStore.setMap(map)

        mapService.setSiteClickHandler(
            (site) => {
                selectCableTarget({
                    id: site.id,
                    type: 'SITE',
                    name: site.name,
                    longitude: site.longitude,
                    latitude: site.latitude,
                })
            },
        )

        mapService.setAssetPointActionHandlers(
            async (assetPoint) => {
                const assetType =
                    await getAssetTypeForAssetPoint(
                        assetPoint,
                    )

                if (!assetType) {
                    return
                }

                console.log(
                    '[useMap] Editing asset point:',
                    {
                        assetPoint,
                        assetType,
                    },
                )

                mapStore.openEditAssetPointForm(
                    assetPoint,
                    assetType,
                )
            },
            (assetPoint) => {
                requestDelete(
                    'asset-point',
                    assetPoint.id,
                    assetPoint.asset?.name ?? assetPoint.id,
                    assetPoint.type,
                )
            },
        )

        mapService.setSiteActionHandlers(
            (site) => {
                mapStore.openEditSiteForm(site)
            },
            (site) => {
                requestDelete(
                    'site',
                    site.id,
                    site.name,
                )
            },
        )

        mapService.setCableActionHandlers(
            (cable) => {
                console.log(
                    '[useMap] Editing cable:',
                    cable,
                )

                mapStore.openEditCableForm(cable)

                mapService.closePopup()
            },
            (cable) => {
                console.log(
                    '[useMap] Deleting cable:',
                    cable,
                )

                requestDelete(
                    'cable',
                    cable.id,
                    cable.name,
                )
            },
        )

        mapService.setEndpointClickHandlers(
            (assetPoint) => {
                selectCableTarget({
                    id: assetPoint.id,
                    type: 'ASSET',
                    name: assetPoint.type,
                    longitude: assetPoint.longitude,
                    latitude: assetPoint.latitude,
                })
            },
        )

        mapService.setCablePopupCloseHandler(() => {
            mapStore.clearSelectedCable()
        })

        mapService.setCoordinateMarkerClickHandler(
            (longitude, latitude) => {
                if (!canManage.value) return

                console.log(
                    '[useMap] Coordinate marker clicked:',
                    {
                        longitude,
                        latitude,
                    },
                )

                mapStore.openFieldObservationForm(
                    longitude,
                    latitude,
                )

                console.log(
                    '[useMap] Field observation form open:',
                    mapStore.fieldObservationFormOpen,
                )
            },
        )

        mapService.setFieldObservationConvertHandler(
            (observation) => {
                if (!canManage.value) return

                mapStore.startFieldObservationConversion(
                    observation,
                )

                mapStore.setActiveTool(
                    'create-asset-point',
                )
            },
        )

        mapService.setFieldObservationCancelHandler(
            (observation) => {
                if (!canManage.value) return

                requestDelete(
                    'field-observation',
                    observation.id,
                    observation.name,
                )
            },
        )

        map.on(
            'click',
            (event) => {
                handleMapClick(
                    event.lngLat.lng,
                    event.lngLat.lat,
                    event.point.x,
                    event.point.y,
                )
            },
        )

        map.once(
            'load',
            async () => {

                mapStore.setLoaded(true)

                await syncNetwork()

                bindMapInteractions()
            },
        )
    })

    watch(
        [
            appliedFilters,
            isLoaded,
        ],
        () => {
            syncNetwork()
        },
        {
            deep: true,
        },
    )

    watch(
        searchKeyword,
        (keyword) => {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }

            searchTimeout = setTimeout(() => {
                void searchMapFeatures(keyword)
            }, 300)
        },
    )

    watch(
        selectedSearchResult,
        (feature) => {
            if (!feature) {
                return
            }

            mapService.focusFeature(
                feature,
                15,
            )

            mapService.showSearchFeaturePopup(
                feature,
            )

            mapStore.clearSearch()
        },
    )

    watch(
        [coordinateSearch, isLoaded],
        ([coordinate, loaded]) => {
            console.log('[useMap] Coordinate watcher triggered:', {
                coordinate,
                loaded,
            })

            if (!coordinate || !loaded) {
                console.log('[useMap] Coordinate search skipped')
                return
            }

            console.log('[useMap] Focusing coordinate:', {
                longitude: coordinate.longitude,
                latitude: coordinate.latitude,
            })

            mapService.focusCoordinate(
                coordinate.longitude,
                coordinate.latitude,
                17,
            )

            mapStore.clearCoordinateSearch()
        },
    )

    watch(
        assetPoints,
        () => {
            renderNetwork()
        },
        {
            deep: true,
        },
    )

    watch(
        [
            () => filters.value.sites,
            () => filters.value.assetPoints,
            () => filters.value.cables,
            () => filters.value.fieldObservations,
        ],
        () => {
            renderNetwork()
        },
    )

    watch(
        [
            cableFormOpen,
            siteFormOpen,
            assetPointFormOpen,
            fieldObservationFormOpen,
            fieldObservationToConvert,
        ],
        () => {
            nextTick(
                syncNetwork,
            )
        },
    )

    watch(
        isCableDrawing,
        (isDrawing) => {
            mapService.setCableDrawingState(isDrawing)
        },
        { immediate: true },
    )

    watch(
        canManage,
        (canManageMap) => {
            mapService.setMapManagementPermission(
                canManageMap,
            )

            if (!canManageMap && activeTool.value !== 'navigate') {
                mapStore.setActiveTool('navigate')
                mapService.closePopup()
            }
        },
        { immediate: true },
    )

    watch(
        [
            () => draftCable.value.route,
            cableDrawingStep,
            cableFormOpen,
            isLoaded,
        ],
        () => {
            syncCablePreview()
        },
        {
            deep: true,
        },
    )

    onUnmounted(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
            searchTimeout = null
        }

        mapService.destroy()

        mapStore.setMap(null)

        mapStore.setLoaded(false)
    })

    return {
        mapContainer,
        startCableDrawing,
        cableHitTest,
        syncNetwork,

        requestDelete,
        confirmDelete,
        cancelDelete,
    }
}
