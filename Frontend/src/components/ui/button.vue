<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[sizeClass, appearanceClass]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  size?: string
  appearance?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}>(), { type: 'button', size: 'md', disabled: false })

const sizeClass = computed(() =>
  props.size === 'lg' ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-sm'
)

const appearanceClass = computed(() => {
  if (props.appearance === 'primary') {
    return 'bg-blue-600 text-white hover:bg-blue-700'
  }

  if (props.appearance === 'danger') {
    return 'bg-red-600 text-white hover:bg-red-700'
  }

  if (props.appearance === 'secondary') {
    return 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
  }

  return ''
})
</script>