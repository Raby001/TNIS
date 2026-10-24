export interface CreateFieldObservationPayload {
    name: string
    description: string
    geometry: {
        type: 'Point'
        coordinates: [number, number]
    }
}

export type FieldObservationStatus =
    | 'OPEN'
    | 'CONVERTED'
    | 'CANCELLED'

export interface FieldObservation {
    id: string
    name: string
    description: string
    status: FieldObservationStatus | string
    latitude: number
    longitude: number
    createdAt?: string
    updatedAt?: string
}

export interface ConvertFieldObservationPayload {
    assetTypeId: string
    details: Record<string, unknown>
}