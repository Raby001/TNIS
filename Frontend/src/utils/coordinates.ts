export interface Coordinate {
    latitude: number
    longitude: number
}

export function parseCoordinate(
    value: string,
): Coordinate | null {
    const parts = value
        .trim()
        .split(/[,\s]+/)
        .filter(Boolean)

    if (parts.length !== 2) {
        return null
    }

    const latitude = Number(parts[0])
    const longitude = Number(parts[1])

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null
    }

    if (latitude < -90 || latitude > 90) {
        return null
    }

    if (longitude < -180 || longitude > 180) {
        return null
    }

    return {
        latitude,
        longitude,
    }
}