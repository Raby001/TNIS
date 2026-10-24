import { createVNode, render } from 'vue'
import { getAssetPointIcon } from './asset-point-icons'
import { getAssetPointColor } from './asset-point-colors'

import type { AssetPointType } from '@/types/asset-point'

export const MARKER_SIZE = 18
export const ICON_SIZE = 10

export const createAssetPointMarkerElement = (
    type: AssetPointType,
) => {
    const button = document.createElement('button')

    button.type = 'button'
    button.className = 'asset-point-marker'

    button.setAttribute(
        'aria-label',
        `${type} marker`,
    )

    button.style.width = `${MARKER_SIZE}px`
    button.style.height = `${MARKER_SIZE}px`
    button.style.backgroundColor =
        getAssetPointColor(type)

    const iconContainer =
        document.createElement('span')

    iconContainer.className =
        'asset-point-marker__icon'

    const Icon = getAssetPointIcon(type)

    const vnode = createVNode(Icon, {
        size: ICON_SIZE,
        strokeWidth: 2.4,
    })

    render(vnode, iconContainer)

    button.appendChild(iconContainer)

    return button
}