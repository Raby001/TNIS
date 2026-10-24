<template>
  <div class="relative" data-user-menu>
    <button
      type="button"
      class="flex items-center gap-2.5 rounded-lg border border-slate-200 py-1.5 pl-2 pr-2.5 transition hover:bg-slate-50"
      @click="toggleMenu"
    >
      <UserAvatar :name="displayName" :size="'sm'" />

      <span class="hidden text-left leading-tight xl:block">
        <span class="block whitespace-nowrap text-xs font-semibold text-slate-900">
          {{ displayName }}
        </span>
        <span
          class="mt-0.5 inline-block rounded px-1.5 text-[10px] font-medium ring-1 ring-inset"
          :class="roleInfo.chip"
        >
          {{ roleInfo.label }}
        </span>
      </span>

      <ChevronsUpDown :size="14" class="hidden text-slate-400 xl:block" />
    </button>

    <div
      v-if="isMenuOpen"
      class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-900/10"
    >
      <button
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
        @click="goToProfile"
      >
        <UserRound :size="16" class="text-slate-500" />
        Profile
      </button>

      <button
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
        @click="goToSettings"
      >
        <Settings :size="16" class="text-slate-500" />
        Settings
      </button>

      <div class="my-1 border-t border-slate-100" />

      <button
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
        @click="handleLogout"
      >
        <LogOut :size="16" />
        Sign out
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronsUpDown, LogOut, Settings, UserRound } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { roleMeta, type Role } from '@/utils/roleMeta'
import UserAvatar from '@/components/ui/userAvatar.vue'

const auth = useAuthStore()
const router = useRouter()
const isMenuOpen = ref(false)

const displayName = computed(() => auth.user?.fullName?.trim() || 'Guest User')

const roleInfo = computed(() => {
  const role = auth.user?.roleName as Role | undefined
  return role && roleMeta[role] ? roleMeta[role] : { label: 'Guest', chip: 'bg-slate-100 text-slate-600 ring-slate-200' }
})

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function goToProfile() {
  closeMenu()
  router.push({ name: 'profile' })
}

function goToSettings() {
  closeMenu()
  router.push('/app/settings') 
}

async function handleLogout() {
  closeMenu()
  // `logout()` clears the session locally before it calls the network, so the
  // user is already signed out by the time we navigate.
  await auth.logout()
  router.push('/login')
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target) return

  const wrapper = target.closest('[data-user-menu]')
  if (!wrapper) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
