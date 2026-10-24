export type SiteType =
  | 'Exchange'
  | 'Tower'
  | 'Cabinet'
  | 'Chamber'
  | 'POP'
  | string

export interface SiteAttachment {
  id?: string
  kind: 'photo' | 'document'
  url: string
  name?: string
}

export interface Site {
    id: string

    code?: string
    name: string

    cityId?: string
    cityName?: string
    provinceId?: string
    provinceName?: string

    city?: {
      id: string
      name: string
      code?: string
      province?: {
        id: string
        name: string
        code?: string
      }
    }

    address: string
    elevation?: number | null
    description?: string

    latitude: number
    longitude: number

    createdAt?: string
    updatedAt?: string

    type?: SiteType
    attachments?: SiteAttachment[]
}

export interface CreateSiteForm {
    name: string
    cityId: string
    address: string
    elevation?: number | null
    description?: string
    latitude: number
    longitude: number

    // Wait for backend
    type?: SiteType
}

export interface SiteDraft {
    name: string
    cityId: string
    address: string
    elevation: number | null
    description: string
    latitude: number
    longitude: number

    // Wait for backend
    type?: SiteType
}

export type SiteFormData = CreateSiteForm

// For Api request/response
export interface CreateSitePayload {
    cityId: string
    name: string
    address: string
    elevation?: number
    description?: string
    type?: string
    geometry: {
        type: 'Point'
        coordinates: [number, number]
    }
}

export interface UpdateSitePayload extends Partial<CreateSitePayload> {}

export interface SiteRecord {
    id: string
    cityId?: string
    provinceId?: string
    name: string
    code: string
    address: string
    elevation?: number
    description?: string
    type?: string
    geometry?: {
        type: 'Point'
        coordinates: [number, number]
    }
    attachments?: SiteAttachment[]
    createdAt?: string
    updatedAt?: string

    city?: {
      id: string
      name: string
      code?: string
      provinceId?: string
      province?: {
        id: string
        name: string
        code?: string
      }
    }
    cityName?: string
    provinceName?: string
}

export interface SiteFilters {
  search?: string
  cityId?: string
  type?: string
  provinceId?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface FetchSitesResult {
  sites: Site[]
  meta: PaginationMeta
}

export interface ConnectableAssetOption {
    id: string
    name: string
    code?: string
    assetTag?: string
    siteId?: string
    siteName: string
    /** Coordinates of the asset itself, used to derive cable endpoint geometry. */
    lat?: number
    lng?: number
}

export interface LocationSite {
    id: string
    name: string
}
