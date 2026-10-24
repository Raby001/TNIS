import type {
    CableMarker,
    CableMarkerType,
    CableOverlayMarkerType,
    ProjectedPoint,
} from '@/types/cable-overlay'

export const MARKER_SPACING = 32

export const ANIMATED_MARKER_COUNT = 12

export const ANIMATED_MARKER_DURATION = 8

export const distanceToSegment = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
): number => {
    const dx = x2 - x1
    const dy = y2 - y1

    if (dx === 0 && dy === 0) {
        return Math.hypot(
            px - x1,
            py - y1,
        )
    }

    const t = Math.max(
        0,
        Math.min(
            1,
            (
                (px - x1) * dx +
                (py - y1) * dy
            ) /
            (dx * dx + dy * dy),
        ),
    )

    const closestX = x1 + t * dx
    const closestY = y1 + t * dy

    return Math.hypot(
        px - closestX,
        py - closestY,
    )
}

export const getPolylineLength = (
    points: ProjectedPoint[],
): number => {
    let totalLength = 0

    for (
        let index = 1;
        index < points.length;
        index++
    ) {
        const previous = points[index - 1]
        const current = points[index]

        if (!previous || !current) {
            continue
        }

        totalLength += Math.hypot(
            current.x - previous.x,
            current.y - previous.y,
        )
    }

    return totalLength
}

export const getPointAtDistance = (
    points: ProjectedPoint[],
    distance: number,
): {
    x: number
    y: number
    angle: number
} | null => {
    if (points.length < 2) {
        return null
    }

    let travelled = 0

    for (
        let index = 1;
        index < points.length;
        index++
    ) {
        const previous = points[index - 1]
        const current = points[index]

        if (!previous || !current) {
            continue
        }

        const dx = current.x - previous.x
        const dy = current.y - previous.y

        const segmentLength = Math.hypot(
            dx,
            dy,
        )

        if (segmentLength === 0) {
            continue
        }

        if (
            travelled + segmentLength >= distance
        ) {
            const ratio =
                (distance - travelled) /
                segmentLength

            return {
                x: previous.x + dx * ratio,
                y: previous.y + dy * ratio,
                angle:
                    Math.atan2(dy, dx) *
                    (180 / Math.PI),
            }
        }

        travelled += segmentLength
    }

    const last = points[points.length - 1]
    const previous = points[points.length - 2]

    if (!last || !previous) {
        return null
    }

    return {
        x: last.x,
        y: last.y,
        angle:
            Math.atan2(
                last.y - previous.y,
                last.x - previous.x,
            ) *
            (180 / Math.PI),
    }
}

export const createCableMarkers = (
    cableId: string,
    markerIdPrefix: string,
    color: string,
    markerType: CableOverlayMarkerType,
    points: ProjectedPoint[],
): CableMarker[] => {
    if (
        markerType === 'none' ||
        points.length < 2
    ) {
        return []
    }

    const totalLength = getPolylineLength(points)

    if (totalLength < MARKER_SPACING) {
        return []
    }

    const markers: CableMarker[] = []

    for (
        let distance = MARKER_SPACING / 2;
        distance < totalLength;
        distance += MARKER_SPACING
    ) {
        const position = getPointAtDistance(
            points,
            distance,
        )

        if (!position) {
            continue
        }

        const markerTypeValue: CableMarkerType =
            markerType

        markers.push({
            id: `${markerIdPrefix}-marker-${distance}`,
            cableId,
            x: position.x,
            y: position.y,
            angle: position.angle,
            color,
            type: markerTypeValue,
        })
    }

    return markers
}

export const getTrianglePoints = (
    marker: CableMarker,
): string => {
    const angle =
        (marker.angle * Math.PI) / 180

    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    const trianglePoints = [
        { x: 0, y: -6 },
        { x: -5, y: 5 },
        { x: 5, y: 5 },
    ]

    return trianglePoints
        .map((point) => {
            const x =
                marker.x +
                point.x * cos -
                point.y * sin

            const y =
                marker.y +
                point.x * sin +
                point.y * cos

            return `${x},${y}`
        })
        .join(' ')
}