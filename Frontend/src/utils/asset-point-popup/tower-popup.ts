import type { AssetPoint } from '@/types/asset-point'
import type { TowerFormData } from '@/types/tower'

import {
    createDetailRow,
} from './common-popup'

export const createTowerPopupHtml = (
    assetPoint: AssetPoint,
) => {
    const data =
        assetPoint.assetData as TowerFormData

    return `
        ${createDetailRow(
        'Height',
        data.heightM !== null
            ? `${data.heightM} m`
            : null,
    )}

        ${createDetailRow(
        'Foundation',
        data.foundation,
    )}

        ${createDetailRow(
        'Maximum Load',
        data.maximumLoad,
    )}

        ${createDetailRow(
        'Occupied Space',
        data.occupiedSpace,
    )}

        ${createDetailRow(
        'Available Space',
        data.availableSpace,
    )}

        ${createDetailRow(
        'Owner',
        data.owner,
    )}

        ${createDetailRow(
        'Power',
        data.power,
    )}

        ${createDetailRow(
        'Generator',
        data.generator ? 'Yes' : 'No',
    )}

        ${createDetailRow(
        'Battery',
        data.battery ? 'Yes' : 'No',
    )}

        ${createDetailRow(
        'GPS',
        data.gps ? 'Yes' : 'No',
    )}

        ${createDetailRow(
        'Lease Expiry',
        data.leaseExpiry,
    )}
    `
}