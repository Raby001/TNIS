<template>
  <Modal
    :open="open"
    title="Manage Cores & Connections"
    :description="asset?.name ?? ''"
    width-class="max-w-2xl"
    @close="$emit('close')"
  >
    <!-- Tabs -->
    <div class="mb-4 flex gap-1 border-b border-slate-200">
      <button
        type="button"
        class="px-3 py-2 text-sm font-medium transition"
        :class="tab === 'connections'
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-slate-500 hover:text-slate-700'"
        @click="tab = 'connections'"
      >
        Connections
      </button>
      <button
        type="button"
        class="px-3 py-2 text-sm font-medium transition"
        :class="tab === 'cores'
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-slate-500 hover:text-slate-700'"
        @click="tab = 'cores'"
      >
        Cores
      </button>
    </div>

    <!-- ========== CONNECTIONS ========== -->
    <div v-if="tab === 'connections'" class="space-y-4">
      <p class="text-xs text-slate-500 leading-relaxed">
        <span class="block"><strong>ENDPOINT</strong> at position <strong>0</strong> = Start.</span>
        <span class="block"><strong>ENDPOINT</strong> at the highest position = End.</span>
        <span class="block"><strong>SPLICE_POINT</strong> = intermediate asset along the route.</span>
      </p>

      <div v-if="connLoading" class="text-sm text-slate-500">Loading connections…</div>
      <div v-else-if="connError" class="text-sm text-red-600">{{ connError }}</div>

      <template v-else>
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th class="py-2 font-medium">Pos</th>
              <th class="py-2 font-medium">Role</th>
              <th class="py-2 font-medium">Asset</th>
              <th class="py-2 font-medium">Type</th>
              <th class="py-2 font-medium">Connection</th>
              <th class="py-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="c in sortedConnections" :key="c.id">
              <td class="py-2 font-mono text-xs">{{ c.endpointPosition }}</td>
              <td class="py-2">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="roleBadgeClass(c)"
                >
                  {{ roleLabel(c) }}
                </span>
              </td>
              <td class="py-2">
                <div class="font-medium text-slate-800">{{ c.asset?.name ?? '—' }}</div>
                <div class="text-xs text-slate-400">{{ c.asset?.code }}</div>
              </td>
              <td class="py-2 text-slate-600">{{ c.asset?.assetType?.name ?? '—' }}</td>
              <td class="py-2 text-slate-600">{{ c.connectionType }}</td>
              <td class="py-2 text-right">
                <button
                  type="button"
                  class="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                  :disabled="disconnectingId === c.id"
                  @click="disconnect(c)"
                >
                  {{ disconnectingId === c.id ? '…' : 'Disconnect' }}
                </button>
              </td>
            </tr>
            <tr v-if="sortedConnections.length === 0">
              <td colspan="6" class="py-8 text-center text-sm text-slate-400">
                No connections yet.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Add connection -->
        <div class="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Add connection
          </p>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Select v-model="newConn.assetId">
              <option value="" disabled>Select asset</option>
              <option
                v-for="a in connectableAssets"
                :key="a.id"
                :value="a.id"
              >
                {{ a.name }} ({{ a.assetType?.name }})
              </option>
            </Select>

            <Select v-model="newConn.connectionType">
              <option value="ENDPOINT">ENDPOINT</option>
              <option value="SPLICE_POINT">SPLICE_POINT</option>
            </Select>

            <Input
              :model-value="newConn.endpointPosition === null || newConn.endpointPosition === undefined
                ? ''
                : String(newConn.endpointPosition)"
              type="number"
              min="0"
              placeholder="Position"
              @update:model-value="(v) => {
                newConn.endpointPosition = v === '' || v === null ? 0 : Number(v)
              }"
            />
          </div>
          <Button
            size="sm"
            :disabled="!newConn.assetId || adding"
            @click="addConnection"
          >
            {{ adding ? 'Adding…' : 'Add connection' }}
          </Button>
        </div>
      </template>
    </div>

    <!-- ========== CORES ========== -->
    <div v-else class="space-y-4">
      <!-- Prefer extracted panel; or keep standalone ManageCoreModal only when used alone -->
      <ManageCoresPanel
        v-if="useCoresPanel"
        :asset="asset"
      />
      <!-- Fallback message if cores API not ready -->
      <p v-else class="text-sm text-slate-500">
        Open cores management here. Wire to the same logic as ManageCoreModal
        (prefer a shared ManageCoresPanel without its own Modal).
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="secondary" @click="$emit('close')">
          Cancel
        </Button>
        <Button
          class="rounded-xl border border-blue-600 bg-blue-600 text-white"
          @click="$emit('close')"
        >
          Done
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Asset } from '@/types/asset'
import type { FiberCableConnection } from '@/types/cable'
import { fiberCableApi } from '@/services/api/fiber-cable.api' // or fiberCableConnectionApi
import { useAssetsStore } from '@/stores/assets'
import Modal from '../ui/Modal.vue'
import Button from '../ui/button.vue'
import Select from '../ui/Select.vue'
import Input from '../ui/input.vue'
// import ManageCoresPanel from './ManageCoresPanel.vue'

