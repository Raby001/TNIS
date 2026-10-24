<template>
  <button
    type="button"
    @click="$emit('click')"
    class="rounded-xl border p-3.5 text-left transition-all duration-200"
    :class="active ? 'border-blue-200 bg-blue-50 shadow-[0_0_0_3px_rgba(59,130,246,0.12)] ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'"
  >
    <span class="flex items-center gap-1.5 text-xs font-medium text-slate-500">
      <span class="h-2 w-2 rounded-full" :class="dotClass" />
      {{ label }}
    </span>
    <span class="font-mono-num mt-2 block text-2xl font-semibold" :class="valueClass">
      {{ value }}
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  active?: boolean
  dotClass?: string
  valueClass?: string
}>()

defineEmits<{ click: [] }>()
</script>