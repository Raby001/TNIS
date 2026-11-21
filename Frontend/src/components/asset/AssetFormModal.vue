<template>
  <Modal
    :open="open"
    :title="isEditMode ? 'Edit asset' : 'Add new asset'"
    :description="isEditMode ? `Update details for ${asset?.name}.` : 'Register a new asset into the inventory.'"
    width-class="max-w-2xl"
    @close="requestClose"
  >
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <!-- Basic Info -->
      <div>
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Basic Info</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <Label for="f-name" required>Name <span class="text-red-500">*</span></Label>
            <Input id="f-name" variant="asset" v-model="form.name" placeholder="e.g. Core Router - Toul Sangke" />
          </div>
          <div>
            <Label for="f-tag">Asset Tag</Label>
            <Input
              id="f-tag"
              variant="asset"
              v-model="form.asset_tag"
              placeholder="e.g. RTR-PP-014"
              :readonly="isEditMode && !isAdmin"
              :class="isEditMode && !isAdmin ? 'bg-slate-50 text-slate-500' : ''"
            />
            <p v-if="isEditMode && !isAdmin" class="mt-1 text-xs text-slate-500">
              Only admins can change the asset tag, since it's often printed on a physical label.
            </p>
          </div>
          <div v-if="isEditMode">
            <Label for="f-code">Asset Code</Label>
            <Input
              id="f-code"
              variant="asset"
              v-model="form.code"
              readonly
              class="bg-slate-50 font-mono-num text-slate-500"
            />
          </div>
          <div>
            <Label for="f-serial">Serial Number</Label>
            <Input id="f-serial" variant="asset" v-model="form.serial_number" class="font-mono-num" />
          </div>
          <div>
            <Label for="f-type" required>Asset Type <span class="text-red-500">*</span></Label>
            <Select
              v-if="!isEditMode"
              id="f-type"
              variant="asset"
              v-model="form.asset_type_id"
            >
              <option value="" disabled>Select type</option>
              <option v-for="t in store.assetTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
            </Select>
            <Input
              v-else
              id="f-type"
              variant="asset"
              readonly
              class="bg-slate-50 text-slate-500"
              :model-value="selectedTypeName"
            />
          </div>

          <div>
            <Label for="f-status" required>Status <span class="text-red-500">*</span></Label>
            <Select id="f-status" variant="asset" v-model="form.status_id">
              <option value="" disabled>Select status</option>
              <option v-for="s in store.statuses" :key="s.id" :value="s.id">{{ s.name }}</option>
            </Select>
          </div>
          <div v-if="isFiberCable || isTower || isClosure || isLcp">
            <Label for="f-condition" required>Condition <span class="text-red-500">*</span></Label>
            <Select id="f-condition" variant="asset" v-model="form.condition_id">
              <option value="" disabled>Select condition</option>
              <option v-for="condition in store.conditions" :key="condition.id" :value="condition.id">
                {{ condition.name }}
              </option>
            </Select>
          </div>
        </div>
      </div>

      <FiberCableField
        v-if="isFiberCable"
        :form="form"
        :cableTypes="cableTypes"
        :coreCounts="coreCounts"
        :installationMethods="installationMethods"
        :segmentTypes="segmentTypes"
        :startAssetSearch="startAssetSearch"
        :endAssetSearch="endAssetSearch"
        :loadingConnectableAssets="loadingConnectableAssets"
        :showStartList="showStartList"
        :showEndList="showEndList"
        :filteredStartAssets="filteredStartAssets"
        :filteredEndAssets="filteredEndAssets"
        @update:startAssetSearch="startAssetSearch = $event"
        @update:endAssetSearch="endAssetSearch = $event"
        @focus:start="onStartFocus"
        @focus:end="onEndFocus"
        @keydown:start="onStartKeydown"
        @keydown:end="onEndKeydown"
        @pick:start="pickStartAsset"
        @pick:end="pickEndAsset"
      />

      <TowerField v-if="isTower" :form="form" />

      <SpliceClosureField v-if="isClosure" :form="form" />

      <LcpField v-if="isLcp" :form="form" />

      <!-- Manufacturer & Model (cascading) -->
      <div>
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Manufacturer & Model</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label for="f-mfr">Manufacturer</Label>
            <Select id="f-mfr" v-model="form.manufacturer_id" @change="onManufacturerChange">
              <option value="">Select manufacturer</option>
              <option v-for="m in store.manufacturers" :key="m.id" :value="m.id">{{ m.name }}</option>
            </Select>
          </div>
          <div>
            <Label for="f-model">Model</Label>
            <Select id="f-model" v-model="form.asset_model_id" :disabled="!form.manufacturer_id">
              <option value="">{{ form.manufacturer_id ? 'Select model' : 'Select a manufacturer first' }}</option>
              <option v-for="mo in store.assetModels" :key="mo.id" :value="mo.id">{{ mo.name }}</option>
            </Select>
          </div>
        </div>
      </div>

      <!-- Vendor & Project -->
      <div>
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Vendor & Project</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label for="f-vendor">Vendor</Label>
            <Select id="f-vendor" v-model="form.vendor_id">
              <option value="">None</option>
              <option v-for="v in store.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
            </Select>
          </div>
          <div>
            <Label for="f-project">Project</Label>
            <Select id="f-project" v-model="form.project_id">
              <option value="">None</option>
              <option v-for="p in store.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
            </Select>
          </div>
          <div class="sm:col-span-2">
            <Label for="f-contract">Maintenance Contract</Label>
            <Select id="f-contract" v-model="form.maintenance_contract_id">
              <option value="">None</option>
              <option v-for="c in store.maintenanceContracts" :key="c.id" :value="c.id">{{ c.contractNumber }}</option>
            </Select>
          </div>
        </div>
      </div>

      <!-- Dates -->
      <div>
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Dates</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="f-purchase">Purchase Date</Label>
            <Input id="f-purchase" variant="asset" v-model="form.purchase_date" type="date" />
          </div>
          <div>
            <Label for="f-install">Installation Date</Label>
            <Input id="f-install" variant="asset" v-model="form.installation_date" type="date" />
          </div>
          <div>
            <Label for="f-warranty-start">Warranty Start</Label>
            <Input id="f-warranty-start" variant="asset" v-model="form.warranty_start" type="date" />
          </div>
          <div>
            <Label for="f-warranty-end">Warranty End</Label>
            <Input id="f-warranty-end" variant="asset" v-model="form.warranty_end" type="date" />
          </div>
        </div>
      </div>

      <!-- Location -->
      <div>
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Location</h3>
        <div class="mb-3">
          <Label for="f-site" :required="!isEditMode">Site <span v-if="!isEditMode" class="text-red-500">*</span></Label>
          <Select
            v-if="!isEditMode"
            id="f-site"
            v-model="form.site_id"
          >
            <option value="">Select site</option>
            <option v-for="s in store.sites" :key="s.id" :value="s.id">{{ s.name }}</option>
          </Select>
          <Input
            v-else
            id="f-site"
            variant="asset"
            readonly
            class="bg-slate-50 text-slate-500"
            :model-value="selectedSiteName"
          />
        </div>

        <!-- <div class="mb-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <div class="flex items-center gap-2 text-xs text-slate-600">
            <component :is="geometryIcon" class="h-4 w-4 text-slate-500" />
            <span class="font-medium">{{ selectedGeometryType ?? 'Point' }}</span>
            <span class="text-slate-400">— {{ mapInstructionText }}</span>
          </div>
          <span v-if="selectedGeometryType !== 'Point'" class="text-xs font-medium text-slate-500">
            {{ pointCountLabel }}
          </span>
        </div> -->

        <span class="mb-1.5 block text-sm font-medium text-slate-700">
          Geometry <span class="text-red-500">*</span>
        </span>
        <div v-if="!form.asset_type_id" class="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
          Select an Asset Type above first — it determines whether this asset needs a point, a route, or an area.
        </div>

        <template v-else>
          <div class="mb-2 flex items-center gap-2">
            <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" :class="geometryModeBadge.color">
              <component :is="geometryModeBadge.icon" class="h-3.5 w-3.5" />
              {{ geometryModeBadge.label }}
            </span>
            <span class="text-xs text-slate-500">{{ minPointsLabel }}</span>
          </div>

          <div class="space-y-2">
            <div v-for="(point, i) in manualPoints" :key="i" class="flex items-center gap-2">
              <span class="w-5 text-xs text-slate-400">{{ i + 1 }}</span>
              <Input
                :id="`f-lat-${i}`"
                variant="asset"
                :model-value="point.lat == null ? '' : String(point.lat)"
                type="number"
                step="any"
                placeholder="Latitude"
                class="font-mono-num"
                :readonly="isCableEndpointRow(i)"
                :class="isCableEndpointRow(i) ? 'bg-slate-50 text-slate-500' : ''"
                @update:model-value="(value) => { point.lat = value === '' ? null : Number(value) }"
              />
              <Input
                :id="`f-lng-${i}`"
                variant="asset"
                :model-value="point.lng == null ? '' : String(point.lng)"
                type="number"
                step="any"
                placeholder="Longitude"
                class="font-mono-num"
                :readonly="isCableEndpointRow(i)"
                :class="isCableEndpointRow(i) ? 'bg-slate-50 text-slate-500' : ''"
                @update:model-value="(value) => { point.lng = value === '' ? null : Number(value) }"
              />
              <button
                v-if="!isCableEndpointRow(i)"
                type="button"
                class="text-slate-400 hover:text-red-500 disabled:opacity-30"
                :disabled="manualPoints.length <= minPoints"
                @click="removePoint(i)"
              >
                <XIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <p v-if="hasLockedEndpoints" class="mt-1 text-xs text-slate-500">
            Rows 1 and {{ manualPoints.length }} come from the selected Start and End
            assets and cannot be edited. Add intermediate points between them to shape
            the route.
          </p>

          <Button
            v-if="selectedGeometryType !== 'Point'"
            variant="secondary"
            size="sm"
            type="button"
            class="mt-2"
            @click="addPoint"
          >
            <PlusIcon class="h-4 w-4" /> Add Point
          </Button>
        </template>
        <!--
        <p class="mb-2 text-xs text-slate-500">Click on the map to set coordinates, or type them directly below.</p>
        <div class="h-52 overflow-hidden rounded-lg border border-slate-200">
          <PickableMap
            interactive
            pickable
            :center="[104.9, 11.9]"
            :zoom="6.5"
            :marker-position="markerPosition"
            @location-picked="onLocationPicked"
          />
        </div> 
        <div class="mt-2 grid grid-cols-2 gap-4">
          <div>
            <Label for="f-lat">Latitude</Label>
            <Input
              id="f-lat"
              :model-value="form.latitude === undefined ? '' : String(form.latitude)"
              type="number"
              step="any"
              class="font-mono-num"
              @update:model-value="(value) => { form.latitude = value === '' ? undefined : Number(value) }"
            />
          </div>
          <div>
            <Label for="f-lng">Longitude</Label>
            <Input
              id="f-lng"
              :model-value="form.longitude === undefined ? '' : String(form.longitude)"
              type="number"
              step="any"
              class="font-mono-num"
              @update:model-value="(value) => { form.longitude = value === '' ? undefined : Number(value) }"
            />
          </div>
        </div>
        -->
      </div>

      <!-- Photos -->
      <section class="border-t border-slate-200 pt-5">
        <div class="flex items-baseline justify-between">
          <h3 class="text-sm font-semibold text-slate-900">Photos</h3>
          <span class="text-xs text-slate-500">{{ form.photos.length }} attached</span>
        </div>

        <div class="mt-3 flex flex-wrap gap-2.5">
          <figure
            v-for="(file, i) in form.photos"
            :key="`${file.name}-${file.size}-${file.lastModified}-${i}`"
            class="group relative h-24 w-32 overflow-hidden rounded-lg border border-slate-200"
          >
            <img
              :src="getPreviewUrl(file)"
              :alt="file.name"
              class="h-full w-full object-cover"
            />
            <button
              type="button"
              class="absolute right-1 top-1 rounded-md bg-slate-900/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              @click="removePhoto(i)"
            >
              <XIcon class="h-3.5 w-3.5" />
            </button>
            <figcaption
              class="absolute inset-x-0 bottom-0 truncate bg-slate-900/70 px-1.5 py-1 text-[10px] text-white"
            >
              {{ file.name }}
            </figcaption>
          </figure>

          <label
            class="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-slate-400 hover:bg-slate-100"
          >
            <ImagePlusIcon class="h-5 w-5 text-slate-400" />
            <span class="text-xs font-medium text-slate-600">Add photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              class="sr-only"
              @change="onPhotosSelected"
            />
          </label>
        </div>
      </section>

      <!-- Documents -->
      <section class="border-t border-slate-200 pt-5">
        <div class="flex items-baseline justify-between">
          <h3 class="text-sm font-semibold text-slate-900">Documents</h3>
          <span class="text-xs text-slate-500">{{ form.documents.length }} attached</span>
        </div>

        <ul class="mt-3 space-y-2">
          <li
            v-for="(file, i) in form.documents"
            :key="`${file.name}-${file.size}-${file.lastModified}-${i}`"
            class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5"
          >
            <FileTextIcon class="h-4 w-4 shrink-0 text-slate-400" />
            <span class="min-w-0 flex-1 truncate text-sm text-slate-800">
              {{ file.name }}
            </span>
            <span class="font-mono-num shrink-0 text-xs text-slate-500">
              {{ formatFileSize(file) }}
            </span>
            <button
              type="button"
              class="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              @click="removeDocument(i)"
            >
              <TrashIcon class="h-3.5 w-3.5" />
            </button>
          </li>
        </ul>

        <label
          class="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-4 text-center transition hover:border-slate-400 hover:bg-slate-100"
        >
          <PaperclipIcon class="h-4 w-4 text-slate-400" />
          <span class="text-sm font-medium text-slate-600">
            Attach documents — PDF, DOCX, XLSX, KML
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.kml,.kmz"
            multiple
            class="sr-only"
            @change="onDocumentsSelected"
          />
        </label>
      </section>

      <div>
        <Label for="f-description">Description</Label>
        <Textarea id="f-description" v-model="form.description" :rows="3" />
      </div>

      <p v-if="submitError" class="rounded-lg bg-red-50 p-3 text-xs text-red-600">{{ submitError }}</p>
    </form>

    <template #footer>
      <Button variant="secondary" @click="requestClose" class="rounded-xl border border-red-600 bg-red-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md">
        Cancel
      </Button>
      <Button :disabled="isSubmitting" @click="handleSubmit" class="rounded-xl border border-blue-600 bg-blue-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md">
        {{ isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Add to inventory' }}
      </Button>
    </template>
  </Modal>

  <!--
    Nested confirmation. `Modal` teleports to <body> at the same z-index, so
    mounting this second instance puts it later in the DOM and it paints on
    top of the form. Its own backdrop swallows clicks, so the form underneath
    cannot be dismissed while this is open.
  -->
  <Modal
    :open="showDiscardConfirm"
    title="Discard unsaved changes?"
    description="Anything you have entered will be lost. This cannot be undone."
    width-class="max-w-sm"
    @close="showDiscardConfirm = false"
  >
    <p class="text-sm text-slate-600">
      To keep working, close this and choose <span class="font-medium">Keep editing</span>.
    </p>

    <template #footer>
      <Button
        variant="secondary"
        @click="showDiscardConfirm = false"
        class="rounded-xl"
      >
        Keep editing
      </Button>
      <Button
        @click="confirmDiscard"
        class="rounded-xl border border-red-600 bg-red-600 text-white hover:bg-red-700"
      >
        Discard changes
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  File as FileIcon,
  FileArchive,
  FileCode2,
  FileSpreadsheet,
  FileTextIcon,
  Presentation,
  XIcon, 
  PlusIcon, 
  MapPinIcon, 
  RouteIcon, 
  ShapesIcon,
} from 'lucide-vue-next'
import { useAssetsStore } from '../../stores/assets.ts'
import { useAuthStore } from '../../stores/auth.ts'
import type { Asset } from '../../types/asset.ts'  
import { assetApi } from '../../services/api/asset.api.ts'
import { fiberCableApi } from '../../services/api/fiber-cable.api.ts'  
import { referenceDataApi } from '../../services/api/reference-data.api.ts'
import type { CableType, CableCoreCount, InstallationMethod, FiberSegmentType } from '../../types/reference-data.ts'
import Modal from '../ui/Modal.vue'
import Button from '../ui/button.vue'
import Input from '../ui/input.vue'
import Label from '../ui/label.vue'
import Select from '../ui/Select.vue'
import Textarea from '../ui/Textarea.vue'
import FiberCableField from './form-sections/FiberCableField.vue'
import TowerField from './form-sections/TowerField.vue'
import SpliceClosureField from './form-sections/SpliceClosureField.vue'
import LcpField from './form-sections/LcpField.vue'
// import PickableMap from '../map/PickableMap.vue'
import type { ConnectableAssetOption } from '@/types/site'
import { fetchAllPointAssets } from '@/services/api/sites.api.ts'
import { buildFiberCablePayload, buildTowerPayload, buildGenericPayload, buildTowerPatchPayload, buildSpliceClosurePayload, buildSpliceClosurePatchPayload, buildLcpPayload, buildLcpPatchPayload } from '@/utils/assetFormPayload.ts'

const props = defineProps<{
  open: boolean
  asset?: Asset | null 
}>()

const emit = defineEmits<{
  close: []
  saved: [{ isEdit: boolean }]
}>()

const store = useAssetsStore()
const auth = useAuthStore()

const isEditMode = computed(() => !!props.asset)
const isAdmin = computed(() => auth.user?.roleName === 'ADMIN')

const isSubmitting = ref(false)
const submitError = ref('')

const cableTypes = ref<CableType[]>([])
const coreCounts = ref<CableCoreCount[]>([])
const installationMethods = ref<InstallationMethod[]>([])
const segmentTypes = ref<FiberSegmentType[]>([])

const isFiberCable = computed(() => {
  const type = store.assetTypes.find((t: { id: string }) => t.id === form.asset_type_id)
  return type?.name === 'Fiber Cable'
})

const isTower = computed(() => {
  const t = store.assetTypes.find((x) => x.id === form.asset_type_id)
  return t?.name === 'Tower'
})

const isClosure = computed(() => {
  const t = store.assetTypes.find((x) => x.id === form.asset_type_id)
  return t?.name === 'Closure'
})

const isLcp = computed(() => {
  const t = store.assetTypes.find((x) => x.id === form.asset_type_id)
  return t?.name === 'LCP'
})

// Read-only display in edit mode, since the type cannot be changed.
const selectedTypeName = computed(
  () =>
    store.assetTypes.find((x) => x.id === form.asset_type_id)?.name ??
    props.asset?.assetType?.name ??
    '—',
)

// No update endpoint accepts `siteId`, so it is locked whenever editing.
const selectedSiteName = computed(
  () =>
    store.sites.find((s) => s.id === form.site_id)?.name ??
    props.asset?.siteId ??
    '—',
)
// Map logic is frozen for this phase.
// const mapPreviewEl = ref<{ flyToLocation: (coordinates: [number, number], zoom: number) => void } | null>(null)

const emptyForm = () => ({
  name: '',
  asset_tag: '',
  code: '',
  serial_number: '',
  asset_type_id: '',
  status_id: '',
  condition_id: '',
  manufacturer_id: '',
  asset_model_id: '',
  vendor_id: '',
  project_id: '',
  maintenance_contract_id: '',
  purchase_date: '',
  installation_date: '',
  noWarranty: false,
  warranty_start: '',
  warranty_end: '',
  site_id: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  warehouse_location: '',
  description: '',
  photos: [] as File[],
  documents: [] as File[],

  cableTypeId: '',
  coreCountId: '',
  installationMethodId: '',
  segmentTypeId: '',
  startAssetId: '',
  endAssetId: '',

  // closure
  closureType: null as string | null,
  capacity: null as number | null,
  containerAssetId: undefined as string | null | undefined,

  // lcp
  splitterCapacity: null as number | null,

  // tower
  heightM: null as number | null,
  foundation: '',
  maximumLoad: null as number | null,
  occupiedSpace: null as number | null,
  availableSpace: null as number | null,
  owner: '',
  power: '',
  generator: false,
  battery: false,
  gps: false,
  leaseExpiry: '' as string | null,
})

const form = reactive(emptyForm())

// Map geometry is frozen for this phase.
// const markerPosition = computed<[number, number] | null>(() =>
//   form.longitude !== undefined && form.latitude !== undefined ? [form.longitude, form.latitude] : null
// )
//
// const selectedGeometryType = computed<string>(() => 'Point')
//
// const mapInstructionText = computed(() => {
//   switch (selectedGeometryType.value) {
//     case 'LineString':
//       return 'Click to add points along the route'
//     case 'Polygon':
//       return 'Click to add vertices for the area'
//     default:
//       return 'Click to set the asset location'
//   }
// })
//
// const pointCountLabel = computed(() => {
//   switch (selectedGeometryType.value) {
//     case 'LineString':
//       return 'Route'
//     case 'Polygon':
//       return 'Area'
//     default:
//       return '1 point'
//   }
// })

const selectedGeometryType = computed(() =>
  store.assetTypes.find((t: { id: string }) => t.id === form.asset_type_id)?.geometryType
)

const minPoints = computed(() => {
  if (selectedGeometryType.value === 'Polygon') return 3
  if (selectedGeometryType.value === 'LineString') return 2
  return 1
})

const minPointsLabel = computed(() => {
  if (selectedGeometryType.value === 'Polygon') return 'At least 3 points required'
  if (selectedGeometryType.value === 'LineString') return 'At least 2 points required'
  return 'Exactly 1 point'
})

const geometryModeBadge = computed(() => {
  switch (selectedGeometryType.value) {
    case 'LineString':
      return { label: 'Line mode', icon: RouteIcon, color: 'bg-blue-50 text-blue-700' }
    case 'Polygon':
      return { label: 'Area mode', icon: ShapesIcon, color: 'bg-purple-50 text-purple-700' }
    default:
      return { label: 'Point mode', icon: MapPinIcon, color: 'bg-emerald-50 text-emerald-700' }
  }
})

const manualPoints = reactive<{ lat: number | null; lng: number | null }[]>([{ lat: null, lng: null }])

// For fiber cables the first and last points come from the selected endpoint
// assets, so they are locked to guarantee the backend geometry check passes.
const isCableEndpointRow = (i: number) =>
  isFiberCable.value && (i === 0 || i === manualPoints.length - 1)

// True when the first and last rows are locked to the endpoint assets, so the
// form should explain that intermediate points belong between them.
const hasLockedEndpoints = computed(
  () => isFiberCable.value && selectedGeometryType.value === 'LineString',
)

function addPoint() {
  // For a fiber cable the last row is the END asset's locked geometry, so a
  // new intermediate point is inserted *before* it rather than appended. That
  // keeps the end point at index `length - 1` where it stays locked.
  if (isFiberCable.value && manualPoints.length > 1) {
    manualPoints.splice(manualPoints.length - 1, 0, { lat: null, lng: null })
    return
  }
  manualPoints.push({ lat: null, lng: null })
}

function removePoint(index: number) {
  if (manualPoints.length > minPoints.value) {
    manualPoints.splice(index, 1)
  }
}

watch(selectedGeometryType, (newType, oldType) => {
  if (!props.open) return
  if (!newType) return

  if (props.asset?.geometry) return

  const count = minPoints.value  
  manualPoints.splice(
    0,
    manualPoints.length,
    ...Array.from({ length: count }, () => ({ lat: null, lng: null })),
  )
})

function buildGeometryFromManualPoints(): { type: string; coordinates: any } | null {
  const complete = manualPoints.every((p) => p.lat != null && p.lng != null)
  if (!complete) return null

  const coords = manualPoints.map((p) => [p.lng as number, p.lat as number])

  if (selectedGeometryType.value === 'LineString') {
    return { type: 'LineString', coordinates: coords }
  }
  if (selectedGeometryType.value === 'Polygon') {
    return { type: 'Polygon', coordinates: [[...coords, coords[0]]] } 
  }
  return { type: 'Point', coordinates: coords[0] }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      // Closed: drop any pending prompt, free preview URLs, and treat the
      // current state as the new baseline so the next open starts clean.
      showDiscardConfirm.value = false
      releasePreviewUrls()
      initialFingerprint.value = formFingerprint()
      return
    }

    isLoading.value = true
    submitError.value = ''
    Object.assign(form, emptyForm())

    // Baseline immediately, so the async loads below are not compared against
    // the previous session's snapshot.
    initialFingerprint.value = formFingerprint()

    try {
      const [types, counts, methods, segments] = await Promise.all([
        referenceDataApi.getCableTypes(),
        referenceDataApi.getCableCoreCounts(),
        referenceDataApi.getInstallationMethods(),
        referenceDataApi.getFiberSegmentTypes(),
      ])
      cableTypes.value = types.data
      coreCounts.value = counts.data
      installationMethods.value = methods.data
      segmentTypes.value = segments.data
    } catch (e) {
      console.error('Failed to load fiber reference data', e)
    }

    // The per-type detail fetch below is the only part that can still throw
    // uncaught, so this block is what guarantees `isLoading` is released.
    try {
      if (props.asset) {
      Object.assign(form, {
        name: props.asset.name,
        asset_tag: props.asset.assetTag ?? '',
        code: props.asset.code,
        serial_number: props.asset.serialNumber ?? '',
        asset_type_id: props.asset.assetTypeId,
        status_id: props.asset.statusId,
        condition_id: props.asset.conditionId ?? '',
        manufacturer_id: props.asset.manufacturerId ?? '',
        asset_model_id: props.asset.assetModelId ?? '',
        vendor_id: props.asset.vendorId ?? '',
        project_id: props.asset.projectId ?? '',
        maintenance_contract_id: props.asset.maintenanceContractId ?? '',
        purchase_date: props.asset.purchaseDate ?? '',
        installation_date: props.asset.installationDate ?? '',
        warranty_start: props.asset.warrantyStart ?? '',
        warranty_end: props.asset.warrantyEnd ?? '',
        site_id: props.asset.siteId ?? '',
        latitude: props.asset.latitude,
        longitude: props.asset.longitude,
        description: props.asset.description ?? '',
      })

      if (props.asset.manufacturerId) {
        await store.loadAssetModels(props.asset.manufacturerId)
      }

      if (props.asset.geometry) {
        const geom = props.asset.geometry

        if (geom.type === 'Point') {
          manualPoints.splice(0, manualPoints.length, {
            lng: geom.coordinates[0],
            lat: geom.coordinates[1],
          })
        } else if (geom.type === 'LineString') {
          manualPoints.splice(
            0,
            manualPoints.length,
            ...geom.coordinates.map(([lng, lat]: number[]) => ({ lng, lat }))
          )
        } else if (geom.type === 'Polygon') {
          const ring = geom.coordinates[0].slice(0, -1)
          manualPoints.splice(
            0,
            manualPoints.length,
            ...ring.map(([lng, lat]: number[]) => ({ lng, lat }))
          )
        }
      } else {
        manualPoints.splice(
          0,
          manualPoints.length,
          ...Array.from({ length: minPoints.value }, () => ({ lat: null, lng: null }))
        )
      }

      const typeName = store.assetTypes.find((t) => t.id === props.asset!.assetTypeId)?.name ?? props.asset.assetType?.name
      if (typeName === 'Fiber Cable') {

        await loadConnectableOptions()

        try {
          const detail = await fiberCableApi.getDetail(props.asset.id)
          const fc = detail.fiberCable

          form.cableTypeId = fc.cableType?.id ?? ''
          form.coreCountId = fc.coreCount?.id ?? ''
          form.installationMethodId = fc.installationMethod?.id ?? ''
          form.segmentTypeId = fc.segmentType?.id ?? ''

          form.startAssetId = detail.start.target.asset?.id ?? ''
          form.endAssetId = detail.end.target.asset?.id ?? ''

          syncStartEndSearchLabels()
        } catch (e) {
          console.error('Failed to load fiber cable for edit', e)
        }
      }

      if (typeName === 'Tower') {
        const detail = await assetApi.getTower(props.asset.id)

        Object.assign(form, {
          heightM: detail.heightM ?? null,
          foundation: detail.foundation ?? '',
          maximumLoad: detail.maximumLoad ?? null,
          occupiedSpace: detail.occupiedSpace ?? null,
          availableSpace: detail.availableSpace ?? null,
          owner: detail.owner ?? '',
          power: detail.power ?? '',
          generator: !!detail.generator,
          battery: !!detail.battery,
          gps: !!detail.gps,
          leaseExpiry: detail.leaseExpiry ?? '',
        })
      }

      if (typeName === 'Closure') {
        try {
          const detail = await assetApi.getSpliceClosure(props.asset.id)

          Object.assign(form, {
            closureType: detail.closureType ?? null,
            capacity: detail.capacity ?? null,
            // Kept so saving without touching the field preserves it.
            containerAssetId: detail.containerAssetId ?? null,
          })
        } catch (e) {
          console.error('Failed to load splice closure for edit', e)
        }
      }

      if (typeName === 'LCP') {
        try {
          const detail = await assetApi.getLcp(props.asset.id)

          Object.assign(form, {
            splitterCapacity: detail.splitterCapacity ?? null,
          })
        } catch (e) {
          console.error('Failed to load LCP for edit', e)
        }
      }
      }

      // Everything has finished loading, so this is the baseline. Any later
      // edit makes `isDirty` true.
      initialFingerprint.value = formFingerprint()
    } finally {
      // Always released, even if a detail request throws, otherwise the guard
      // would stay permanently disabled for this session.
      isLoading.value = false
    }
  }
)

