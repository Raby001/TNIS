import type { AssetPoint } from '@/types/asset-point'
import type { OnuAssetData } from '@/types/onu'

import {
    createDetailRow,
} from './common-popup'

export const createOnuPopupHtml = (
    assetPoint: AssetPoint,
) => {
    const data =
        assetPoint.assetData as OnuAssetData

    return `
        ${createDetailRow(
        'ONU MAC Address',
        data.macAddressONU ?? 'N/A',
    )}

        ${createDetailRow(
        'Router MAC Address',
        data.macAddressRouter ?? 'N/A',
    )}

        ${createDetailRow(
        'PON Type',
        data.ponType ?? 'N/A',
    )}

        ${createDetailRow(
        'Download Speed',
        data.downloadSpeedMbps != null
            ? `${data.downloadSpeedMbps} Mbps`
            : 'N/A',
    )}

        ${createDetailRow(
        'Upload Speed',
        data.uploadSpeedMbps != null
            ? `${data.uploadSpeedMbps} Mbps`
            : 'N/A',
    )}

        ${createDetailRow(
        'Data Allowance',
        data.dataAllowanceGb != null
            ? `${data.dataAllowanceGb} GB`
            : 'N/A',
    )}

        ${createDetailRow(
        'Customer',
        data.customerName ?? 'N/A',
    )}

        ${createDetailRow(
        'Phone',
        data.customerPhone ?? 'N/A',
    )}
    `
}