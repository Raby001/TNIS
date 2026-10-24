import { createVNode, render } from 'vue'
import { Building2 } from 'lucide-vue-next'

export const MARKER_SIZE = 18
export const ICON_SIZE = 10

export const createSiteMarkerElement = () => {
    const button = document.createElement('button')

    button.type = 'button'
    button.className = 'asset-point-marker'

    button.setAttribute(
        'aria-label',
        'Site marker',
    )

    button.style.width = `${MARKER_SIZE}px`
    button.style.height = `${MARKER_SIZE}px`
    button.style.backgroundColor = '#10b981'

    const iconContainer = document.createElement('span')

    // Reuse the existing class
    iconContainer.className =
        'asset-point-marker__icon'

    const vnode = createVNode(Building2, {
        size: ICON_SIZE,
        strokeWidth: 2.4,
    })

    render(vnode, iconContainer)

    button.appendChild(iconContainer)

    return button
}
