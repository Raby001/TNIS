import api from './api'
import type {
  CreateSitePayload,
  UpdateSitePayload,
  SiteRecord,
  SiteFilters,
  FetchSitesResult,
  Site,
  ConnectableAssetOption
} from '@/types/site'

function mapRecordToSite(record: SiteRecord): Site {
  const coordinates = Array.isArray(record.geometry?.coordinates) ? record.geometry.coordinates : [0, 0]
  const [longitude, latitude] = coordinates

  return {
    id: record.id,
    code: record.code,
    name: record.name,
    cityId: record.cityId ?? record.city?.id,
    cityName: record.city?.name ?? record.cityName ?? undefined,
    provinceId: record.city?.province?.id ?? record.provinceId,
    provinceName: record.city?.province?.name ?? record.provinceName ?? undefined,
    city: record.city,
    address: record.address,
    elevation: record.elevation ?? null,
    description: record.description,
    latitude: Number(latitude ?? 0),
    longitude: Number(longitude ?? 0),
    type: record.type,
    attachments: record.attachments ?? [],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export const sitesApi = {
  create(payload: CreateSitePayload) {
    return api.post<SiteRecord>(
      '/sites',
      payload,
    )
  },

  getAllSitesFilter() {
    return api.get<SiteRecord[]>(
      '/sites/map',
    )
  },

  async getAllSites() {
    const response = await api.get('/sites')
    const raw = (response as any).data ?? response
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.sites)
          ? raw.sites
          : []

    return { data: list }
  },

  async getAllPaginated(filters: SiteFilters = {}): Promise<FetchSitesResult> {
    const response = await api.get('/sites', {
      params: {
        search: filters.search || undefined,
        cityId: filters.cityId || undefined,
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        sortBy: filters.sortBy || undefined,
        sortOrder: filters.sortOrder || undefined,
      },
    })

    const raw = (response as any).data ?? response

    // Handle both array and paginated response shapes
    let list: any[] = []
    let meta = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      total: 0,
      totalPages: 1,
    }

    if (Array.isArray(raw)) {
      list = raw
      meta.total = raw.length
      meta.totalPages = 1
    } else if (raw?.data && Array.isArray(raw.data)) {
      list = raw.data
      meta = {
        page: raw.meta?.page ?? meta.page,
        limit: raw.meta?.limit ?? meta.limit,
        total: raw.meta?.total ?? raw.data.length,
        totalPages: raw.meta?.totalPages ?? 1,
      }
    } else if (Array.isArray(raw?.sites)) {
      list = raw.sites
      meta = raw.meta ?? meta
    }

    return {
      sites: list.map(mapRecordToSite),
      meta,
    }
  },

  getById(id: string) {
    return api.get<SiteRecord>(`/sites/${id}`)
  },

  update(id: string, payload: UpdateSitePayload) {
    return api.patch<SiteRecord>(`/sites/${id}`, payload)
  },

  delete(id: string) {
    return api.delete(`/sites/${id}`)
  },

  getFiberEndpoints(siteId: string) {
    return api.get(`/sites/${siteId}/fiber-endpoints`)
  },
}

// This section is for fetching connectable assets from multiple sites and mapping them to ConnectableAssetOption format
function mapFiberEndpointRows(
  rows: any[],
  siteName: string,
  siteId: string,
): ConnectableAssetOption[] {
  return (rows ?? []).map((r) => {
    const a = r.asset ?? r
    return {
      id: a.id,
      name: a.name ?? a.code ?? '—',
      code: a.code,
      assetTag: a.assetTag ?? a.asset_tag,
      siteId: a.siteId ?? a.site_id ?? siteId,
      siteName,
    }
  })
}

// Fiber cable endpoints are ordinary Point assets (towers, manholes, closures,
// poles...). `/sites/{id}/fiber-endpoints` is not the right source for the
// asset form, so we read from `/assets` and keep the Point-geometry ones.
export async function fetchAllPointAssets(
  excludeAssetId?: string,
): Promise<ConnectableAssetOption[]> {
  const options: ConnectableAssetOption[] = []
  const seen = new Set<string>()

  let page = 1
  let totalPages = 1

  do {
    const res = await api.get<{ data: any[]; meta?: any }>('/assets', {
      params: { page, limit: 100 },
    })

    const rows = res.data?.data ?? []
    totalPages = res.data?.meta?.totalPages ?? 1

    for (const r of rows) {
      const a = r.asset ?? r
      if (!a?.id || seen.has(a.id)) continue
      if (excludeAssetId && a.id === excludeAssetId) continue
      if (a.geometry?.type && a.geometry.type !== 'Point') continue

      seen.add(a.id)

      // GeoJSON stores [longitude, latitude].
      const coords = a.geometry?.coordinates
      const lng = Array.isArray(coords) ? Number(coords[0]) : undefined
      const lat = Array.isArray(coords) ? Number(coords[1]) : undefined

      options.push({
        id: a.id,
        name: a.name ?? a.code ?? '—',
        code: a.code,
        assetTag: a.assetTag ?? a.asset_tag,
        siteId: a.siteId ?? a.site_id,
        siteName: a.site?.name ?? '',
        lat: Number.isFinite(lat) ? lat : undefined,
        lng: Number.isFinite(lng) ? lng : undefined,
      })
    }

    page += 1
  } while (page <= totalPages)

  return options.sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchAllConnectableAssets(
  sites: { id: string; name: string }[],
  excludeAssetId?: string,
): Promise<ConnectableAssetOption[]> {
  const chunks = await Promise.all(
    sites.map(async (s) => {
      try {
        const res = await api.get(`/sites/${s.id}/fiber-endpoints`)
        const rows = (res as any).data ?? res
        return mapFiberEndpointRows(
          Array.isArray(rows) ? rows : [],
          s.name,
          s.id,
        )
      } catch {
        return [] as ConnectableAssetOption[]
      }
    }),
  )

  const map = new Map<string, ConnectableAssetOption>()
  for (const item of chunks.flat()) {
    if (item.id && !map.has(item.id)) map.set(item.id, item)
  }
  if (excludeAssetId) map.delete(excludeAssetId)

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}
