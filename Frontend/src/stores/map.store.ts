import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { createDefaultAssetForm, createEmptyAssetPointDraft } from '@/config/asset-point-form.config'

import type { Map } from 'maplibre-gl'

import type {
    Cable,
    CableDraft,
    CablePoint,
    CableTarget,
    InstallationSegment,
} from '@/types/cable'
import type { Site } from '@/types/site'
import type {
    AssetPoint,
    AssetPointDraftState,
    AssetPointFormData,
    AssetPointType,
} from '@/types/asset-point'
import type { CreateSiteForm } from '@/types/site'
import { sitesApi } from '@/services/api/sites.api'
import type { AssetType } from '@/types/reference-data'
import type { SiteRecord } from '@/types/site'
import type { InstallationSegmentFeature, MapFeature } from '@/types/map-feature'
import type { FieldObservation } from '@/types/field-observation'
import type { DeleteTarget } from '@/types/map'

export type MapTool = 'navigate' | 'create-site' | 'create-field-observation' | 'create-asset-point' | 'draw-cable'
export type MapLayerType = 'site' | 'cable'
export type CableDrawingStep =
    | 'idle'
    | 'selecting-start'
    | 'adding-sub-point'
    | 'selecting-end'
    | 'replacing-middle-target'
    | 'replacing-sub-point'
    | 'preview'

export interface MapFilters {
    search: string
    sites: boolean
    assetPoints: boolean
    fieldObservations: boolean
    cables: boolean
}

interface FieldObservationDraft {
    name: string
    description: string
    longitude: number
    latitude: number
}

const defaultFilters: MapFilters = {
    search: '',
    sites: true,
    assetPoints: true,
    fieldObservations: true,
    cables: true,
}

const createDefaultFilters = (): MapFilters => ({
    ...defaultFilters,
})

const emptySiteDraft = (
    longitude = 104.9282,
    latitude = 11.5564,
): CreateSiteForm => ({
    name: '',
    cityId: '',
    address: '',
    elevation: null,
    description: '',
    latitude,
    longitude,
})

const emptyCableDraft = (): CableDraft => ({
    name: '',

    assetTypeId: '',
    statusId: '',
    siteId: '',
    cableTypeId: '',
    coreCountId: '',
    segmentTypeId: '',
    installationMethodId: '',

    description: '',
    assetTag: null,
    serialNumber: null,
    purchaseDate: null,
    installationDate: null,

    startTarget: null,
    middleTargets: [],
    subPoints: [],
    endTarget: null,
    installationSegments: [],
    route: [],
})

const emptyFieldObservationDraft = (
    longitude = 104.9282,
    latitude = 11.5564,
): FieldObservationDraft => ({
    name: '',
    description: '',
    longitude,
    latitude,
})

