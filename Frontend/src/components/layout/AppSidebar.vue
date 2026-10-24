<template>
  <aside
    class="fixed bottom-0 left-0 top-14 z-40 flex w-64 flex-col overflow-hidden border-r border-slate-800 bg-slate-950 text-slate-200 transition-transform duration-200 md:top-16 xl:static xl:inset-y-auto xl:z-auto xl:h-full xl:translate-x-0"
    :class="sidebarClass"
  >
    <!-- Sidebar header -->
    <div
      class="flex shrink-0 items-start justify-between gap-3 border-b border-slate-800 px-4 py-4"
    >
      <div class="min-w-0">
        <h1 class="truncate text-lg font-semibold text-white">
          Telecom Cambodia . TNI
        </h1>

        <p class="mt-1 truncate text-xs text-slate-400">
          Compact Telecom Network Inventory
        </p>
      </div>

      <!-- Close button on tablet/mobile -->
      <button
        type="button"
        aria-label="Close navigation sidebar"
        class="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white xl:hidden"
        @click="mapStore.setSidebarOpen(false)"
      >
        <X :size="16" />
      </button>
    </div>

    <nav class="flex-1 space-y-1 p-3">
      <div v-for="item in visibleNavigation" :key="item.name">
        <!-- Item with children (Data Management) -->
        <template v-if="item.children?.length">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200"
            :class="
              isParentActive(item)
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            "
            @click="toggleGroup(item.name)"
          >
            <component :is="item.icon" :size="18" />
            <span class="flex-1 text-sm font-medium">{{ item.name }}</span>
            <ChevronDown
              :size="16"
              class="transition-transform duration-200"
              :class="openGroups[item.name] ? 'rotate-180' : ''"
            />
          </button>

          <!-- Children -->
          <div
            v-show="openGroups[item.name]"
            class="mt-1 space-y-1 pl-4"
          >
            <RouterLink
              v-for="child in item.children"
              :key="child.name"
              :to="child.to"
              custom
              v-slot="{ navigate }"
            >
              <button
                type="button"
                @click="onNavigate(navigate)"
                :class="[
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all duration-200',
                  isActive(child)
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white',
                ]"
              >
                <component :is="child.icon" :size="16" />
                <span>{{ child.name }}</span>
              </button>
            </RouterLink>
          </div>
        </template>

        <!-- Normal item (no children) -->
        <RouterLink
          v-else
          :to="item.to"
          custom
          v-slot="{ navigate }"
        >
          <button
            type="button"
            @click="onNavigate(navigate)"
            :class="[
              'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200',
              isActive(item)
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white',
            ]"
          >
            <component :is="item.icon" :size="18" />
            <span class="text-sm font-medium">{{ item.name }}</span>
          </button>
        </RouterLink>
      </div>
    </nav>

    <!-- Sidebar footer -->
    <div class="shrink-0 border-t border-slate-800 p-3">
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
        @click="handleSignOut"
      >
        <LogOutIcon class="h-4 w-4 shrink-0" />

        <span>Sign out</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { 
  computed,
  reactive 
} from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ChevronDown, X, LogOutIcon } from 'lucide-vue-next'

import { navigation as allNavigation } from '@/constants/navigation'
import { canAccessRoute } from '@/constants/route-permissions'
import { useNavigation } from '@/composables/useNavigations'
import { useMapStore } from '@/stores/map.store'
import { useAuthStore } from '../../stores/auth'

const mapStore = useMapStore()
const { sidebarOpen } = storeToRefs(mapStore)

const auth = useAuthStore()
const { logout } = auth
const router = useRouter()
const openGroups = reactive<Record<string, boolean>>({})

const { isActive } = useNavigation()

const visibleNavigation = computed(() =>
  allNavigation
    .map((item) => {
      if (item.children?.length) {
        const children = item.children.filter((child) => {
          if (child.showInSidebar === false) return false
          return canAccessRoute(child.to, auth)
        })
       
        if (!children.length) return null

        return {
          ...item,
          children,
        }
      }

      if (item.showInSidebar === false) return null
      return canAccessRoute(item.to, auth) ? item : null
    })
    .filter(Boolean) as typeof allNavigation,
)

const onNavigate = (navigate: () => void) => {
  navigate()
  mapStore.setSidebarOpen(false)
}

const handleSignOut = async () => {
  // Clears locally first, then revokes the refresh token server-side.
  await logout()
  router.push('/login')
}

function toggleGroup(name: string) {
  openGroups[name] = !openGroups[name]
}

function isParentActive(item: Parameters<typeof isActive>[0]) {
  return isActive(item) || item.children?.some((child) => isActive(child)) || false
}

const sidebarClass = computed(() => (sidebarOpen.value ? 'translate-x-0' : '-translate-x-full'))
</script>
