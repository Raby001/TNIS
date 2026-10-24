import type { AssetPoint } from '@/types/asset-point'
import type { SpliceClosureFormData } from '@/types/splice-closure'

import {
    createDetailRow,
} from './common-popup'

export const createSpliceClosurePopupHtml = (
    assetPoint: AssetPoint,
) => {
    const data =
        assetPoint.assetData as SpliceClosureFormData

    return `
        ${createDetailRow(
        'Closure Type',
        data.closureType,
    )}

        ${createDetailRow(
        'Capacity',
        data.capacity,
    )}
    `
}