// This secion is for connectable assets search for each site
const allConnectableAssets = ref<ConnectableAssetOption[]>([])
const loadingConnectableAssets = ref(false)
const startAssetSearch = ref('')
const endAssetSearch = ref('')
const showStartList = ref(false)
const showEndList = ref(false)

async function loadConnectableOptions() {
  if (allConnectableAssets.value.length > 0) return
  loadingConnectableAssets.value = true
  try {
    allConnectableAssets.value = await fetchAllPointAssets(
      props.asset?.id,
    )
  } finally {
    loadingConnectableAssets.value = false
  }
}

async function onStartFocus() {
  showStartList.value = true
  if (!allConnectableAssets.value.length) {
    await loadConnectableOptions()
  }
}

async function onEndFocus() {
  showEndList.value = true
  if (!allConnectableAssets.value.length) {
    await loadConnectableOptions()
  }
}

function onStartKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') showStartList.value = false
}

function onEndKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') showEndList.value = false
}

function assetMatches(a: ConnectableAssetOption, q: string) {
  if (!q) return true
  const s = q.toLowerCase()
  return (
    a.name.toLowerCase().includes(s) ||
    (a.code?.toLowerCase().includes(s) ?? false) ||
    (a.assetTag?.toLowerCase().includes(s) ?? false) ||
    a.siteName.toLowerCase().includes(s)
  )
}

