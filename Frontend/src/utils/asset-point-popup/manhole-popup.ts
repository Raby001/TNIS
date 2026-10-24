import type { AssetPoint } from '@/types/asset-point'
import type { ManholeFormData } from '@/types/manhole'

import {
    createDetailRow,
} from './common-popup'

export const createManholePopupHtml = (
    assetPoint: AssetPoint,
) => {
    const data =
        assetPoint.assetData as ManholeFormData

    return `
        ${createDetailRow(
        'Depth',
        data.depthM,
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