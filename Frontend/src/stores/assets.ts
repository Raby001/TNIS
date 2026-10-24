import { defineStore } from 'pinia'
import { ref } from 'vue'
import { assetApi, guessStatusColor } from '../services/api/asset.api'
import { referenceDataApi } from '../services/api/reference-data.api'
import { sitesApi } from '../services/api/sites.api'
import type {
  Asset,
  AssetFilters,
  Manufacturer,
  Vendor,
  AssetModel,
  Project,
  MaintenanceContract,
  PaginationMeta,
} from '../types/asset'
import type {
  AssetType,
  AssetStatus,
} from '../types/reference-data'
import type { Site } from '../types/site'

export const useAssetsStore = defineStore('assets', () => {
  const assets = ref<Asset[]>([])
  const assetTypes = ref<AssetType[]>([])
  const statuses = ref<AssetStatus[]>([])
  const manufacturers = ref<Manufacturer[]>([])
  const vendors = ref<Vendor[]>([])
  const assetModels = ref<AssetModel[]>([]) 
  const projects = ref<Project[]>([])
  const maintenanceContracts = ref<MaintenanceContract[]>([])
  const sites = ref<Site[]>([])

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })

  async function loadAssets(filters: AssetFilters = {}) {
  isLoading.value = true
  error.value = null
  try {
    const result = await assetApi.fetchAssets(filters)
    assets.value = result.assets
    pagination.value = result.meta
  } catch (err) {
    error.value = 'Could not load assets'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const statusCounts = ref<Record<string, number>>({})

async function fetchStatusCounts(statusIds: string[], filters: Partial<Parameters<typeof assetApi.fetchAssets>[0]> = {}) {
  const results = await Promise.all(
    statusIds.map(async (id) => {
      const res = await assetApi.fetchAssets({
        ...filters,
        statusId: id,
        page: 1,
        limit: 1,
      })
      return {
        id,
        total: res.meta.total,
      }
    }),
  )
  statusCounts.value = Object.fromEntries(results.map((r) => [r.id, r.total]))
}

async function loadAssetModels(manufacturerId: string) {
  try {

   assetModels.value = await assetApi.fetchAssetModels(manufacturerId)

  } catch (err) {
    console.error('Failed to load asset models', err)
    assetModels.value = []
  }
}

async function loadReferenceData() {
  try {
    const [typesRes, statusRes, sitesRes] = await Promise.all([
      referenceDataApi.getAssetTypes(),
      referenceDataApi.getStatuses(),
      sitesApi.getAllPaginated({ page: 1, limit: 100 }),
    ])

    assetTypes.value = typesRes.data ?? typesRes

    const rawStatuses = statusRes.data ?? statusRes
    statuses.value = (Array.isArray(rawStatuses) ? rawStatuses : []).map((s: any) => ({
      ...s,
      color: guessStatusColor(s.name),
    }))

    sites.value = sitesRes.sites ?? []

    manufacturers.value = []
    vendors.value = []
    projects.value = []
    maintenanceContracts.value = []
  } catch (err) {
    console.error('Failed to load reference data', err)
  }
}

async function addAsset(payload: any) {
  const created = await assetApi.createAsset(payload)
  await loadAssets({ page: 1, limit: 10 })
  return created
}

async function updateAsset(id: string, payload: any) {
  await assetApi.updateAsset(id, payload)
}

async function removeAsset(asset: Asset) {
  await assetApi.deleteAsset(asset)
  assets.value = assets.value.filter(a => a.id !== asset.id)
}

  return {
    assets,
    assetTypes,
    statuses,
    manufacturers,
    vendors,
    sites,
    assetModels,
    projects,
    maintenanceContracts,
    isLoading,
    error,
    pagination,
    loadAssets,
    loadReferenceData,
    addAsset,
    updateAsset,
    removeAsset,
    loadAssetModels,
    statusCounts,
    fetchStatusCounts
  }
})