const filteredStartAssets = computed(() =>
  allConnectableAssets.value.filter((a) =>
    assetMatches(a, startAssetSearch.value.trim()),
  ),
)

const filteredEndAssets = computed(() =>
  allConnectableAssets.value.filter((a) =>
    assetMatches(a, endAssetSearch.value.trim()),
  ),
)

// The backend requires the LineString's first point to equal the START target's
// geometry, and (by symmetry) its last point to equal the END target's. Copying
// the coordinates straight from the asset guarantees an exact match.
function applyAssetGeometry(index: number, a: ConnectableAssetOption) {
  if (a.lat == null || a.lng == null) return

  while (manualPoints.length <= index) {
    manualPoints.push({ lat: null, lng: null })
  }
  manualPoints[index] = { lat: a.lat, lng: a.lng }
}

function pickStartAsset(a: ConnectableAssetOption) {
  form.startAssetId = a.id
  startAssetSearch.value = a.name
  showStartList.value = false
  applyAssetGeometry(0, a)
}

function pickEndAsset(a: ConnectableAssetOption) {
  form.endAssetId = a.id
  endAssetSearch.value = a.name
  showEndList.value = false
  // Index 0 always belongs to the start asset, so the end point can never
  // overwrite it even if the array has not been resized yet.
  applyAssetGeometry(Math.max(manualPoints.length - 1, 1), a)
}

