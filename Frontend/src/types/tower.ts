import type { CreateAssetRequest } from './asset'

export interface TowerDetail extends CreateAssetRequest {
    heightM: number | null
    foundation: string
    maximumLoad: number | null
    occupiedSpace: number | null
    availableSpace: number | null
    owner: string
    power: string
    generator: boolean
    battery: boolean
    gps: boolean
    leaseExpiry: string | null
}

export interface TowerFormData {
    heightM: number | null
    foundation: string
    maximumLoad: number | null
    occupiedSpace: number | null
    availableSpace: number | null
    owner: string
    power: string
    generator: boolean
    battery: boolean
    gps: boolean
    leaseExpiry: string | null
}

export interface CreateTowerRequest
    extends CreateAssetRequest {
    heightM: number | null
    foundation: string
    maximumLoad: number | null
    occupiedSpace: number | null
    availableSpace: number | null
    owner: string
    power: string
    generator: boolean
    battery: boolean
    gps: boolean
    leaseExpiry: string | null
}

export interface CreateTowerRequest extends CreateAssetRequest {
  heightM: number | null
  foundation: string
  maximumLoad: number | null
  occupiedSpace: number | null
  availableSpace: number | null
  owner: string
  power: string
  generator: boolean
  battery: boolean
  gps: boolean
  leaseExpiry: string | null
}

export type UpdateTowerRequest = Partial<
  Omit<CreateTowerRequest, 'assetTypeId' | 'siteId' | 'code'>
> & {
  geometry?: {
    type: 'Point'
    coordinates: [number, number]
  }
}