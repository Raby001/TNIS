<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
    :class="[colorClasses[color] ?? colorClasses.slate, size === 'sm' ? 'text-[11px]' : '']"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    color?: 'green' | 'amber' | 'red' | 'blue' | 'slate' | 'purple' | 'teal'
    size?: 'sm' | 'md'
  }>(),
  { color: 'slate', size: 'md' }
)

const colorClasses: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700',
  slate: 'bg-slate-100 text-slate-600',
  purple: 'bg-purple-50 text-purple-700',
  teal: 'bg-teal-50 text-teal-700',
}
</script>