function syncStartEndSearchLabels() {
  const s = allConnectableAssets.value.find((a) => a.id === form.startAssetId)
  const e = allConnectableAssets.value.find((a) => a.id === form.endAssetId)
  startAssetSearch.value = s?.name ?? startAssetSearch.value
  endAssetSearch.value = e?.name ?? endAssetSearch.value
}

watch(
  () => props.asset?.assetTypeId,
  async (id) => {
    const name = store.assetTypes.find((t) => t.id === id)?.name
    if (name === 'Fiber Cable') {
      await loadConnectableOptions()
      syncStartEndSearchLabels()
    }
  },
)

function onStartInput() {
  showStartList.value = true
  form.startAssetId = '' 
}

function onEndInput() {
  showEndList.value = true
  form.endAssetId = ''
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('[data-start-asset-combo]')) {
    showStartList.value = false
  }
  if (!target.closest('[data-end-asset-combo]')) {
    showEndList.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  releasePreviewUrls()
})

// Map location follow-up is frozen for this phase.
// watch(
//   () => form.site_id,
//   (siteId) => {
//     const site = store.sites.find((s) => s.id === siteId) as
//       | ({ geometry?: { type?: string; coordinates?: [number, number] } } & { id: string; name: string })
//       | undefined
//
//     if (site?.geometry?.type === 'Point' && site.geometry.coordinates) {
//       // mapPreviewEl.value?.flyToLocation(site.geometry.coordinates, 12)
//     }
//   }
// )

