<template>
  <div v-if="embedded" class="space-y-4">
    <div v-if="asset?.project" class="mb-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
      Project: <span class="font-medium text-slate-800">{{ asset.project.name }}</span>
    </div>

    <div class="mb-4 flex gap-4 text-xs text-slate-500">
      <span>🟢 Spare: {{ countByStatus('spare') }}</span>
      <span>🔵 In Use: {{ countByStatus('inUse') }}</span>
      <span>🔴 Damaged: {{ countByStatus('damaged') }}</span>
    </div>

    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <th class="py-2 font-medium">Core #</th>
          <th class="py-2 font-medium">Color</th>
          <th class="py-2 font-medium">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-for="core in cores" :key="core.id">
          <td class="py-2 align-middle font-mono-num">{{ core.core_number }}</td>
          <td class="py-2 align-middle">{{ core.color }}</td>
          <td class="py-2 align-middle">
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
              <Select
                :model-value="core.status_id"
                class="h-[42px] max-w-[140px]"
                @update:model-value="(v) => onStatusChange(core, v)"
              >
                <option :value="CORE_STATUS_IDS.spare">Spare</option>
                <option :value="CORE_STATUS_IDS.inUse">In Use</option>
                <option :value="CORE_STATUS_IDS.damaged">Damaged</option>
              </Select>

              <button
                v-if="core.status_id === CORE_STATUS_IDS.damaged"
                type="button"
                class="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900"
                :aria-expanded="isDamageReasonExpanded(core.id)"
                @click="toggleDamageReason(core.id)"
              >
                {{ isDamageReasonExpanded(core.id) ? 'Hide damage reason' : 'See damage reason' }}
                <ChevronDownIcon
                  class="h-4 w-4 transition-transform"
                  :class="{ 'rotate-180': isDamageReasonExpanded(core.id) }"
                />
              </button>
              </div>

              <div
                v-if="core.status_id === CORE_STATUS_IDS.damaged && isDamageReasonExpanded(core.id)"
                class="flex w-56 flex-col rounded-lg border border-red-200 bg-red-50 p-2.5"
              >
                <Label class="mb-1 flex items-center gap-1 text-[11px] font-semibold text-red-700">
                  <AlertTriangleIcon class="h-3.5 w-3.5" /> Damage reason
                </Label>
                <Textarea
                  v-model="core.damage_reason"
                  placeholder="What caused this?"
                  :rows="2"
                  class="border-red-200 bg-white text-xs focus:border-red-400 focus:ring-red-400/20"
                />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="damagedCores.length" class="mt-4 space-y-1.5 rounded-lg bg-red-50 p-3 text-xs text-red-700">
      <p v-for="core in damagedCores" :key="core.id">
        <span class="font-medium">Core {{ core.core_number }}:</span> {{ core.damage_reason || 'No reason recorded yet.' }}
      </p>
    </div>

     <div v-if="endpointA && endpointB" class="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
      Connects:
      <span class="font-medium text-slate-800">{{ endpointA.site_name }}</span>
      ↔
      <span class="font-medium text-slate-800">{{ endpointB.site_name }}</span>
    </div>

  </div>

  <Modal
    v-else
    :open="open"
    title="Manage Cores"
    :description="asset ? `${asset.name} — ${cores.length} total cores` : ''"
    width-class="max-w-xl"
    @close="$emit('close')"
  >

  <div v-if="asset?.project" class="mb-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
      Project: <span class="font-medium text-slate-800">{{ asset.project.name }}</span>
    </div>

    <div class="mb-4 flex gap-4 text-xs text-slate-500">
      <span>🟢 Spare: {{ countByStatus('spare') }}</span>
      <span>🔵 In Use: {{ countByStatus('inUse') }}</span>
      <span>🔴 Damaged: {{ countByStatus('damaged') }}</span>
    </div>

    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <th class="py-2 font-medium">Core #</th>
          <th class="py-2 font-medium">Color</th>
          <th class="py-2 font-medium">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-for="core in cores" :key="core.id">
          <td class="py-2 align-middle font-mono-num">{{ core.core_number }}</td>
          <td class="py-2 align-middle">{{ core.color }}</td>
          <td class="py-2 align-middle">
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
              <Select
                :model-value="core.status_id"
                class="h-[42px] max-w-[140px]"
                @update:model-value="(v) => onStatusChange(core, v)"
              >
                <option :value="CORE_STATUS_IDS.spare">Spare</option>
                <option :value="CORE_STATUS_IDS.inUse">In Use</option>
                <option :value="CORE_STATUS_IDS.damaged">Damaged</option>
              </Select>

              <button
                v-if="core.status_id === CORE_STATUS_IDS.damaged"
                type="button"
                class="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900"
                :aria-expanded="isDamageReasonExpanded(core.id)"
                @click="toggleDamageReason(core.id)"
              >
                {{ isDamageReasonExpanded(core.id) ? 'Hide damage reason' : 'See damage reason' }}
                <ChevronDownIcon
                  class="h-4 w-4 transition-transform"
                  :class="{ 'rotate-180': isDamageReasonExpanded(core.id) }"
                />
              </button>
              </div>

              <div
                v-if="core.status_id === CORE_STATUS_IDS.damaged && isDamageReasonExpanded(core.id)"
                class="flex w-56 flex-col rounded-lg border border-red-200 bg-red-50 p-2.5"
              >
                <Label class="mb-1 flex items-center gap-1 text-[11px] font-semibold text-red-700">
                  <AlertTriangleIcon class="h-3.5 w-3.5" /> Damage reason
                </Label>
                <Textarea
                  v-model="core.damage_reason"
                  placeholder="What caused this?"
                  :rows="2"
                  class="border-red-200 bg-white text-xs focus:border-red-400 focus:ring-red-400/20"
                />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="damagedCores.length" class="mt-4 space-y-1.5 rounded-lg bg-red-50 p-3 text-xs text-red-700">
      <p v-for="core in damagedCores" :key="core.id">
        <span class="font-medium">Core {{ core.core_number }}:</span> {{ core.damage_reason || 'No reason recorded yet.' }}
      </p>
    </div>

    <div v-if="endpointA && endpointB" class="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
      Connects:
      <span class="font-medium text-slate-800">{{ endpointA.site_name }}</span>
      ↔
      <span class="font-medium text-slate-800">{{ endpointB.site_name }}</span>
    </div>

    
    <template #footer>
      <Button variant="secondary" @click="$emit('close')" class="rounded-xl border border-blue-600 bg-blue-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md">Done</Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Asset } from '../../types/asset.ts'
