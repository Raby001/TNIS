import type { AssetPoint } from '@/types/asset-point'
import type { LcpFormData } from '@/types/lcp'

import {
    createDetailRow,
} from './common-popup'

export const createLcpPopupHtml = (
    assetPoint: AssetPoint,
) => {
    const data =
        assetPoint.assetData as LcpFormData

    return `
        ${createDetailRow(
        'Splitter Capacity',
        data.splitterCapacity
    )}
    `
}