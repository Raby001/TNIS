<template>
  <textarea
    :id="id"
    :rows="rows"
    :placeholder="placeholder"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    class="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500/30"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    id?: string
    modelValue?: string
    placeholder?: string
    rows?: number
  }>(),
  { rows: 3 }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>