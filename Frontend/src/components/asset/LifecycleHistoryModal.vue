<template>
  <Modal
    :open="open"
    title="Lifecycle History"
    :description="asset ? asset.name : ''"
    width-class="max-w-xl"
    @close="$emit('close')"
  >
    <!-- Current status -->
    <div class="mb-5 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
      <span class="text-xs font-medium text-slate-500">Current status:</span>
      <Badge :label="asset?.status?.name ?? '—'" :color="asset?.status?.color" size="sm" />
    </div>

    <!-- Add Event -->
    <div class="mb-6 rounded-lg border border-slate-200 p-4">
      <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Log New Event</h3>

      <div v-if="validEventTypes.length === 0" class="text-sm text-slate-500">
        No lifecycle events are available from this asset's current status.
      </div>

      <form v-else class="space-y-3" @submit.prevent="handleLogEvent">
        <div>
          <Label for="evt-type" required>Event Type</Label>
          <Select id="evt-type" v-model="newEvent.type">
            <option value="" disabled>Select event type</option>
            <option v-for="type in validEventTypes" :key="type" :value="type">
              {{ lifecycleEventMeta[type].label }}{{ statusDescriptionFor(type) ? ` — ${statusDescriptionFor(type)}` : '' }}
            </option>
          </Select>
          <p v-if="newEvent.type && lifecycleEventMeta[newEvent.type as LifecycleEventType].resultingStatus" class="mt-1 text-xs text-slate-500">
            This will change the status to
            <span class="font-medium text-slate-700">
              {{ lifecycleEventMeta[newEvent.type as LifecycleEventType].resultingStatus }}
            </span>.
          </p>
        </div>

        <div>
          <Label for="evt-description" required>Description</Label>
          <Textarea id="evt-description" v-model="newEvent.description" :rows="2" placeholder="What happened?" />
        </div>

        <div>
          <Label for="evt-photo">Photo (optional)</Label>
          <input
            ref="photoInputEl"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onPhotoSelected"
          />
          <Button variant="secondary" size="sm" type="button" @click="photoInputEl?.click()">
            <UploadIcon class="h-4 w-4" /> {{ newEvent.photo ? newEvent.photo.name : 'Attach Photo' }}
          </Button>
        </div>

        <Button type="submit" :disabled="!newEvent.type || !newEvent.description">Log Event</Button>
      </form>
    </div>

    <!-- Timeline -->
    <div>
      <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">History</h3>
      <ul v-if="events.length" class="space-y-3">
        <li v-for="event in events" :key="event.id" class="flex gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" :class="lifecycleEventMeta[event.type].color">
            <component :is="lifecycleEventMeta[event.type].icon" class="h-4 w-4" />
          </span>
          <div class="flex-1 border-b border-slate-100 pb-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-slate-900">{{ lifecycleEventMeta[event.type].label }}</span>
              <span class="text-xs text-slate-400">{{ formatOrdinalDate(event.date) }}</span>
            </div>
            <p class="mt-0.5 text-sm text-slate-600">{{ event.description }}</p>
            <p class="mt-0.5 text-xs text-slate-400">Logged by {{ event.loggedBy }}</p>
          </div>
        </li>
      </ul>
      <p v-else class="text-sm text-slate-400">No events logged yet.</p>
    </div>

    <template #footer>
      <Button variant="secondary" @click="$emit('close')" class="rounded-xl border border-blue-600 bg-blue-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md">Done</Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { UploadIcon } from 'lucide-vue-next'
import type { Asset } from '../../types/asset.ts'
import { useAssetsStore } from '../../stores/assets.ts'
import { lifecycleEventMeta, getValidEventTypes, type LifecycleEventType } from '../../utils/lifecycleEvents.ts'
import { mockLifecycleEvents, type LifecycleEvent } from '../../data/mock-lifecycle-event.ts'
import { formatOrdinalDate } from '../../utils/formatDate.ts'
import Modal from '../ui/Modal.vue'
import Button from '../ui/button.vue'
import Badge from '../ui/Badge.vue'
import Label from '../ui/label.vue'
import Select from '../ui/Select.vue'
import Textarea from '../ui/Textarea.vue'

const props = defineProps<{
  open: boolean
  asset: Asset | null
}>()

const emit = defineEmits<{ close: [] }>()

const store = useAssetsStore()

const events = ref<LifecycleEvent[]>([])
const photoInputEl = ref<HTMLInputElement | null>(null)

const newEvent = reactive({
  type: '' as LifecycleEventType | '',
  description: '',
  photo: null as File | null,
})

// Only offers event types valid from the asset's *current* status — this is
// the state-machine logic: e.g. "Repair Completed" only appears if the
// asset is currently "Under Repair".
const validEventTypes = computed(() => getValidEventTypes(props.asset?.status?.name))

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    newEvent.type = ''
    newEvent.description = ''
    newEvent.photo = null

    // TODO: replace with a real GET /assets/:id/lifecycle-events call once
    // the backend exists.
    events.value = props.asset ? mockLifecycleEvents[props.asset.id] ?? [] : []
  }
)

function onPhotoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  newEvent.photo = input.files?.[0] ?? null
}

function statusDescriptionFor(type: LifecycleEventType): string | undefined {
  const resultingName = lifecycleEventMeta[type].resultingStatus
  if (!resultingName) return undefined 
  return store.statuses.find((s) => s.name === resultingName)?.description
}

async function handleLogEvent() {
  if (!props.asset || !newEvent.type) return

  const meta = lifecycleEventMeta[newEvent.type]

  const entry: LifecycleEvent = {
    id: `evt-${Date.now()}`, // TODO: real ID comes from the backend once this is a real POST
    type: newEvent.type,
    description: newEvent.description,
    loggedBy: 'You', // TODO: pull from the logged-in user (auth store) once wired up
    date: new Date().toISOString().slice(0, 10),
  }

  events.value = [entry, ...events.value]

  if (meta.resultingStatus) {
  const newStatus = store.statuses.find((s) => s.name === meta.resultingStatus)
  if (newStatus) {
    await store.updateAsset(props.asset.id, { status_id: newStatus.id })
  }
}

  newEvent.type = ''
  newEvent.description = ''
  newEvent.photo = null
}
</script>