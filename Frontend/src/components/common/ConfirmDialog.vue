<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[11000] flex items-center justify-center p-4"
    >
      <!-- Overlay -->
      <button
        type="button"
        aria-label="Close confirmation dialog"
        class="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
        :disabled="loading"
        @click="cancel"
      />

      <!-- Dialog -->
      <section
        class="relative z-[11001] w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
      >
        <div class="p-5">
          <!-- Icon -->
          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600"
          >
            <TriangleAlert :size="21" />
          </div>

          <!-- Content -->
          <div class="mt-4">
            <h2 class="text-base font-semibold text-slate-900">
              {{ title }}
            </h2>

            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{ message }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4"
        >
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
            @click="cancel"
          >
            {{ cancelText }}
          </button>

          <button
            type="button"
            class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
            @click="confirm"
          >
            {{ loading ? loadingText : confirmText }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'

interface Props {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  loadingText?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Are you sure?',
  message: 'This action cannot be undone.',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loading: false,
  loadingText: 'Processing...',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
}
</script>
