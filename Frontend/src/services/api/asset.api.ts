import api from './api'
import type {
  Asset,
  AssetFormData,
  CreateAssetRequest,
  AssetFilters,
  PaginationMeta,
  FetchAssetsResult,
  RawApiAsset,
} from '@/types/asset'
import type {
  AssetType,
  AssetStatus,
} from '@/types/reference-data'
import { mapAssetPointSpecificDetails } from '../mappers/asset-point-payload.mapper'
import type {
  TowerDetail
} from '@/types/tower'
import type {
  AssetPointType,
  AssetPointFormModel,
  CreateAssetPointRequest,
  AssetPointFormModelMap
} from '@/types/asset-point'
import type {
  CreateSpliceClosureRequest,
  UpdateSpliceClosureRequest,
  SpliceClosureDetailResponse,
} from '@/types/splice-closure'
import type { CreateNapRequest, UpdateNapRequest, } from '@/types/nap'
import type { CreateTowerRequest, UpdateTowerRequest, } from '@/types/tower'
import type { CreatePoleRequest, UpdatePoleRequest } from '@/types/pole'
import type { CreateManholeRequest, UpdateManholeRequest } from '@/types/manhole'
import type { CreateHandholeRequest, UpdateHandholeRequest } from '@/types/handhole'
import type { CreateOnuRequest, UpdateOnuRequest } from '@/types/onu'
import type { CreateOccRequest, UpdateOccRequest } from '@/types/occ'
import type {
  CreateLcpRequest,
  UpdateLcpRequest,
  LcpDetailResponse,
} from '@/types/lcp'
import { mapAssetPointUpdatePayload } from '../mappers/asset-point-update.mapper'

export function guessStatusColor(name: string | undefined): AssetStatus['color'] {
  const map: Record<string, AssetStatus['color']> = {
    'In Service': 'green',
    'Installed': 'teal',
    'In Stock': 'blue',
    'Planned': 'slate',
    'Decommissioned': 'slate',
    'Scrapped': 'slate',
    'Under Maintenance': 'purple',
    'Under Repair': 'amber',
    'Faulty': 'red',
  }
  return name ? map[name] ?? 'slate' : 'slate'
}

export function mapAssetFromApi(raw: RawApiAsset): Asset {
  const isPoint = raw.geometry?.type === 'Point'
  const [lng, lat] = isPoint ? raw.geometry!.coordinates : [undefined, undefined]
  const rawStatus = typeof raw.lifecycleStatus === 'object' ? raw.lifecycleStatus : undefined
  const statusName = rawStatus?.name ?? (typeof raw.lifecycleStatus === 'string' ? raw.lifecycleStatus : undefined)

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? undefined,
    code: raw.code ?? null,
    assetTag: raw.assetTag ?? raw.code ?? '',
    serialNumber: raw.serialNumber ?? undefined,
    statusId: rawStatus?.id ?? raw.lifecycleStatusId ?? '',
    conditionId: raw.condition?.id ?? raw.conditionId,
    statusName,
    assetTypeId: raw.assetType?.id ?? raw.assetTypeId ?? '',
    siteId: raw.siteId ?? raw.site?.id,
    manufacturerId: raw.manufacturer?.id,
    assetModelId: raw.assetModel?.id,
    vendorId: raw.vendor?.id,
    projectId: raw.project?.id,
    purchaseDate: raw.purchaseDate ?? undefined,
    installationDate: raw.installationDate ?? undefined,
    warrantyStart: raw.warrantyStart ?? undefined,
    warrantyEnd: raw.warrantyEnd ?? undefined,
    latitude: lat,
    longitude: lng,
    geometry: raw.geometry,
    updatedAt: raw.updatedAt,

    status: statusName
      ? {
        id: rawStatus?.id ?? raw.lifecycleStatusId ?? '',
        name: statusName,
        description: '',
        createdAt: '',
        updatedAt: '',
        color: guessStatusColor(statusName),
      }
      : undefined,

    assetType: raw.assetType
      ? {
        id: raw.assetType.id,
        name: raw.assetType.name,
        geometryType: raw.assetType.geometryType as AssetType['geometryType'],
        canConnectToFiber: raw.assetType.canConnectToFiber,
        qualifier: raw.assetType.qualifier,
      }
      : undefined,

    manufacturer: raw.manufacturer,
    assetModel: raw.assetModel,
    vendor: raw.vendor,
    project: raw.project ? { ...raw.project, code: raw.project.code ?? '' } : undefined,
  }
}

