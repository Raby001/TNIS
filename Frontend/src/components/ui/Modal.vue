<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[4000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/50" @click="$emit('close')" />
        <div class="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" :class="widthClass">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
            <p v-if="description" class="mt-1 text-sm text-slate-500">{{ description }}</p>
          </div>

          <div class="max-h-[70vh] overflow-y-auto pr-1">
            <slot />
          </div>

          <div v-if="$slots.footer" class="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    widthClass?: string
  }>(),
  { widthClass: 'max-w-lg' }
)

defineEmits<{ close: [] }>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>