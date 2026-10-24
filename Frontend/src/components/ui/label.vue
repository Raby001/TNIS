<template>
  <label :for="props.for" class="mb-1.5 block text-sm font-medium">
    <slot />
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  for?: string
}>()
</script>