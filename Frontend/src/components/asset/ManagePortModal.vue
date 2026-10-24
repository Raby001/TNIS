<template>
  <Modal
    :open="open"
    title="Manage Ports"
    :description="asset ? `${asset.name} — ${ports.length} total ports` : ''"
    width-class="max-w-4xl"
    @close="$emit('close')"
  >
    <div class="mb-4 flex gap-4 text-xs text-slate-500">
      <span>🟢 Spare: {{ countByStatus('spare') }}</span>
      <span>🔵 In Use: {{ countByStatus('inUse') }}</span>
      <span>🔴 Damaged: {{ countByStatus('damaged') }}</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[760px] text-left text-sm">
      <thead>
        <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <th class="px-3 py-2.5 font-medium">Port</th>
          <th class="px-3 py-2.5 font-medium">Slot / Card</th>
          <th class="px-3 py-2.5 font-medium">Type</th>
          <th class="px-3 py-2.5 font-medium">Speed</th>
          <th class="px-3 py-2.5 font-medium">Connected To</th>
          <th class="px-3 py-2.5 font-medium">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-for="port in ports" :key="port.id">
          <td class="px-3 py-3 align-middle font-mono-num font-medium text-slate-800">{{ port.name }}</td>
          <td class="px-3 py-3 align-middle text-slate-500">{{ port.slotLabel }} · {{ port.cardLabel }}</td>
          <td class="px-3 py-3 align-middle">{{ port.port_type }}</td>
          <td class="px-3 py-3 align-middle">{{ port.speed }}</td>
          <td class="max-w-[220px] px-3 py-3 align-middle text-slate-500">{{ port.connected_to ?? '—' }}</td>
          <td class="px-3 py-3 align-middle">
            <div class="flex flex-row items-center gap-3">
              <Select
                :model-value="port.status_id"
                class="h-[42px] w-full max-w-[140px]"
                @update:model-value="(v) => onStatusChange(port, v)"
              >
                <option :value="CORE_STATUS_IDS.spare">Spare</option>
                <option :value="CORE_STATUS_IDS.inUse">In Use</option>
                <option :value="CORE_STATUS_IDS.damaged">Damaged</option>
              </Select>

              <button
                v-if="port.status_id === CORE_STATUS_IDS.damaged"
                type="button"
                class="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900"
                :aria-expanded="isDamageReasonExpanded(port.id)"
                @click="toggleDamageReason(port.id)"
              >
                {{ isDamageReasonExpanded(port.id) ? 'Hide damage reason' : 'See damage reason' }}
                <ChevronDownIcon
                  class="h-4 w-4 transition-transform"
                  :class="{ 'rotate-180': isDamageReasonExpanded(port.id) }"
                />
              </button>

              <div
                v-if="port.status_id === CORE_STATUS_IDS.damaged && isDamageReasonExpanded(port.id)"
                class="flex w-56 flex-col rounded-lg border border-red-200 bg-red-50 p-2.5"
              >
                <Label class="mb-1 flex items-center gap-1 text-[11px] font-semibold text-red-700">
                  <AlertTriangleIcon class="h-3.5 w-3.5" /> Damage reason
                </Label>
                <Textarea
                  v-model="port.damage_reason"
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
    </div>

    <div v-if="damagedPorts.length" class="mt-4 space-y-1.5 rounded-lg bg-red-50 p-3 text-xs text-red-700">
      <p v-for="port in damagedPorts" :key="port.id">
        <span class="font-medium">{{ port.name }}:</span> {{ port.damage_reason || 'No reason recorded yet.' }}
      </p>
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
import { mockDevicePorts, type DevicePort } from '../../data/mockDevicePort.ts'
import { CORE_STATUS_IDS } from '../../data/mockFiberCore.ts'
import Modal from '../ui/Modal.vue'
import Button from '../ui/button.vue'
import Select from '../ui/Select.vue'
import Label from '../ui/label.vue'
import Textarea from '../ui/Textarea.vue'

const props = defineProps<{
  open: boolean
  asset: Asset | null
}>()

defineEmits<{ close: [] }>()

const ports = ref<DevicePort[]>([])
const expandedDamageReasons = ref<Set<string>>(new Set())

const damagedPorts = computed(() => ports.value.filter((p) => p.status_id === CORE_STATUS_IDS.damaged))

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    // TODO: replace with a real flattened GET /assets/:id/ports call once
    // the backend exists (joining devices → chassis → shelves → slots → cards → ports).
    ports.value = props.asset ? mockDevicePorts[props.asset.id] ?? [] : []
    expandedDamageReasons.value = new Set()
  }
)

function countByStatus(key: keyof typeof CORE_STATUS_IDS) {
  return ports.value.filter((p) => p.status_id === CORE_STATUS_IDS[key]).length
}

function onStatusChange(port: DevicePort, newStatusId: string) {
  port.status_id = newStatusId
  if (newStatusId !== CORE_STATUS_IDS.damaged) {
    port.damage_reason = undefined
    expandedDamageReasons.value.delete(port.id)
  }
}

function isDamageReasonExpanded(portId: string) {
  return expandedDamageReasons.value.has(portId)
}

function toggleDamageReason(portId: string) {
  const next = new Set(expandedDamageReasons.value)
  if (next.has(portId)) {
    next.delete(portId)
  } else {
    next.add(portId)
  }
  expandedDamageReasons.value = next
}
</script>