<template>
  <select
    :id="id"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    :class="variant === 'asset'
      ? 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
      : 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500/30'"
  >
    <slot />
  </select>
</template>

<script setup lang="ts">
defineProps<{
  id?: string
  modelValue?: string
  variant?: 'default' | 'asset'
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>