async function onManufacturerChange() {
  form.asset_model_id = ''
  if (form.manufacturer_id) {
    await store.loadAssetModels(form.manufacturer_id)
  }
}

// Map click-to-pick is frozen for this phase.
// function onLocationPicked({ lng, lat }: { lng: number; lat: number }) {
//   form.longitude = lng
//   form.latitude = lat
// }

function onPhotosSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) form.photos.push(...Array.from(input.files))
  input.value = ''
}

function onDocumentsSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) form.documents.push(...Array.from(input.files))
  input.value = ''
}

const previewMap = new Map<string, string>()

function getPreviewUrl(file: File) {
  const key = `${file.name}-${file.size}-${file.lastModified}`
  if (!previewMap.has(key)) {
    previewMap.set(key, URL.createObjectURL(file))
  }
  return previewMap.get(key)
}

// Object URLs live for the lifetime of the document unless revoked, so an
// abandoned form would leak every preview it ever created.
function releasePreviewUrls() {
  for (const url of previewMap.values()) URL.revokeObjectURL(url)
  previewMap.clear()
}

// ---------- Unsaved changes guard ----------

const showDiscardConfirm = ref(false)

// True while the open handler is still populating the form. The code below
// rewrites dozens of fields, and none of that is a user edit.
const isLoading = ref(false)

