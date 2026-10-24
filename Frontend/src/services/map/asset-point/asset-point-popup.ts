import type { AssetPoint } from '@/types/asset-point'

import {
    createCommonPopupHtml,
} from '@/utils/asset-point-popup/common-popup'
import { createHandholePopupHtml } from '@/utils/asset-point-popup/handhole-popup'
import { createLcpPopupHtml } from '@/utils/asset-point-popup/lcp-popup'
import { createManholePopupHtml } from '@/utils/asset-point-popup/manhole-popup'
import { createNapPopupHtml } from '@/utils/asset-point-popup/nap-popup'
import { createOccPopupHtml } from '@/utils/asset-point-popup/occ-popup'
import { createOnuPopupHtml } from '@/utils/asset-point-popup/onu-popup'
import { createPolePopupHtml } from '@/utils/asset-point-popup/pole-popup'
import { createSpliceClosurePopupHtml } from '@/utils/asset-point-popup/splice-closure-popup'
import { createTowerPopupHtml } from '@/utils/asset-point-popup/tower-popup'

const assetTypeLabels: Record<
    AssetPoint['type'],
    string
> = {
    tower: 'Tower',
    closure: 'Closure',
    manhole: 'Manhole',
    handhole: 'Handhole',
    nap: 'NAP',
    onu: 'ONU',
    pole: 'POLE',
    occ: 'OCC',
    lcp: 'LCP'
}

export interface AssetPointPopupOptions {
    showActions?: boolean
}

export const createAssetPointPopupHtml = (
    assetPoint: AssetPoint,
    options: AssetPointPopupOptions = {},
) => {
    let specificHtml = ''

    switch (assetPoint.type) {
        case 'tower':
            specificHtml = createTowerPopupHtml(
                assetPoint,
            )
            break

        case 'closure':
            specificHtml = createSpliceClosurePopupHtml(
                assetPoint,
            )
            break

        case 'manhole':
            specificHtml = createManholePopupHtml(
                assetPoint,
            )
            break

        case 'handhole':
            specificHtml = createHandholePopupHtml(
                assetPoint,
            )
            break

        case 'nap':
            specificHtml = createNapPopupHtml(
                assetPoint,
            )
            break

        case 'pole':
            specificHtml = createPolePopupHtml(
                assetPoint,
            )
            break

        case 'onu':
            specificHtml = createOnuPopupHtml(
                assetPoint,
            )
            break

        case 'occ':
            specificHtml = createOccPopupHtml(
                assetPoint,
            )
            break

        case 'lcp':
            specificHtml = createLcpPopupHtml(
                assetPoint,
            )
            break

    }

    return createCommonPopupHtml(
        assetPoint,
        assetTypeLabels[assetPoint.type],
        specificHtml,
        options,
    )
}
