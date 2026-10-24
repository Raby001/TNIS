<template>
  <div
    class="flex items-center justify-center overflow-hidden rounded-full bg-slate-900 font-semibold text-white"
    :class="sizeClass"
  >
    <img
      v-if="photo"
      :src="photo"
      alt="User avatar"
      class="h-full w-full object-cover"
    />

    <span v-else class="text-center leading-none">
      {{ initials }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name?: string
  photo?: string | null
  size?: 'sm' | 'md' | 'lg'
}>()

const initials = computed(() => {
  const value = (props.name || 'Guest User').trim()
  const parts = value.split(/\s+/).filter(Boolean)

  if (!parts.length) return 'GU'

  const first = parts[0]?.[0] ?? ''
  if (parts.length === 1) return `${first}${first}`.slice(0, 2).toUpperCase() || 'GU'

  const second = parts[1]?.[0] ?? ''
  return `${first}${second}`.toUpperCase() || 'GU'
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'h-8 w-8 text-[11px]'
    case 'md': return 'h-12 w-12 text-sm'
    case 'lg': return 'h-16 w-16 text-lg'
    default: return 'h-8 w-8 text-[11px]'
  }
})
</script>