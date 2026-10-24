import {
    CircleDot,
    Share2,
    Network,
    RadioTower,
    Square,
    HouseWifi,
    UtilityPole,
    ServerCog,
    Split
} from 'lucide-vue-next'

import type { AssetPointType } from '@/types/asset-point'

export const getAssetPointIcon = (
    type: AssetPointType,
) => {
    switch (type) {
        case 'tower':
            return RadioTower

        case 'closure':
            return Share2

        case 'manhole':
            return CircleDot

        case 'handhole':
            return Square

        case 'nap':
            return Network

        case 'onu':
            return HouseWifi

        case 'pole':
            return UtilityPole

        case 'occ':
            return ServerCog

        case 'lcp':
            return Split
    }
}