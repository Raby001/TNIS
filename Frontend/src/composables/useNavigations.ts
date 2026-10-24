import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { navigation } from '@/constants/navigation'
import type { MenuItem } from '@/types/navigation'

export function useNavigation() {
    const route = useRoute()

    const isActive = (item: MenuItem) => {
        if (item.exact) {
            return route.path === item.to
        }

        return route.path.startsWith(item.to)
    }

    const currentNavigationItem = computed(() => {
        for (const item of navigation) {
            const child = item.children?.find((childItem) => isActive(childItem))
            if (child) return child
            if (isActive(item)) return item
        }

        return undefined
    })

    const pageTitle = computed(() => {
        return currentNavigationItem.value?.name
    })

    const pageDescription = computed(() => {
        return currentNavigationItem.value?.description ?? ''
    })

    const pageShowsSearch = computed(() => {
        return currentNavigationItem.value?.showSearch ?? false
    })

    return {
        navigation,
        isActive,
        pageTitle,
        pageDescription,
        pageShowsSearch,
    }
}