export const useMapStore = defineStore('map', () => {
    const map = shallowRef<Map | null>(null)
    const isLoaded = ref(false)
    const activeTool = ref<MapTool>('navigate')
    const sidebarOpen = ref(false)

    const cursor = ref({
        longitude: 104.9282,
        latitude: 11.5564,
    })

    const filters = ref<MapFilters>(createDefaultFilters())

    const sites = ref<Site[]>([])
    const cables = ref<Cable[]>([])
    const assetPoints = ref<AssetPoint[]>([])
    const fieldObservations = ref<FieldObservation[]>([])

    const deleteTarget = ref<DeleteTarget | null>(null)
    const deleteDialogOpen = ref(false)
    const deleting = ref(false)

    const searchKeyword = ref('')
    const searchResults = ref<MapFeature[]>([])
    const searchLoading = ref(false)
    const selectedSearchResult = ref<MapFeature | null>(null)

    const coordinateSearch = ref<{
        latitude: number
        longitude: number
    } | null>(null)

    const siteFormOpen = ref(false)
    const editingSite = ref<Site | null>(null)
    const draftSite = ref<CreateSiteForm>(emptySiteDraft())

    const cableFormOpen = ref(false)
    const editingCable = ref<Cable | null>(null)
    const cableDrawingStep = ref<CableDrawingStep>('idle')
    const middleTargetReplacementIndex = ref<number | null>(null)
    const subPointReplacementIndex = ref<number | null>(null)
    const draftCable = ref<CableDraft>(emptyCableDraft())
    const isCableDrawing = ref(false)

    const assetPointFormOpen = ref(false)
    const editingAssetPoint = ref<AssetPoint | null>(null)
    const assetPointType = ref<AssetType | null>(null)
    const draftAssetPoint = ref<AssetPointDraftState | null>(null)

    const draftCablePreviewRoute = ref<[number, number][]>([])
    const selectedCableId = ref<string | null>(null)

    const fieldObservationFormOpen = ref(false)

    const draftFieldObservation =
        ref<FieldObservationDraft>(
            emptyFieldObservationDraft(),
        )

    const fieldObservationToConvert =
        ref<FieldObservation | null>(null)

    const selectedCable = computed(() => {
        if (!selectedCableId.value) {
            return null
        }

        return (
            cables.value.find(
                (cable) =>
                    cable.id === selectedCableId.value,
            ) ?? null
        )
    })

    const layerCounts = computed(() => ({
        sites: sites.value.length,
        cables: cables.value.length,
        assetPoints: assetPoints.value.length,
        fieldObservations: fieldObservations.value.length,
    }))

    const setSelectedCable = (
        cableId: string | null,
    ) => {
        selectedCableId.value = cableId
    }

    const clearSelectedCable = () => {
        selectedCableId.value = null
    }

    function setMap(instance: Map | null) {
        map.value = instance
    }

    function setLoaded(value: boolean) {
        isLoaded.value = value
    }

    function setSidebarOpen(value: boolean) {
        sidebarOpen.value = value
    }

    function toggleSidebar() {
        sidebarOpen.value = !sidebarOpen.value
    }

    function setActiveTool(tool: MapTool) {
        activeTool.value = tool

        if (tool !== 'create-site') {
            siteFormOpen.value = false
        }

        if (tool !== 'create-asset-point') {
            assetPointFormOpen.value = false
            assetPointType.value = null
            draftAssetPoint.value = null
        }

        if (tool !== 'create-field-observation') {
            fieldObservationFormOpen.value = false
        }

        if (tool !== 'draw-cable') {
            cableFormOpen.value = false
        }
    }

    async function loadSites() {
        try {
            const response = await sitesApi.getAllSitesFilter()

            sites.value = response.data.map(siteToSite)
        } catch (error) {
            console.error(
                'Failed to load sites:',
                error,
            )
        }
    }

    function setSites(value: Site[]) {
        sites.value = value
    }

    function setFieldObservations(
        value: FieldObservation[],
    ) {
        fieldObservations.value = value
    }

    function openSiteForm(longitude: number, latitude: number) {
        editingSite.value = null

        draftSite.value = emptySiteDraft(longitude, latitude)
        siteFormOpen.value = true
        activeTool.value = 'create-site'
    }

    function openEditSiteForm(site: Site) {
        editingSite.value = site

        draftSite.value = {
            name: site.name,
            cityId: site.cityId ?? '',
            address: site.address ?? '',
            elevation: site.elevation ?? null,
            description: site.description ?? '',
            latitude: site.latitude,
            longitude: site.longitude,
        }

        siteFormOpen.value = true
        activeTool.value = 'create-site'
    }

    function closeSiteForm() {
        siteFormOpen.value = false
        editingSite.value = null

        if (activeTool.value === 'create-site') {
            activeTool.value = 'navigate'
        }
    }

    function assetDataToFormData(
        type: AssetPointType,
        data: AssetPoint['assetData'],
    ): AssetPointDraftState['assetData'] {
        if (!data) {
            return createDefaultAssetForm(type)
        }

        return {
            ...data,
        } as AssetPointDraftState['assetData']
    }

    function assetToFormData(
        asset: AssetPoint['asset'],
    ): AssetPointDraftState['asset'] {
        return {
            assetTypeId: asset.assetTypeId ?? null,
            statusId: asset.statusId ?? null,
            siteId: asset.siteId ?? null,

            code: asset.code ?? '',
            assetTag: asset.assetTag ?? '',
            serialNumber: asset.serialNumber ?? null,

            name: asset.name ?? '',
            description: asset.description ?? '',

            purchaseDate: asset.purchaseDate ?? null,
            installationDate: asset.installationDate ?? null,
            warrantyStart: asset.warrantyStart ?? null,
            warrantyEnd: asset.warrantyEnd ?? null,
        }
    }

    function openAssetPointForm(
        type: AssetType,
        longitude: number,
        latitude: number,
    ) {
        assetPointType.value = type

        const typeKey =
            type.name
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '-') as AssetPointType

        draftAssetPoint.value =
            createEmptyAssetPointDraft(
                typeKey,
                longitude,
                latitude,
            )

        assetPointFormOpen.value = true
        activeTool.value = 'create-asset-point'
    }

    function openEditAssetPointForm(
        assetPoint: AssetPoint,
        assetType: AssetType,
    ) {
        editingAssetPoint.value = assetPoint

        assetPointType.value = assetType

        draftAssetPoint.value = {
            type: assetPoint.type,

            asset: assetToFormData(assetPoint.asset),

            latitude: assetPoint.latitude,
            longitude: assetPoint.longitude,

            assetData: assetDataToFormData(
                assetPoint.type,
                assetPoint.assetData,
            ),
        }

        assetPointFormOpen.value = true
        activeTool.value = 'create-asset-point'
    }

    function openFieldObservationForm(
        longitude: number,
        latitude: number,
    ) {
        draftFieldObservation.value =
            emptyFieldObservationDraft(
                longitude,
                latitude,
            )

        fieldObservationFormOpen.value = true
    }

    function updateDraftFieldObservation(
        partial: Partial<FieldObservationDraft>,
    ) {
        draftFieldObservation.value = {
            ...draftFieldObservation.value,
            ...partial,
        }
    }

    function closeAssetPointForm() {
        assetPointFormOpen.value = false
        editingAssetPoint.value = null
        assetPointType.value = null
        draftAssetPoint.value = null

        if (activeTool.value === 'create-asset-point') {
            activeTool.value = 'navigate'
        }
    }

    function closeFieldObservationForm() {
        fieldObservationFormOpen.value = false
        draftFieldObservation.value =
            emptyFieldObservationDraft()

        if (activeTool.value === 'create-field-observation') {
            activeTool.value = 'navigate'
        }
    }

    function startFieldObservationConversion(
        observation: FieldObservation,
    ) {
        fieldObservationToConvert.value = observation
    }

    function clearFieldObservationConversion() {
        fieldObservationToConvert.value = null
    }

    function selectAssetPointType(type: AssetType) {
        assetPointType.value = type
    }

    function addAssetPoint(
        assetPoint: AssetPoint,
    ) {
        assetPoints.value = [
            ...assetPoints.value,
            assetPoint,
        ]

        closeAssetPointForm()
    }

    function setAssetPoints(value: AssetPoint[]) {
        assetPoints.value = value
    }

    function openCableForm(
        assetTypeId: string,
    ) {
        if (cableFormOpen.value) {
            return
        }

        draftCable.value = {
            ...emptyCableDraft(),

            assetTypeId,
        }

        draftCablePreviewRoute.value = []

        cableDrawingStep.value = 'idle'

        activeTool.value = 'draw-cable'

        isCableDrawing.value = true
        cableFormOpen.value = true
    }

    function openEditCableForm(cable: Cable) {
        editingCable.value = cable

        draftCable.value = {
            name: cable.name,

            assetTypeId: cable.assetTypeId,
            statusId: cable.statusId,
            siteId: cable.siteId,
            cableTypeId: cable.cableTypeId,
            coreCountId: cable.coreCountId,
            installationMethodId: cable.installationMethodId,

            segmentTypeId: cable.segmentTypeId ?? '',

            assetTag: cable.assetTag ?? null,
            serialNumber: cable.serialNumber ?? null,

            purchaseDate: cable.purchaseDate ?? null,
            installationDate: cable.installationDate ?? null,

            description: cable.description ?? '',

            startTarget: cable.startTarget
                ? { ...cable.startTarget }
                : null,

            middleTargets: cable.middleTargets.map(
                target => ({ ...target }),
            ),

            subPoints: cable.subPoints.map(
                point => ({ ...point }),
            ),

            endTarget: cable.endTarget
                ? { ...cable.endTarget }
                : null,

            installationSegments:
                cable.installationSegments.map(
                    mapInstallationSegmentToDraft,
                ),

            route: cable.route.map(
                ([longitude, latitude]) => [
                    longitude,
                    latitude,
                ],
            ),
        }

        cableFormOpen.value = true
        activeTool.value = 'draw-cable'
        isCableDrawing.value = true
        cableDrawingStep.value =
            draftCable.value.startTarget &&
            draftCable.value.endTarget
                ? 'preview'
                : 'selecting-start'
    }

    function mapInstallationSegmentToDraft(
        segment: InstallationSegmentFeature,
    ): InstallationSegment {
        return {
            fromTarget: {
                id:
                    segment.from.targetType === 'ASSET'
                        ? segment.from.assetId!
                        : segment.from.siteId!,
                type: segment.from.targetType!,
            },

            toTarget: {
                id:
                    segment.to.targetType === 'ASSET'
                        ? segment.to.assetId!
                        : segment.to.siteId!,
                type: segment.to.targetType!,
            },

            installationMethodId:
                segment.installationMethod.id,
        }
    }

    const setCableDrawing = (value: boolean) => {
        isCableDrawing.value = value
    }

    function closeCableForm() {
        cableFormOpen.value = false
        cableDrawingStep.value = 'idle'
        isCableDrawing.value = false

        if (
            activeTool.value === 'draw-cable'
        ) {
            activeTool.value = 'navigate'
        }
    }

    function cancelCableDrawing() {
        cableFormOpen.value = false
        cableDrawingStep.value = 'idle'
        isCableDrawing.value = false

        draftCable.value = emptyCableDraft()
        draftCablePreviewRoute.value = []

        editingCable.value = null

        if (activeTool.value === 'draw-cable') {
            activeTool.value = 'navigate'
        }
    }
    function setCursor(longitude: number, latitude: number) {
        cursor.value = {
            longitude,
            latitude,
        }
    }

    function setFilter<K extends keyof MapFilters>(
        key: K,
        value: MapFilters[K],
    ) {
        filters.value[key] = value
    }

    function resetFilters() {
        filters.value = {
            ...defaultFilters,
        }
    }

    function updateDraftSite(partial: Partial<CreateSiteForm>) {
        draftSite.value = {
            ...draftSite.value,
            ...partial,
        }
    }

    function updateDraftCable(partial: Partial<CableDraft>) {
        draftCable.value = {
            ...draftCable.value,
            ...partial,
        }
    }

    function setCableStartTarget(
        target: CableTarget,
    ) {
        draftCable.value = {
            ...draftCable.value,

            startTarget: target,

            middleTargets: [],

            subPoints: [],

            endTarget: null,

            route: [
                [target.longitude, target.latitude],
            ],
        }

        cableDrawingStep.value = 'adding-sub-point'
    }

    function addCableSubPoint(
        point: CablePoint,
    ) {
        draftCable.value = {
            ...draftCable.value,

            subPoints: [
                ...draftCable.value.subPoints,
                point,
            ],

            route: [
                ...draftCable.value.route,
                [point.longitude, point.latitude],
            ],
        }

        cableDrawingStep.value = 'adding-sub-point'
    }

    function addCableMiddleTarget(
        target: CableTarget,
    ) {
        draftCable.value = {
            ...draftCable.value,

            middleTargets: [
                ...draftCable.value.middleTargets,
                target,
            ],

            route: [
                ...draftCable.value.route,
                [target.longitude, target.latitude],
            ],
        }

        rebuildCableInstallationSegments()
        cableDrawingStep.value = 'adding-sub-point'
    }

    function removeCableMiddleTarget(
        index: number,
    ) {
        const target =
            draftCable.value.middleTargets[index]

        if (!target) return

        const middleTargets =
            draftCable.value.middleTargets.filter(
                (_, targetIndex) =>
                    targetIndex !== index,
            )

        const targetCoordinate: [number, number] = [
            target.longitude,
            target.latitude,
        ]

        const route = [
            ...draftCable.value.route,
        ]

        const routeIndex = route.findIndex(
            ([longitude, latitude]) =>
                longitude === targetCoordinate[0] &&
                latitude === targetCoordinate[1],
        )

        if (routeIndex !== -1) {
            route.splice(routeIndex, 1)
        }

        draftCable.value = {
            ...draftCable.value,
            middleTargets,
            route,
        }

        rebuildCableInstallationSegments()

        if (draftCable.value.endTarget) {
            cableDrawingStep.value = 'preview'
        } else {
            cableDrawingStep.value = 'adding-sub-point'
        }
    }

    function removeCableSubPoint(index: number) {
        const point = draftCable.value.subPoints[index]

        if (!point) {
            return
        }

        const subPoints =
            draftCable.value.subPoints.filter(
                (_, pointIndex) =>
                    pointIndex !== index,
            )

        const route = [
            ...draftCable.value.route,
        ]

        const endRouteIndex =
            draftCable.value.endTarget
                ? route.length - 1
                : route.length

        const routeIndex = route.findIndex(
            ([longitude, latitude], coordinateIndex) =>
                coordinateIndex > 0 &&
                coordinateIndex < endRouteIndex &&
                longitude === point.longitude &&
                latitude === point.latitude,
        )

        if (routeIndex !== -1) {
            route.splice(routeIndex, 1)
        }

        draftCable.value = {
            ...draftCable.value,
            subPoints,
            route,
        }

        if (draftCable.value.endTarget) {
            cableDrawingStep.value = 'preview'
        } else {
            cableDrawingStep.value = 'adding-sub-point'
        }
    }

    function startReplacingCableMiddleTarget(index: number) {
        if (!draftCable.value.middleTargets[index]) {
            return
        }

        middleTargetReplacementIndex.value = index
        cableDrawingStep.value = 'replacing-middle-target'
    }

    function replaceCableMiddleTarget(target: CableTarget) {
        const index = middleTargetReplacementIndex.value
        const currentTarget = index === null
            ? undefined
            : draftCable.value.middleTargets[index]

        if (!currentTarget || index === null) {
            return
        }

        const middleTargets = [
            ...draftCable.value.middleTargets,
        ]
        middleTargets[index] = target

        const route = [
            ...draftCable.value.route,
        ]
        const endRouteIndex = draftCable.value.endTarget
            ? route.length - 1
            : route.length
        const routeIndex = route.findIndex(
            ([longitude, latitude], coordinateIndex) =>
                coordinateIndex > 0 &&
                coordinateIndex < endRouteIndex &&
                longitude === currentTarget.longitude &&
                latitude === currentTarget.latitude,
        )

        if (routeIndex !== -1) {
            route[routeIndex] = [
                target.longitude,
                target.latitude,
            ]
        }

        draftCable.value = {
            ...draftCable.value,
            middleTargets,
            route,
        }

        middleTargetReplacementIndex.value = null
        rebuildCableInstallationSegments()
        cableDrawingStep.value = draftCable.value.endTarget
            ? 'preview'
            : 'adding-sub-point'
    }

    function startReplacingCableSubPoint(index: number) {
        if (!draftCable.value.subPoints[index]) {
            return
        }

        subPointReplacementIndex.value = index
        cableDrawingStep.value = 'replacing-sub-point'
    }

    function replaceCableSubPoint(
        longitude: number,
        latitude: number,
    ) {
        const index = subPointReplacementIndex.value
        const currentPoint = index === null
            ? undefined
            : draftCable.value.subPoints[index]

        if (!currentPoint || index === null) {
            return
        }

        const subPoints = [
            ...draftCable.value.subPoints,
        ]
        subPoints[index] = {
            longitude,
            latitude,
        }

        const route = [
            ...draftCable.value.route,
        ]
        const endRouteIndex = draftCable.value.endTarget
            ? route.length - 1
            : route.length
        const routeIndex = route.findIndex(
            ([routeLongitude, routeLatitude], coordinateIndex) =>
                coordinateIndex > 0 &&
                coordinateIndex < endRouteIndex &&
                routeLongitude === currentPoint.longitude &&
                routeLatitude === currentPoint.latitude,
        )

        if (routeIndex !== -1) {
            route[routeIndex] = [longitude, latitude]
        }

        draftCable.value = {
            ...draftCable.value,
            subPoints,
            route,
        }

        subPointReplacementIndex.value = null
        cableDrawingStep.value = draftCable.value.endTarget
            ? 'preview'
            : 'adding-sub-point'
    }

    function setCableEndTarget(
        target: CableTarget,
    ) {
        if (!draftCable.value.startTarget) {
            return
        }

        const route = draftCable.value.endTarget
            ? draftCable.value.route.slice(0, -1)
            : [...draftCable.value.route]

        draftCable.value = {
            ...draftCable.value,

            endTarget: target,

            route: [
                ...route,
                [target.longitude, target.latitude],
            ],
        }

        rebuildCableInstallationSegments()

        cableDrawingStep.value = 'preview'
    }

    function clearCableDrawing() {
        draftCable.value = {
            ...draftCable.value,

            startTarget: null,
            middleTargets: [],
            subPoints: [],
            endTarget: null,
            route: [],
        }

        draftCablePreviewRoute.value = []
        middleTargetReplacementIndex.value = null
        subPointReplacementIndex.value = null

        cableDrawingStep.value = 'selecting-start'
    }

    function startSelectingCableStart() {
        if (!cableFormOpen.value) {
            return
        }

        cableDrawingStep.value = 'selecting-start'
    }

    function startAddingCableSubPoint() {
        if (
            !draftCable.value.startTarget ||
            draftCable.value.endTarget
        ) {
            return
        }

        cableDrawingStep.value = 'adding-sub-point'
    }

    function startSelectingCableEnd() {
        if (!draftCable.value.startTarget) {
            return
        }

        cableDrawingStep.value = 'selecting-end'
    }

    function addSiteFromSite(site: SiteRecord) {
        const nextSite = siteToSite(site)

        sites.value = [
            ...sites.value,
            nextSite,
        ]

        map.value?.flyTo({
            center: [
                nextSite.longitude,
                nextSite.latitude,
            ],
            zoom: 14,
            essential: true,
        })
    }

    function updateSiteFromSite(site: SiteRecord) {
        const updatedSite = siteToSite(site)

        sites.value = sites.value.map((existingSite) =>
            existingSite.id === updatedSite.id
                ? updatedSite
                : existingSite,
        )

        map.value?.flyTo({
            center: [
                updatedSite.longitude,
                updatedSite.latitude,
            ],
            zoom: 14,
            essential: true,
        })
    }

    function removeSite(siteId: string) {
        sites.value = sites.value.filter(
            (site) => site.id !== siteId,
        )
    }

    function siteToSite(site: SiteRecord): Site {
        const coordinates = Array.isArray(site.geometry?.coordinates)
            ? site.geometry.coordinates
            : [0, 0]

        const [longitude, latitude] = coordinates

        return {
            id: site.id,
            name: site.name,
            code: site.code,
            cityId: site.cityId ?? site.city?.id ?? '',
            cityName: site.city?.name ?? site.cityName,
            provinceId: site.city?.province?.id ?? site.provinceId,
            provinceName: site.city?.province?.name ?? site.provinceName,
            address: site.address,
            elevation: site.elevation ?? null,
            description: site.description ?? '',
            latitude: Number(latitude ?? 0),
            longitude: Number(longitude ?? 0),
            type: site.type,
            attachments: site.attachments ?? [],
            createdAt: site.createdAt,
            updatedAt: site.updatedAt,
        }
    }

    function setDraftCablePreviewRoute(
        route: [number, number][],
    ) {
        draftCablePreviewRoute.value = route
    }

    function clearDraftCablePreview() {
        draftCablePreviewRoute.value = []
    }

    function setCableSegmentInstallationMethod(
        index: number,
        installationMethodId: string | null,
    ) {
        const segments = [
            ...draftCable.value.installationSegments,
        ]

        const segment = segments[index]

        if (!segment) {
            return
        }

        segments[index] = {
            ...segment,
            installationMethodId,
        }

        draftCable.value = {
            ...draftCable.value,
            installationSegments: segments,
        }
    }

    function rebuildCableInstallationSegments() {
        const draft = draftCable.value

        if (!draft.startTarget || !draft.endTarget) {
            draftCable.value = {
                ...draft,
                installationSegments: [],
            }

            return
        }

        const targets = [
            draft.startTarget,
            ...draft.middleTargets,
            draft.endTarget,
        ]

        if (draft.middleTargets.length === 0) {
            draftCable.value = {
                ...draft,
                installationSegments: [],
            }

            return
        }

        const previousSegments =
            draft.installationSegments

        const installationSegments: InstallationSegment[] = []

        for (
            let index = 0;
            index < targets.length - 1;
            index++
        ) {
            const fromTarget = targets[index]
            const toTarget = targets[index + 1]

            if (!fromTarget || !toTarget) {
                continue
            }

            const previousSegment =
                previousSegments[index]

            installationSegments.push({
                fromTarget,
                toTarget,
                installationMethodId:
                    previousSegment?.installationMethodId ?? null,
            })
        }

        draftCable.value = {
            ...draft,
            installationSegments,
        }
    }

    function saveDraftCable() {
        const draft = draftCable.value

        if (
            !draft.startTarget ||
            !draft.endTarget ||
            draft.route.length < 2
        ) {
            return
        }

        const id =
            `CAB-${String(
                cables.value.length + 1,
            ).padStart(3, '0')}`

        const cable: Cable = {
            id,

            name:
                draft.name.trim() ||
                `Cable ${cables.value.length + 1}`,

            assetTypeId:
                draft.assetTypeId,

            statusId:
                draft.statusId,

            siteId:
                draft.siteId,

            cableTypeId:
                draft.cableTypeId,

            coreCountId:
                draft.coreCountId,

            installationMethodId:
                draft.installationMethodId,

            description:
                draft.description.trim(),

            startTarget:
                draft.startTarget,

            middleTargets:
                [...draft.middleTargets],

            subPoints:
                [...draft.subPoints],

            endTarget:
                draft.endTarget,

            installationSegments: [],

            route:
                [...draft.route],
        }

        cables.value = [
            ...cables.value,
            cable,
        ]

        if (draft.route.length > 0) {
            const midpoint =
                draft.route[
                Math.floor(draft.route.length / 2)
                ]

            if (midpoint) {
                map.value?.flyTo({
                    center: midpoint,
                    zoom: 12,
                    essential: true,
                })
            }
        }

        draftCable.value =
            emptyCableDraft()

        cableFormOpen.value = false
        cableDrawingStep.value = 'idle'

        if (
            activeTool.value === 'draw-cable'
        ) {
            activeTool.value = 'navigate'
        }
    }


    function setCables(
        value: Cable[],
    ) {
        cables.value = value
    }

    function setCableRoute(
        cableId: string,
        route: [number, number][],
    ) {
        cables.value =
            cables.value.map(
                (cable) =>
                    cable.id === cableId
                        ? {
                            ...cable,
                            route,
                        }
                        : cable,
            )
    }

    function setMapHome() {
        map.value?.flyTo({
            center: [104.9282, 11.5564],
            zoom: 12,
            essential: true,
        })
    }

    function zoomIn() {
        map.value?.zoomIn()
    }

    function zoomOut() {
        map.value?.zoomOut()
    }

    function locateUser() {
        if (!map.value) return

        if (!('geolocation' in navigator)) {
            setMapHome()
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords

                map.value?.flyTo({
                    center: [longitude, latitude],
                    zoom: 14,
                    essential: true,
                })
            },
            () => setMapHome(),
            {
                enableHighAccuracy: true,
                timeout: 5000,
            },
        )
    }

    function setSearchKeyword(value: string) {
        searchKeyword.value = value
    }

    function setCoordinateSearch(coordinate: {
        latitude: number
        longitude: number
    }) {
        coordinateSearch.value = coordinate
    }

    function clearCoordinateSearch() {
        coordinateSearch.value = null
    }

    function setSearchResults(
        value: MapFeature[],
    ) {
        searchResults.value = value
    }

    function setSearchLoading(
        value: boolean,
    ) {
        searchLoading.value = value
    }

    function selectSearchResult(
        feature: MapFeature | null,
    ) {
        selectedSearchResult.value = feature
    }

    function clearSearch() {
        searchKeyword.value = ''
        searchResults.value = []
        searchLoading.value = false
        selectedSearchResult.value = null
    }

    return {
        map,
        isLoaded,
        activeTool,
        sidebarOpen,
        cursor,
        filters,
        sites,
        cables,
        fieldObservations,
        fieldObservationToConvert,
        draftSite,
        editingSite,
        draftCable,
        draftAssetPoint,
        editingAssetPoint,
        draftCablePreviewRoute,
        draftFieldObservation,
        siteFormOpen,
        cableFormOpen,
        editingCable,
        isCableDrawing,
        assetPointFormOpen,
        fieldObservationFormOpen,
        cableDrawingStep,
        middleTargetReplacementIndex,
        subPointReplacementIndex,
        assetPoints,
        deleteTarget,
        deleteDialogOpen,
        deleting,
        // Search getter
        searchKeyword,
        searchResults,
        searchLoading,
        selectedSearchResult,
        coordinateSearch,

        assetPointType,
        layerCounts,
        selectedCableId,
        selectedCable,
        setSelectedCable,
        clearSelectedCable,
        setMap,
        setLoaded,
        setSidebarOpen,
        toggleSidebar,
        setActiveTool,
        loadSites,
        setSites,
        setFieldObservations,
        openSiteForm,
        openEditSiteForm,
        closeSiteForm,
        openAssetPointForm,
        openEditAssetPointForm,
        openFieldObservationForm,
        updateDraftFieldObservation,
        closeFieldObservationForm,
        startFieldObservationConversion,
        clearFieldObservationConversion,
        closeAssetPointForm,
        selectAssetPointType,
        addAssetPoint,
        setAssetPoints,
        // Search setters
        setSearchKeyword,
        setSearchResults,
        setSearchLoading,
        selectSearchResult,
        clearSearch,
        setCoordinateSearch,
        clearCoordinateSearch,

        openCableForm,
        openEditCableForm,
        setCableDrawing,
        closeCableForm,
        cancelCableDrawing,
        startSelectingCableStart,
        startAddingCableSubPoint,
        startSelectingCableEnd,
        setCursor,
        setFilter,
        resetFilters,
        updateDraftSite,
        updateDraftCable,
        setCableStartTarget,
        addCableSubPoint,
        addCableMiddleTarget,
        removeCableMiddleTarget,
        removeCableSubPoint,
        startReplacingCableMiddleTarget,
        replaceCableMiddleTarget,
        startReplacingCableSubPoint,
        replaceCableSubPoint,
        setCableEndTarget,
        clearCableDrawing,
        clearDraftCablePreview,
        setCableSegmentInstallationMethod,
        setCables,
        setCableRoute,
        addSiteFromSite,
        updateSiteFromSite,
        removeSite,
        setDraftCablePreviewRoute,
        saveDraftCable,
        setMapHome,
        zoomIn,
        zoomOut,
        locateUser,
    }
})
