import type {
    CableCoreCount,
    CableLineType,
} from '@/types/cable'

export const CABLE_CORE_OPTIONS: Array<{
    value: CableCoreCount
    label: string
    color: string
}> = [
        { value: '1C', label: '1C', color: '#f0ff65' },
        { value: '2C', label: '2C', color: '#E53935' },
        { value: '4C', label: '4C', color: '#1E88E5' },
        { value: '8C', label: '8C', color: '#43A047' },
        { value: '12C', label: '12C', color: '#FB8C00' },
        { value: '24C', label: '24C', color: '#8E24AA' },
        { value: '48C', label: '48C', color: '#00897B' },
        { value: '96C', label: '96C', color: '#6D4C41' },
    ]

const CABLE_CORE_COLORS: Record<
    CableCoreCount,
    string
> = Object.fromEntries(
    CABLE_CORE_OPTIONS.map((option) => [
        option.value,
        option.color,
    ]),
) as Record<CableCoreCount, string>

export const getCableColor = (
    coreCount: CableCoreCount,
) => {
    return (
        CABLE_CORE_COLORS[coreCount] ??
        '#ef4444'
    )
}

export const getCableLineLabel = (
    lineType: CableLineType,
) => {
    return lineType === 'Direct-Buried'
        ? 'Direct-Buried'
        : 'Aerial'
}

export type CableInstallationLineStyle =
    | 'solid'
    | 'dashed'
    | 'dotted'
    | 'dashdot'

export type CableInstallationMarker =
    | 'none'
    | 'triangle'
    | 'square'

const normalizeCableStyle = (
    lineStyle?: string | null,
) => {
    return lineStyle
        ?.trim()
        .toLowerCase()
        .replace(/[\s_-]/g, '')
}

export const getCableLineDash = (
    lineStyle?: string | null,
): string | undefined => {
    const normalized = normalizeCableStyle(lineStyle)

    switch (normalized) {
        case 'dashed':
            return '10 8'

        case 'dotted':
            return '2 7'

        case 'dashdot':
            return '10 6 2 6'

        case 'solid':
        case 'aerial':
        case 'directburied':
        case 'conduit':
        default:
            return undefined
    }
}

export const getCableInstallationMarker = (
    lineStyle?: string | null,
): CableInstallationMarker => {
    const normalized = normalizeCableStyle(lineStyle)

    switch (normalized) {
        case 'directburied':
            return 'triangle'

        case 'conduit':
            return 'square'

        case 'aerial':
        case 'solid':
        case 'dashed':
        case 'dotted':
        case 'dashdot':
        default:
            return 'none'
    }
}

export const getCableInstallationDash = (
    lineStyle?: string | null,
): string | undefined => {
    return getCableLineDash(lineStyle)
}

export const getCableSeedOffset = (
    coreCount: CableCoreCount,
) => {
    switch (coreCount) {
        case '2C':
            return 0.1

        case '4C':
            return 0.12

        case '8C':
            return 0.14

        case '12C':
            return 0.16

        case '24C':
            return 0.18

        case '48C':
            return 0.2

        case '96C':
            return 0.22

        default:
            return 0.12
    }
}