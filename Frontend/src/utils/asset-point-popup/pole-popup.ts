import type { AssetPoint } from '@/types/asset-point'
import type { PoleFormData } from '@/types/pole'

import {
    createDetailRow,
} from './common-popup'

export const createPolePopupHtml = (
    assetPoint: AssetPoint,
) => {
    const data =
        assetPoint.assetData as PoleFormData

    return `
        ${createDetailRow(
        'Height',
        data.heightM,
    )}

        ${createDetailRow(
        'Material',
        data.material,
    )}

        ${createDetailRow(
        'Owner',
        data.owner,
    )}

        ${createDetailRow(
        'Foundation',
        data.foundation,
    )}
    `
}