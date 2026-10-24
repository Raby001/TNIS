import {
    computed,
    reactive,
    ref,
} from 'vue'

import {
    MAP_FILTER_TYPES,
    type MapFilterType,
} from '@/config/map-filter.config'

import { referenceDataApi } from '@/services/api/reference-data.api'
import { locationsApi } from '@/services/api/locations.api'
import { sitesApi } from '@/services/api/sites.api'

export interface SelectOption {
    value: string
    label: string
}

export interface MapFilterState {
    types: MapFilterType[]

    // General filters
    provinceId: string
    cityId: string
    siteId: string
    statusId: string

    // Fiber cable specific
    coreCountId: string
    segmentTypeId: string
    cableTypeId: string
    installationMethodId: string

    // ONT specific
    customerId: string

    limit: number
}

const createDefaultFilters = (): MapFilterState => ({
    types: [],

    provinceId: '',
    cityId: '',
    siteId: '',
    statusId: '',

    coreCountId: '',
    segmentTypeId: '',
    cableTypeId: '',
    installationMethodId: '',

    customerId: '',

    limit: 1000,
})

const filterState = reactive<MapFilterState>(createDefaultFilters())

const appliedFilters = ref<MapFilterState>(createDefaultFilters())

const provinces = ref<SelectOption[]>([])

const allCities = ref<SelectOption[]>([])
const cities = ref<SelectOption[]>([])

const allSites = ref<SelectOption[]>([])
const sites = ref<SelectOption[]>([])

const statuses = ref<SelectOption[]>([])
const coreCounts = ref<SelectOption[]>([])
const segmentTypes = ref<SelectOption[]>([])
const cableTypes = ref<SelectOption[]>([])
const installationMethods = ref<SelectOption[]>([])
const customers = ref<SelectOption[]>([])

const loadingProvinces = ref(false)
const loadingCities = ref(false)
const loadingSites = ref(false)

const loading = ref(false)
const error = ref<string | null>(null)

const mapToSelectOption = (
    item: {
        id: string
        name: string
    },
): SelectOption => ({
    value: item.id,
    label: item.name,
})