/**
 * A cheap snapshot of everything the user can edit. `File` objects do not
 * serialise, so they are reduced to a name/size/timestamp key instead.
 */
function formFingerprint(): string {
  const fileKey = (f: File) => `${f.name}:${f.size}:${f.lastModified}`

  return JSON.stringify({
    ...form,
    photos: form.photos.map(fileKey),
    documents: form.documents.map(fileKey),
    manualPoints,
  })
}

// Set once the form has finished loading, so edits made afterwards count.
const initialFingerprint = ref('')

const isDirty = computed(
  () => !isLoading.value && formFingerprint() !== initialFingerprint.value,
)

/**
 * Single entry point for every way of leaving the form. Closing a pristine
 * form must never prompt — that is what makes these guards get ignored.
 */
function requestClose() {
  if (!isDirty.value) {
    showDiscardConfirm.value = false
    emit('close')
    return
  }
  showDiscardConfirm.value = true
}

function confirmDiscard() {
  showDiscardConfirm.value = false
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return

  if (showDiscardConfirm.value) {
    showDiscardConfirm.value = false
    return
  }
  if (props.open) requestClose()
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (!props.open || !isDirty.value) return
  e.preventDefault()
  e.returnValue = ''
}

function formatFileSize(file: File) {
  const size = file.size ?? 0
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function getFileExtension(file: File) {
  const extension = file.name.split('.').pop()?.toUpperCase()
  return extension && extension.length <= 5 ? extension : 'FILE'
}

function getFileTypeLabel(file: File) {
  const extension = getFileExtension(file)
  return `${extension} document`
}

function getFileIcon(file: File) {
  const extension = getFileExtension(file)

  if (extension === 'PDF') return FileTextIcon
  if (['DOC', 'DOCX', 'ODT', 'RTF'].includes(extension)) return FileTextIcon
  if (['XLS', 'XLSX', 'CSV', 'ODS'].includes(extension)) return FileSpreadsheet
  if (['PPT', 'PPTX', 'ODP'].includes(extension)) return Presentation
  if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(extension)) return FileArchive
  if (['JS', 'TS', 'JSON', 'HTML', 'CSS', 'XML'].includes(extension)) return FileCode2

  return FileIcon
}