const useCoresPanel = false

const props = defineProps<{
  open: boolean
  asset: Asset | null
}>()

defineEmits<{ close: [] }>()

const store = useAssetsStore()
const tab = ref<'connections' | 'cores'>('connections')

const connections = ref<FiberCableConnection[]>([])
const connLoading = ref(false)
const connError = ref('')
const adding = ref(false)
const disconnectingId = ref<string | null>(null)

const newConn = ref({
  assetId: '',
  connectionType: 'ENDPOINT' as 'ENDPOINT' | 'SPLICE_POINT',
  endpointPosition: 0,
})

const sortedConnections = computed(() =>
  [...connections.value].sort((a, b) => a.endpointPosition - b.endpointPosition),
)

const maxPosition = computed(() =>
  sortedConnections.value.length
    ? Math.max(...sortedConnections.value.map((c) => c.endpointPosition))
    : 0,
)

const connectableAssets = computed(() =>
  store.assets.filter((a) => {
    if (!props.asset) return false
    if (a.id === props.asset.id) return false
    if (connections.value.some((c) => c.assetId === a.id)) return false
    if (a.assetType?.canConnectToFiber != null) return a.assetType.canConnectToFiber
    return a.assetType?.name !== 'Fiber Cable'
  }),
)

function roleLabel(c: FiberCableConnection) {
  if (c.connectionType === 'SPLICE_POINT') return 'Intermediate'
  if (c.endpointPosition === 0) return 'Start'
  if (c.endpointPosition === maxPosition.value) return 'End'
  return 'Endpoint'
}

function roleBadgeClass(c: FiberCableConnection) {
  const role = roleLabel(c)
  if (role === 'Start') return 'bg-emerald-50 text-emerald-700'
  if (role === 'End') return 'bg-blue-50 text-blue-700'
  if (role === 'Intermediate') return 'bg-amber-50 text-amber-800'
  return 'bg-slate-100 text-slate-600'
}

async function loadConnections() {
  if (!props.asset?.id) return
  connLoading.value = true
  connError.value = ''
  try {
    const res = await fiberCableApi.listConnections(props.asset.id)
    connections.value = (res.data ?? res) as FiberCableConnection[]
    // default next position for add form
    newConn.value.endpointPosition =
      connections.value.length === 0
        ? 0
        : maxPosition.value + 1
  } catch (e) {
    console.error(e)
    connError.value = 'Could not load connections.'
    connections.value = []
  } finally {
    connLoading.value = false
  }
}

async function addConnection() {
  if (!props.asset?.id || !newConn.value.assetId) return
  adding.value = true
  try {
    await fiberCableApi.createConnection({
      fiberCableId: props.asset.id,
      assetId: newConn.value.assetId,
      connectionType: newConn.value.connectionType,
      endpointPosition: newConn.value.endpointPosition,
    })
    newConn.value.assetId = ''
    await loadConnections()
  } catch (e) {
    console.error(e)
    alert('Failed to add connection.')
  } finally {
    adding.value = false
  }
}

async function disconnect(c: FiberCableConnection) {
  if (!confirm(`Disconnect ${c.asset?.name ?? 'this asset'}?`)) return
  disconnectingId.value = c.id
  try {
    // Backend: PATCH /fiber-cable-connections/{id}/disconnect
    await fiberCableApi.disconnectConnection(c.id)
    await loadConnections()
  } catch (e) {
    console.error(e)
    alert('Failed to disconnect.')
  } finally {
    disconnectingId.value = null
  }
}

watch(
  () => [props.open, props.asset?.id] as const,
  ([isOpen]) => {
    if (!isOpen) return
    tab.value = 'connections'
    loadConnections()
  },
)
</script>