import { AlertTriangleIcon, ChevronDownIcon } from 'lucide-vue-next'
import { mockFiberCores, CORE_STATUS_IDS, type FiberCore } from '../../data/mockFiberCore.ts'
import { mockCableEndpoints, type CableEndpoint } from '../../data/mockCableEndpoints.ts'
import Modal from '../ui/Modal.vue'
import Button from '../ui/button.vue'
import Select from '../ui/Select.vue'
import Label from '../ui/label.vue'
import Textarea from '../ui/Textarea.vue'

const props = defineProps<{
  open: boolean
  asset: Asset | null
  embedded?: boolean
}>()

defineEmits<{ close: [] }>()

const cores = ref<FiberCore[]>([])
const endpoints = ref<CableEndpoint[]>([])
const expandedDamageReasons = ref<Set<string>>(new Set())

const endpointA = computed(() => endpoints.value.find((e) => e.endpoint_role === 'A'))
const endpointB = computed(() => endpoints.value.find((e) => e.endpoint_role === 'B'))
const damagedCores = computed(() => cores.value.filter((c) => c.status_id === CORE_STATUS_IDS.damaged))


watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    // TODO: replace with a real GET /assets/:id/cores call once the backend exists.
    cores.value = props.asset ? mockFiberCores[props.asset.id] ?? [] : []
    expandedDamageReasons.value = new Set()
  }
)

function countByStatus(key: keyof typeof CORE_STATUS_IDS) {
  return cores.value.filter((c) => c.status_id === CORE_STATUS_IDS[key]).length
}

function onStatusChange(core: FiberCore, newStatusId: string) {
  core.status_id = newStatusId
  if (newStatusId !== CORE_STATUS_IDS.damaged) {
    core.damage_reason = undefined
    expandedDamageReasons.value.delete(core.id)
  }
}

function isDamageReasonExpanded(coreId: string) {
  return expandedDamageReasons.value.has(coreId)
}

function toggleDamageReason(coreId: string) {
  const next = new Set(expandedDamageReasons.value)
  if (next.has(coreId)) {
    next.delete(coreId)
  } else {
    next.add(coreId)
  }
  expandedDamageReasons.value = next
}
</script>