export function useMapFilters() {

    const filterTypes = MAP_FILTER_TYPES.map(
        (type) => ({
            value: type,
            label: type,
        }),
    )

    const currentTypeLabel = computed(() => {
        if (filterState.types.length === 0) {
            return 'All Types'
        }

        return filterState.types.join(', ')
    })

    const toggleType = (
        type: MapFilterType,
    ) => {
        const index = filterState.types.indexOf(type)

        if (index === -1) {
            filterState.types.push(type)
        } else {
            filterState.types.splice(index, 1)
        }

        if (!filterState.types.includes('FIBER_CABLE')) {
            filterState.coreCountId = ''
            filterState.segmentTypeId = ''
            filterState.cableTypeId = ''
            filterState.installationMethodId = ''
        }

        if (!filterState.types.includes('ONU')) {
            filterState.customerId = ''
        }
    }

    const showFiberCableFilters = computed(() =>
        filterState.types.includes('FIBER_CABLE'),
    )

    const showCustomerFilter = computed(() =>
        filterState.types.includes('ONU'),
    )

    const applyFilters = () => {
        appliedFilters.value = { ...filterState }
    }

    const resetFilters = () => {
        Object.assign(
            filterState,
            createDefaultFilters(),
        )

        cities.value = [...allCities.value]
        sites.value = [...allSites.value]
    }

    const handleProvinceChange = async (
        provinceId: string,
    ) => {

        filterState.provinceId = provinceId

        filterState.cityId = ''
        filterState.siteId = ''

        error.value = null

        if (!provinceId) {
            cities.value = [...allCities.value]
            sites.value = [...allSites.value]
            return
        }

        loadingCities.value = true
        loadingSites.value = true

        try {
            const [
                citiesResponse,
                sitesResponse,
            ] = await Promise.all([
                locationsApi.getCitiesByProvince(
                    provinceId,
                ),

                locationsApi.getSitesByProvince(
                    provinceId,
                ),
            ])

            cities.value =
                citiesResponse.data.map(
                    mapToSelectOption,
                )

            sites.value =
                sitesResponse.data.map(
                    mapToSelectOption,
                )
        } catch (err) {
            console.error(
                'Failed to load province locations:',
                err,
            )

            error.value =
                'Failed to load cities and sites for this province.'
        } finally {
            loadingCities.value = false
            loadingSites.value = false
        }
    }

    const handleCityChange = async (
        cityId: string,
    ) => {
        filterState.cityId = cityId
        filterState.siteId = ''

        error.value = null

        if (!cityId) {
            if (filterState.provinceId) {
                await loadSitesByProvince(
                    filterState.provinceId,
                )
            } else {
                sites.value = [...allSites.value]
            }

            return
        }

        await loadSitesByCity(cityId)
    }

    const loadSitesByProvince = async (
        provinceId: string,
    ) => {
        if (!provinceId) {
            sites.value = [...allSites.value]
            return
        }

        sites.value = []
        loadingSites.value = true

        try {
            const response =
                await locationsApi.getSitesByProvince(
                    provinceId,
                )

            sites.value =
                response.data.map(
                    mapToSelectOption,
                )
        } catch (err) {
            console.error(
                'Failed to load sites by province:',
                err,
            )

            error.value =
                'Failed to load sites for the selected province.'
        } finally {
            loadingSites.value = false
        }
    }

    const loadSitesByCity = async (
        cityId: string,
    ) => {
        if (!cityId) {
            if (filterState.provinceId) {
                await loadSitesByProvince(
                    filterState.provinceId,
                )
            } else {
                sites.value = [...allSites.value]
            }

            return
        }

        sites.value = []
        loadingSites.value = true

        try {
            const response =
                await locationsApi.getSitesByCity(
                    cityId,
                )

            sites.value =
                response.data.map(
                    mapToSelectOption,
                )
        } catch (err) {
            console.error(
                'Failed to load sites by city:',
                err,
            )

            error.value =
                'Failed to load sites for the selected city.'
        } finally {
            loadingSites.value = false
        }
    }

    const loadCitiesByProvince = async (
        provinceId: string,
    ) => {
        cities.value = []
        sites.value = []

        if (!provinceId) {
            return
        }

        loadingCities.value = true

        try {
            const response =
                await locationsApi.getCitiesByProvince(
                    provinceId,
                )

            cities.value = response.data.map(
                mapToSelectOption,
            )
        } catch (err) {
            console.error(
                'Failed to load cities by province:',
                err,
            )

            error.value =
                'Failed to load cities for the selected province.'
        } finally {
            loadingCities.value = false
        }
    }

    const loadFilterOptions = async () => {
        loading.value = true
        error.value = null

        try {
            const [
                provincesResponse,
                citiesResponse,
                sitesResponse,
                statusesResponse,
                coreCountsResponse,
                cableTypesResponse,
                segmentTypesResponse,
                installationMethodsResponse,
            ] = await Promise.all([
                referenceDataApi.getProvinces(),
                referenceDataApi.getCities(),
                sitesApi.getAllSites(),
                referenceDataApi.getStatuses(),
                referenceDataApi.getCableCoreCounts(),
                referenceDataApi.getCableTypes(),
                referenceDataApi.getFiberSegmentTypes(),
                referenceDataApi.getInstallationMethods(),
            ])

            provinces.value =
                provincesResponse.data.map(
                    mapToSelectOption,
                )

            allCities.value =
                citiesResponse.data.map(
                    mapToSelectOption,
                )

            cities.value = [...allCities.value]

            allSites.value =
                sitesResponse.data.map(
                    mapToSelectOption,
                )

            sites.value = [...allSites.value]

            statuses.value =
                statusesResponse.data.map(
                    mapToSelectOption,
                )

            coreCounts.value =
                coreCountsResponse.data.map(
                    (item) => ({
                        value: item.id,
                        label: item.displayCode,
                    }),
                )

            cableTypes.value =
                cableTypesResponse.data.map(
                    (item) => ({
                        value: item.id,
                        label: item.name,
                    }),
                )

            segmentTypes.value =
                segmentTypesResponse.data.map(
                    (item) => ({
                        value: item.id,
                        label: item.name,
                    }),
                )

            installationMethods.value =
                installationMethodsResponse.data.map(
                    (item) => ({
                        value: item.id,
                        label: item.name,
                    }),
                )

        } catch (err) {
            console.error(
                'Failed to load filter options:',
                err,
            )

            error.value =
                'Failed to load filter options.'
        } finally {
            loading.value = false
        }
    }

    return {
        filterState,
        appliedFilters,

        filterTypes,
        currentTypeLabel,

        provinces,
        cities,
        sites,
        statuses,
        coreCounts,
        segmentTypes,
        cableTypes,
        installationMethods,
        customers,

        showFiberCableFilters,
        showCustomerFilter,

        loading,
        error,
        loadingProvinces,
        loadingCities,
        loadingSites,

        handleProvinceChange,
        handleCityChange,

        loadSitesByProvince,
        loadSitesByCity,
        loadCitiesByProvince,

        toggleType,
        resetFilters,
        applyFilters,
        loadFilterOptions,
    }
}