function getFileIconClass(file: File) {
  const extension = getFileExtension(file)

  if (extension === 'PDF') return 'border-red-200 bg-red-50 text-red-600'
  if (['DOC', 'DOCX', 'ODT', 'RTF'].includes(extension)) return 'border-blue-200 bg-blue-50 text-blue-600'
  if (['XLS', 'XLSX', 'CSV', 'ODS'].includes(extension)) return 'border-emerald-200 bg-emerald-50 text-emerald-600'
  if (['PPT', 'PPTX', 'ODP'].includes(extension)) return 'border-orange-200 bg-orange-50 text-orange-600'
  if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(extension)) return 'border-amber-200 bg-amber-50 text-amber-600'

  return 'border-slate-200 bg-slate-100 text-slate-500'
}

function removePhoto(index: number) {
  const file = form.photos[index]
  if (file) {
    const key = `${file.name}-${file.size}-${file.lastModified}`
    const url = previewMap.get(key)
    if (url) {
      URL.revokeObjectURL(url)
      previewMap.delete(key)
    }
  }
  form.photos.splice(index, 1)
}

function removeDocument(index: number) {
  form.documents.splice(index, 1)
}

async function handleSubmit() {
  submitError.value = ''
  const validationError = validateRequiredFields()
  if (validationError) {
    submitError.value = validationError
    return
  }

  isSubmitting.value = true
  const wasEdit = isEditMode.value

  try {
    const geometry = buildGeometryFromManualPoints()
    if (!geometry) {
      submitError.value = 'Please fill in all coordinate fields.'
      return
    }

    const typeName = store.assetTypes.find(
      (t: { id: string }) => t.id === form.asset_type_id,
    )?.name

    // ---------- FIBER CABLE ----------
    if (typeName === 'Fiber Cable') {
      const payload = buildFiberCablePayload(
        form,
        geometry as { type: 'LineString'; coordinates: [number, number][] },
      )

      if (wasEdit && props.asset) {
        await fiberCableApi.update(props.asset.id, payload)
      } else {
        await fiberCableApi.create(payload)
      }
    }

    // ---------- TOWER ----------
    else if (typeName === 'Tower') {

      if (wasEdit && props.asset) {
        const payload = buildTowerPatchPayload(form)
        await assetApi.updateTower(props.asset.id, payload)
      } else {
        const payload = buildTowerPayload(
          form,
          geometry as { type: 'Point'; coordinates: [number, number] },
        )
        await assetApi.createTower(payload)
      }
      
    }

    // ---------- SPLICE CLOSURE ----------
    else if (typeName === 'Closure') {

      if (wasEdit && props.asset) {
        const payload = buildSpliceClosurePatchPayload(
          form,
          geometry as { type: 'Point'; coordinates: [number, number] },
        )
        await assetApi.updateSpliceClosure(props.asset.id, payload)
      } else {
        const payload = buildSpliceClosurePayload(
          form,
          geometry as { type: 'Point'; coordinates: [number, number] },
        )
        await assetApi.createSpliceClosure(payload)
      }

    }

    // ---------- LCP ----------
    else if (typeName === 'LCP') {

      if (wasEdit && props.asset) {
        const payload = buildLcpPatchPayload(
          form,
          geometry as { type: 'Point'; coordinates: [number, number] },
        )
        await assetApi.updateLcp(props.asset.id, payload)
      } else {
        const payload = buildLcpPayload(
          form,
          geometry as { type: 'Point'; coordinates: [number, number] },
        )
        await assetApi.createLcp(payload)
      }

    }

    // ---------- GENERIC ----------
    else {
      const payload = buildGenericPayload(form, geometry, wasEdit)

      if (wasEdit && props.asset) {
        await store.updateAsset(props.asset.id, payload)
      } else {
        await store.addAsset(payload)
      }
    }

    emit('saved', { isEdit: wasEdit })
    emit('close')
  } catch (err) {
    submitError.value = 'Could not save this asset. Please try again.'
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

function validateRequiredFields(): string | null {
  if (!form.name) return 'Name is required.'
  if (!form.asset_type_id) return 'Asset Type is required.'
  if (!isEditMode.value && !form.status_id) return 'Status is required.'
  if (!isEditMode.value && (isFiberCable.value || isTower.value || isClosure.value || isLcp.value) && !form.condition_id) {
    return 'Condition is required.'
  }
  if (isFiberCable.value) {
    if (!form.cableTypeId) return 'Cable Type is required.'
    if (!form.coreCountId) return 'Core Count is required.'
    if (!form.installationMethodId) return 'Installation Method is required.'
    // `CreateFiberCableDto` marks segmentTypeId as a required UUID.
    if (!form.segmentTypeId) return 'Segment Type is required.'
    if (!form.startAssetId) return 'Start Asset is required.'
    if (!form.endAssetId) return 'End Asset is required.'
  }
  if (isLcp.value && !form.splitterCapacity) {
    return 'Splitter Capacity is required.'
  }
  if (!buildGeometryFromManualPoints()) return 'Please fill in all coordinate fields.'
  return null
}
// Map geometry icon logic is frozen for this phase.
// const geometryIcon = computed(() => {
//   switch (selectedGeometryType.value) {
//     case 'LineString': return RouteIcon
//     case 'Polygon': return PentagonIcon
//     default: return MapPinIcon
//   }
// })
</script>