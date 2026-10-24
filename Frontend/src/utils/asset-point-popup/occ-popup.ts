import type { AssetPoint } from '@/types/asset-point'
import type { OccFormData } from '@/types/occ'

import {
    createDetailRow,
} from './common-popup'

export const createOccPopupHtml = (
    assetPoint: AssetPoint,
) => {
    const data =
        assetPoint.assetData as OccFormData

    return `
    ${createDetailRow(
        'Total Ports',
        data.portCount,
    )}
  `
}