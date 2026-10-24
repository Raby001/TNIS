import type { AssetPoint } from '@/types/asset-point'
import type { HandholeFormData } from '@/types/handhole'

import {
    createDetailRow,
} from './common-popup'

export const createHandholePopupHtml = (
    assetPoint: AssetPoint,
) => {
    const data =
        assetPoint.assetData as HandholeFormData

    return `
        ${createDetailRow(
        'Size',
        data.size,
    )}

        ${createDetailRow(
        'Material',
        data.material,
    )}

        ${createDetailRow(
        'Cover Type',
        data.coverType,
    )}
    `
}