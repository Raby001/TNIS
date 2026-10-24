<template>
  <Modal
    :open="open"
    title="Void / Data Entry Error"
    :description="asset ? `Asset: ${asset.name}` : ''"
    width-class="max-w-md"
    @close="$emit('close')"
  >
    <div v-if="asset" class="space-y-4 text-left">
      <!-- Supported types -->
      <template v-if="canDelete">
        <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p class="font-medium">This action cannot be undone.</p>
          <p class="mt-1">
            The asset record will be permanently deleted because it was created by mistake.
          </p>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Reason <span class="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            v-model="reason"
            rows="3"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/30"
            placeholder="e.g. Duplicate entry, wrong data, test record..."
          />
        </div>
      </template>

      <!-- Unsupported types -->
      <template v-else>
        <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p class="font-medium">Deletion not supported yet</p>
          <p class="mt-1">
            <strong>{{ asset.assetType?.name }}</strong> cannot be deleted at the moment.
            Please contact the system administrator or wait for backend support.
          </p>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button appearance="secondary" @click="$emit('close')">
          Cancel
        </Button>

        <Button
          v-if="canDelete"
          appearance="danger"
          :disabled="loading"
          @click="confirmVoid"
        >
          {{ loading ? 'Deleting…' : 'Void Asset' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Asset } from '../../types/asset.ts'
import Modal from '../ui/Modal.vue'
import Button from '../ui/button.vue'

const props = defineProps<{
  open: boolean
  asset: Asset | null
}>()

const emit = defineEmits<{
  close: []
  confirmed: [asset: Asset, reason: string]
}>()

const reason = ref('')
const loading = ref(false)

// Types that currently have DELETE endpoints
const DELETABLE_TYPES = new Set([
  'Router',
  'NAP',
  'Tower',
  'Rack',
  'Building',
  'Closure',
  'LCP',
  'Fiber Cable',
])

const canDelete = computed(() => {
  const typeName = props.asset?.assetType?.name
  return typeName ? DELETABLE_TYPES.has(typeName) : false
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    reason.value = ''
    loading.value = false
  }
})

async function confirmVoid() {
  if (!props.asset) return
  loading.value = true
  emit('confirmed', props.asset, reason.value.trim())
}
</script>