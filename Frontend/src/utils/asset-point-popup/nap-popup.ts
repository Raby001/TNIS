import type { AssetPoint } from '@/types/asset-point'
import type { NapFormData } from '@/types/nap'

import {
    createDetailRow,
} from './common-popup'

export const createNapPopupHtml = (
    assetPoint: AssetPoint,
) => {
    const data =
        assetPoint.assetData as NapFormData

    return `
        ${createDetailRow(
        'Capacity',
        data.capacity
    )}
    `
}