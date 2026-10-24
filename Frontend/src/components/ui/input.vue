<template>
  <input
    :id="id"
    :type="type"
    :autocomplete="autocomplete"
    :placeholder="placeholder"
    :value="modelValue ?? ''"
    @input="onInput"
    :class="[
      'w-full border px-3 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed',
      variant === 'asset'
        ? 'rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
        : 'rounded-lg',
    ]"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  id?: string
  type?: string
  autocomplete?: string
  placeholder?: string
  modelValue?: string | number | null
  variant?: 'default' | 'asset'
  modelModifiers?: {
    number?: boolean
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', props.modelModifiers?.number ? (value === '' ? null : Number(value)) : value)
}

</script>