const createGeneralAssetPayload = (
  asset: AssetFormData,
  location: CreateAssetPointRequest['location'],
): CreateAssetRequest => ({
  name: asset.name.trim(),
  assetTypeId: asset.assetTypeId!,
  lifecycleStatusId: asset.statusId!,
  conditionId: asset.conditionId!,
  siteId: asset.siteId!,
  serialNumber: asset.serialNumber,
  description: asset.description?.trim(),
  purchaseDate: asset.purchaseDate,
  installationDate: asset.installationDate,
  warrantyStart: asset.warrantyStart,
  warrantyEnd: asset.warrantyEnd,
  geometry: {
    type: 'Point',
    coordinates: [location.longitude, location.latitude],
  },
})

// ---------- single API object ----------
export const assetApi = {
  // ===== Read / List =====
  async fetchAssets(filters: AssetFilters = {}): Promise<FetchAssetsResult> {
    const { statusId, ...otherFilters } = filters
    const params = {
      page: 1,
      limit: 10,
      sortBy: 'updatedAt',
      sortOrder: 'DESC' as const,
      ...otherFilters,
      lifecycleStatusId: filters.lifecycleStatusId ?? statusId,
    }

    const { data } = await api.get<{ data: RawApiAsset[]; meta: PaginationMeta }>('/assets', {
      params,
    })

    return {
      assets: (data.data ?? []).map(mapAssetFromApi),
      meta: data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
    }
  },

  // TOWER
  createTower(data: CreateTowerRequest) {
    return api.post('/towers', data)
  },

  updateTower(id: string, data: Partial<UpdateTowerRequest>) {
    return api.patch(`/towers/${id}`, data)
  },

  async getTower(id: string): Promise<TowerDetail> {
    const { data } = await api.get<TowerDetail>(`/towers/${id}`)
    return data
  },

  deleteTower(id: string) {
    return api.delete(`/towers/${id}`)
  },

  // CLOSURE
  createSpliceClosure(data: CreateSpliceClosureRequest) {
    return api.post('/splice-closures', data)
  },

  updateSpliceClosure(id: string, data: UpdateSpliceClosureRequest) {
    return api.patch(`/splice-closures/${id}`, data)
  },

  async getSpliceClosure(id: string): Promise<SpliceClosureDetailResponse> {
    const { data } = await api.get<SpliceClosureDetailResponse>(
      `/splice-closures/${id}`,
    )
    return data
  },

  deleteSpliceClosure(id: string) {
    return api.delete(`/splice-closures/${id}`)
  },

  // NAP
  createNap(data: CreateNapRequest) {
    return api.post('/naps', data)
  },

  updateNap(id: string, data: UpdateNapRequest) {
    return api.patch(`/naps/${id}`, data)
  },

  deleteNap(id: string) {
    return api.delete(`/naps/${id}`)
  },

  // POLE
  createPole(data: CreatePoleRequest) {
    return api.post('/poles', data)
  },

  updatePole(id: string, data: UpdatePoleRequest) {
    return api.patch(`/poles/${id}`, data)
  },

  deletePole(id: string) {
    return api.delete(`/poles/${id}`)
  },

  // MANHOLE
  createManhole(data: CreateManholeRequest) {
    return api.post('/manholes', data)
  },

  updateManhole(id: string, data: UpdateManholeRequest) {
    return api.patch(`/manholes/${id}`, data)
  },

  deleteManhole(id: string) {
    return api.delete(`/manholes/${id}`)
  },

  // HANDHOLE
  createHandhole(data: CreateHandholeRequest) {
    return api.post('/handholes', data)
  },

  updateHandhole(id: string, data: UpdateHandholeRequest) {
    return api.patch(`/handholes/${id}`, data)
  },

  deleteHandhole(id: string) {
    return api.delete(`/handholes/${id}`)
  },

  // ONU
  createOnu(data: CreateOnuRequest) {
    return api.post('/onus', data)
  },

  updateOnu(id: string, data: UpdateOnuRequest) {
    return api.patch(`/onus/${id}`, data)
  },

  deleteOnu(id: string) {
    return api.delete(`/onus/${id}`)
  },


  // OCC
  createOcc(data: CreateOccRequest) {
    return api.post('/occs', data)
  },

  updateOcc(id: string, data: UpdateOccRequest) {
    return api.patch(`/occs/${id}`, data)
  },

  deleteOcc(id: string) {
    return api.delete(`/occs/${id}`)
  },

  // LCP
  createLcp(data: CreateLcpRequest) {
    return api.post('/lcps', data)
  },

  updateLcp(id: string, data: UpdateLcpRequest) {
    return api.patch(`/lcps/${id}`, data)
  },

  deleteLcp(id: string) {
    return api.delete(`/lcps/${id}`)
  },

  async getLcp(id: string): Promise<LcpDetailResponse> {
    const { data } = await api.get<LcpDetailResponse>(`/lcps/${id}`)
    return data
  },

  // GENERAL ASSET
  createAsset(data: CreateAssetRequest) {
    return api.post('/assets', data)
  },

  createAssetPoint(data: CreateAssetPointRequest) {
    const generalPayload = createGeneralAssetPayload(
      data.asset,
      data.location,
    )

    switch (data.type) {
      case 'closure': {
        const specificDetails = mapAssetPointSpecificDetails(
          'closure',
          data.specific,
        )

        return this.createSpliceClosure({
          ...generalPayload,
          ...specificDetails,
        })
      }

      case 'nap': {
        const specificDetails = mapAssetPointSpecificDetails(
          'nap',
          data.specific,
        )

        return this.createNap({
          ...generalPayload,
          ...specificDetails,
        })
      }

      case 'tower': {
        const specificDetails = mapAssetPointSpecificDetails(
          'tower',
          data.specific,
        )

        return this.createTower({
          ...generalPayload,
          ...specificDetails,
        })
      }

      case 'pole': {
        const specificDetails = mapAssetPointSpecificDetails(
          'pole',
          data.specific,
        )

        return this.createPole({
          ...generalPayload,
          ...specificDetails,
        })
      }

      case 'manhole': {
        const specificDetails = mapAssetPointSpecificDetails(
          'manhole',
          data.specific,
        )

        return this.createManhole({
          ...generalPayload,
          ...specificDetails,
        })
      }

      case 'handhole': {
        const specificDetails = mapAssetPointSpecificDetails(
          'handhole',
          data.specific,
        )

        return this.createHandhole({
          ...generalPayload,
          ...specificDetails,
        })
      }

      case 'onu': {
        const specificDetails = mapAssetPointSpecificDetails(
          'onu',
          data.specific,
        )

        return this.createOnu({
          ...generalPayload,
          ...specificDetails,
        })
      }

      case 'occ': {
        const specificDetails = mapAssetPointSpecificDetails(
          'occ',
          data.specific,
        )

        return this.createOcc({
          ...generalPayload,
          ...specificDetails,
        })
      }

      case 'lcp': {
        const specificDetails = mapAssetPointSpecificDetails(
          'lcp',
          data.specific,
        )

        return this.createLcp({
          ...generalPayload,
          ...specificDetails,
        })
      }

      default:
        return this.createAsset(generalPayload)
    }
  },

  updateAssetPoint(
    type: AssetPointType,
    id: string,
    asset: AssetFormData,
    specific: AssetPointFormModel,
    location: {
      latitude: number
      longitude: number
    },
  ) {
    switch (type) {
      case 'closure': {
        const payload = mapAssetPointUpdatePayload(
          'closure',
          asset,
          specific as AssetPointFormModelMap['closure'],
          location,
        )

        return this.updateSpliceClosure(id, payload)
      }

      case 'nap': {
        const payload = mapAssetPointUpdatePayload(
          'nap',
          asset,
          specific as AssetPointFormModelMap['nap'],
          location,
        )

        return this.updateNap(id, payload)
      }

      case 'tower': {
        const payload = mapAssetPointUpdatePayload(
          'tower',
          asset,
          specific as AssetPointFormModelMap['tower'],
          location,
        )

        return this.updateTower(id, payload)
      }

      case 'pole': {
        const payload = mapAssetPointUpdatePayload(
          'pole',
          asset,
          specific as AssetPointFormModelMap['pole'],
          location,
        )

        return this.updatePole(id, payload)
      }

      case 'manhole': {
        const payload = mapAssetPointUpdatePayload(
          'manhole',
          asset,
          specific as AssetPointFormModelMap['manhole'],
          location,
        )

        return this.updateManhole(id, payload)
      }

      case 'handhole': {
        const payload = mapAssetPointUpdatePayload(
          'handhole',
          asset,
          specific as AssetPointFormModelMap['handhole'],
          location,
        )

        return this.updateHandhole(id, payload)
      }

      case 'onu': {
        const payload = mapAssetPointUpdatePayload(
          'onu',
          asset,
          specific as AssetPointFormModelMap['onu'],
          location,
        )

        return this.updateOnu(id, payload)
      }

      case 'occ': {
        const payload = mapAssetPointUpdatePayload(
          'occ',
          asset,
          specific as AssetPointFormModelMap['occ'],
          location,
        )

        return this.updateOcc(id, payload)
      }

      case 'lcp': {
        const payload = mapAssetPointUpdatePayload(
          'lcp',
          asset,
          specific as AssetPointFormModelMap['lcp'],
          location,
        )

        return this.updateLcp(id, payload)
      }

      default:
        throw new Error(
          `Update is not supported for asset type: ${type}`,
        )
    }
  },

  deleteAssetPoint(
    type: AssetPointType,
    id: string,
  ) {
    switch (type) {
      case 'closure':
        return this.deleteSpliceClosure(id)

      case 'nap':
        return this.deleteNap(id)

      case 'tower':
        return this.deleteTower(id)

      case 'pole':
        return this.deletePole(id)

      case 'manhole':
        return this.deleteManhole(id)

      case 'handhole':
        return this.deleteHandhole(id)

      case 'onu':
        return this.deleteOnu(id)

      case 'occ':
        return this.deleteOcc(id)

      case 'lcp':
        return this.deleteLcp(id)

      default:
        throw new Error(
          `Delete is not supported for asset type: ${type} `,
        )
    }
  },


  // ===== Update / Delete =====
  updateAsset(id: string, payload: Partial<Asset>) {
    const { statusId, ...otherPayload } = payload
    return api.patch(`/assets/${id}`, {
      ...otherPayload,
      ...(statusId ? { lifecycleStatusId: statusId } : {}),
    })
  },

  async deleteAsset(asset: Asset) {
    const typeName = asset.assetType?.name
    const endpointMap: Record<string, string> = {
      Router: `/routers/${asset.id}`,
      NAP: `/naps/${asset.id}`,
      Tower: `/towers/${asset.id}`,
      Rack: `/racks/${asset.id}`,
      Building: `/buildings/${asset.id}`,
      Closure: `/splice-closures/${asset.id}`,
      LCP: `/lcps/${asset.id}`,
      'Fiber Cable': `/fiber-cables/${asset.id}`,
    }
    const endpoint = endpointMap[typeName ?? '']
    if (!endpoint) throw new Error(`Delete not supported for type: ${typeName}`)
    await api.delete(endpoint)
  },

  async fetchAssetModels(manufacturerId?: string) {
    const { data } = await api.get('/reference-data/asset-models', {
      params: manufacturerId ? { manufacturerId } : {},
    })
    return data
  },
}

