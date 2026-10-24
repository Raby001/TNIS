<template>
  <Modal
    :open="open"
    :title="asset?.name ?? 'Asset details'"
    :description="asset?.assetTag ?? 'Asset information'"
    width-class="max-w-xl"
    @close="$emit('close')"
  >
    <div v-if="asset" class="space-y-5 text-center">
      <div class="flex justify-left rounded-lg">
        <Badge :label="asset.status?.name ?? '—'" :color="asset.status?.color" size="sm" />
      </div>

      <section class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Identity</h3>
        <dl class="space-y-2 text-sm">
          <div class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Type</dt>
            <dd class="text-slate-800">{{ asset.assetType?.name ?? '—' }}</dd>
          </div>
          <div v-if="asset.code" class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Asset Code</dt>
            <dd class="font-mono-num text-slate-800">{{ asset.code }}</dd>
          </div>
          <div v-if="asset.serialNumber" class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Serial Number</dt>
            <dd class="font-mono-num text-slate-800">{{ asset.serialNumber }}</dd>
          </div>
        </dl>
      </section>

      <FiberCableDetail
        v-if="isFiberCable"
        :asset="asset"
        :fiberDetail="fiberDetail"
        :fiberLoading="fiberLoading"
        :fiberError="fiberError"
      />

      <TowerDetailSection
        v-if="isTower"
        :asset="asset"
        :towerDetail="towerDetail"
        :towerLoading="towerLoading"
        :towerError="towerError"
      />

      <SpliceClosureDetail
        v-if="isClosure"
        :asset="asset"
        :spliceDetail="spliceDetail"
        :spliceLoading="spliceLoading"
        :spliceError="spliceError"
      />

      <LcpDetail
        v-if="isLcp"
        :asset="asset"
        :lcpDetail="lcpDetail"
        :lcpLoading="lcpLoading"
        :lcpError="lcpError"
      />

      <section class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Location</h3>

        <p class="mb-1 text-sm font-medium text-slate-800">{{ siteName }}</p>

        <!-- Geometry summary -->
        <div class="mb-3 space-y-1">
          <p class="text-xs text-slate-500">
            <span class="font-medium text-slate-600">Geometry:</span>
            {{ geometrySummary }}
          </p>

          <!-- Show coordinates in a readable way -->
          <div v-if="geometryDetails" class="rounded-md bg-white px-3 py-2 text-xs font-mono text-slate-700 border border-slate-200">
            <pre class="whitespace-pre-wrap break-all">{{ geometryDetails }}</pre>
          </div>
        </div>

        <!-- Map placeholder (for future) -->
        <!-- <div class="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-500">
          Map preview frozen for this phase
        </div> -->
      </section>

      <section v-if="asset.manufacturer || asset.vendor || asset.project" class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Manufacturer & Sourcing</h3>
        <dl class="space-y-2 text-sm">
          <div v-if="asset.manufacturer" class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Manufacturer</dt>
            <dd class="text-right text-slate-800">
              {{ asset.manufacturer.name }}<span v-if="asset.assetModel"> · {{ asset.assetModel.name }}</span>
            </dd>
          </div>
          <div v-if="asset.vendor" class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Vendor</dt>
            <dd class="text-slate-800">{{ asset.vendor.name }}</dd>
          </div>
          <div v-if="asset.project" class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Project</dt>
            <dd class="text-slate-800">{{ asset.project.name }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="asset.purchaseDate || asset.installationDate || asset.warrantyEnd" class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Dates</h3>
        <dl class="space-y-2 text-sm">
          <div v-if="asset.purchaseDate" class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Purchased</dt>
            <dd class="text-slate-800">{{ formatOrdinalDate(asset.purchaseDate) }}</dd>
          </div>
          <div v-if="asset.installationDate" class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Installed</dt>
            <dd class="text-slate-800">{{ formatOrdinalDate(asset.installationDate) }}</dd>
          </div>
          <div v-if="asset.warrantyEnd" class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Warranty Until</dt>
            <dd class="text-slate-800">{{ formatOrdinalDate(asset.warrantyEnd) }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="asset.description" class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Description</h3>
        <p class="text-sm leading-6 text-slate-700">{{ asset.description }}</p>
      </section>

      <!-- <section class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Photos & Documents</h3>
        <div v-if="attachments && (attachments.photos.length || attachments.documents.length)" class="space-y-2 text-sm">
          <p v-for="(name, i) in attachments.photos" :key="'p-' + i" class="flex items-center gap-2 text-slate-700">
            <ImageIcon class="h-3.5 w-3.5 text-slate-400" /> {{ name }}
          </p>
          <p v-for="(name, i) in attachments.documents" :key="'d-' + i" class="flex items-center gap-2 text-slate-700">
            <FileTextIcon class="h-3.5 w-3.5 text-slate-400" /> {{ name }}
          </p>
        </div>
        <p v-else class="text-sm text-slate-400">No photos or documents attached.</p>
      </section> -->

      <p class="text-center text-xs text-slate-400">Last updated {{ formatOrdinalDateTime(asset.updatedAt) }}</p>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ImageIcon, FileTextIcon } from 'lucide-vue-next'
import type { Asset } from '../../types/asset.ts'
import { useAssetsStore } from '../../stores/assets.ts'
import { formatOrdinalDate, formatOrdinalDateTime } from '../../utils/formatDate.ts'
import { fiberCableApi } from '../../services/api/fiber-cable.api.ts' 
import { assetApi } from '@/services/api/asset.api.ts'
import type { CableDetailResponse } from '@/types/cable'
import Badge from '../ui/Badge.vue'
import Modal from '../ui/Modal.vue'
import FiberCableDetail from './detail-sections/FiberCableDetail.vue'
import SpliceClosureDetail from './detail-sections/SpliceClosureDetail.vue'
import LcpDetail from './detail-sections/LcpDetail.vue'
import TowerDetailSection from './detail-sections/TowerDetail.vue'
import type { TowerDetail as TowerDetailType } from '@/types/tower.ts'
import type { SpliceClosureDetailResponse } from '@/types/splice-closure'
import type { LcpDetailResponse } from '@/types/lcp'

const props = defineProps<{
  open: boolean
  asset: Asset | null
}>()

defineEmits<{ close: [] }>()

const store = useAssetsStore()

const attachments = computed(() => props.asset?.attachments)
const siteName = computed(() => store.sites.find((s: { id: string | undefined }) => s.id === props.asset?.siteId)?.name ?? '—')

const isFiberCable = computed(() => props.asset?.assetType?.name === 'Fiber Cable')

const isTower = computed(() => props.asset?.assetType?.name === 'Tower')

const isClosure = computed(() => props.asset?.assetType?.name === 'Closure')

const isLcp = computed(() => props.asset?.assetType?.name === 'LCP')

const spliceDetail = ref<SpliceClosureDetailResponse | null>(null)
const spliceLoading = ref(false)
const spliceError = ref('')

const lcpDetail = ref<LcpDetailResponse | null>(null)
const lcpLoading = ref(false)
const lcpError = ref('')

const fiberDetail = ref<CableDetailResponse | null>(null)
const fiberLoading = ref(false)
const fiberError = ref('')

const towerDetail = ref<TowerDetailType | null>(null)
const towerLoading = ref(false)
const towerError = ref('')

watch(
  () => [
    props.open,
    props.asset?.id,
    isFiberCable.value,
    isTower.value,
    isClosure.value,
    isLcp.value,
  ] as const,
  async ([isOpen, id, fiberType, towerType, closureType, lcpType]) => {
    fiberDetail.value = null
    fiberError.value = ''

    towerDetail.value = null
    towerError.value = ''

    spliceDetail.value = null
    spliceError.value = ''

    lcpDetail.value = null
    lcpError.value = ''

    if (!isOpen || !id) return

    if (fiberType) {
      fiberLoading.value = true
      try {
        fiberDetail.value = await fiberCableApi.getDetail(id)
      } catch (err) {
        console.error(err)
        fiberError.value = 'Could not load fiber cable details.'
      } finally {
        fiberLoading.value = false
      }
    }

    if (towerType) {
      towerLoading.value = true
      try {
        towerDetail.value = await assetApi.getTower(id)
      } catch (err) {
        console.error(err)
        towerError.value = 'Could not load tower details.'
      } finally {
        towerLoading.value = false
      }
    }

    if (closureType) {
      spliceLoading.value = true
      try {
        spliceDetail.value = await assetApi.getSpliceClosure(id)
      } catch (err) {
        console.error(err)
        spliceError.value = 'Could not load closure details.'
      } finally {
        spliceLoading.value = false
      }
    }

    if (lcpType) {
      lcpLoading.value = true
      try {
        lcpDetail.value = await assetApi.getLcp(id)
      } catch (err) {
        console.error(err)
        lcpError.value = 'Could not load LCP details.'
      } finally {
        lcpLoading.value = false
      }
    }
  },
)

const geometrySummary = computed(() => {
  const geom = props.asset?.geometry ?? fiberDetail.value?.fiberCable?.geometry
  if (!geom) return 'No geometry set'
  if (geom.type === 'Point') return 'Point'
  if (geom.type === 'LineString') return `LineString · ${geom.coordinates.length} points`
  if (geom.type === 'Polygon') return `Polygon · ${geom.coordinates[0].length - 1} points`
  return geom.type
})

const geometryDetails = computed(() => {
  const geom = props.asset?.geometry ?? fiberDetail.value?.fiberCable?.geometry
  if (!geom || !geom.coordinates) return null

  if (geom.type === 'Point') {
    const [lng, lat] = geom.coordinates
    return `Lng: ${lng}\nLat: ${lat}`
  }

  if (geom.type === 'LineString') {
    return geom.coordinates
      .map((c: number[], i: number) => `${i + 1}. ${c[0]}, ${c[1]}`)
      .join('\n')
  }

  if (geom.type === 'Polygon') {
    return geom.coordinates[0]
      .map((c: number[], i: number) => `${i + 1}. ${c[0]}, ${c[1]}`)
      .join('\n')
  }

  return JSON.stringify(geom.coordinates, null, 2)
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>