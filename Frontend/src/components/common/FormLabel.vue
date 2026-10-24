<template>
  <label
    :for="forId"
    class="mb-1.5 block text-xs font-semibold text-slate-600"
  >
    {{ label }}

    <span
      v-if="required"
      class="ml-0.5 text-red-500"
      aria-hidden="true"
    >
      *
    </span>

    <span
      v-else-if="optional"
      class="ml-1 font-normal text-slate-400"
    >
      (optional)
    </span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  label: string
  forId?: string
  required?: boolean
  optional?: boolean
}

withDefaults(defineProps<Props>(), {
  forId: undefined,
  required: false,
  optional: false,
})
</script>