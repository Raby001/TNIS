import type { AssetPointType } from '@/types/asset-point'

export const getAssetPointColor = (
    type: AssetPointType,
) => {
    switch (type) {
        case 'tower':
            return '#03715b'

        case 'closure':
            return '#f59e0b'

        case 'manhole':
            return '#64748b'

        case 'handhole':
            return '#282626'

        case 'nap':
            return '#2563eb'

        case 'onu':
            return '#b20ab8'

        case 'pole':
            return '#4d0438'

        case 'occ':
            return '#f34d0b'

        case 'lcp':
            return '#b00a1d'
    }
}