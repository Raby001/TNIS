export type CableOverlayMarkerType =
    | 'none'
    | 'triangle'
    | 'square'

export type CableMarkerType = Exclude<
    CableOverlayMarkerType,
    'none'
>

export type ProjectedPoint = {
    id: string
    x: number
    y: number
}

export type CablePath = {
    id: string
    cableId: string

    d: string
    color: string

    dashArray?: string

    markerType: CableOverlayMarkerType

    projectedPoints: ProjectedPoint[]

    lineStyle: string

    isSegment: boolean
}

export type CableMarker = {
    id: string
    cableId: string
    x: number
    y: number
    angle: number
    color: string
    type: CableMarkerType
}