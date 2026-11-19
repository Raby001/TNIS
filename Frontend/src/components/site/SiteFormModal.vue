<template>
  <Modal
    :open="open"
    :title="isEdit ? `Edit site · ${site?.code ?? ''}` : 'Add site'"
    :description="
      isEdit
        ? 'Update the site record. Changes are written to the audit log.'
        : 'Register a new physical site and attach supporting photos and documents.'
    "
    width-class="max-w-6xl"
    @close="$emit('close')"
  >
    <form class="space-y-6" @submit.prevent="submit">
      <!-- Basic info -->
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Site name <span class="text-red-500">*</span>
          </label>
          <Input variant="asset" v-model="draft.name" placeholder="e.g. Kampot Road 33 Cabinet" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Site code
          </label>
          <Input
            variant="asset"
            v-model="draft.code"
            placeholder="e.g. KPT-CB-04"
            class="font-mono-num"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Site type
          </label>
          <Select variant="asset" v-model="draft.type">
            <option value="">Select type</option>
            <option v-for="t in siteTypes" :key="t" :value="t">{{ t }}</option>
          </Select>
        </div>

        <div class="relative">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            City <span class="text-red-500">*</span>
          </label>

          <div ref="cityWrapperRef" class="relative">
            <Input
              v-model="citySearch"
              variant="asset"
              :placeholder="loadingCities ? 'Loading cities…' : 'Search city or province…'"
              class="pr-8"
              :disabled="loadingCities"
              @focus="showCityDropdown = true"
              @input="showCityDropdown = true"
            />

            <!-- Clear button -->
            <button
              v-if="draft.cityId || citySearch"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              @click="clearCity"
            >
              ×
            </button>
          </div>

          <!-- Dropdown list -->
          <div
            ref="cityDropdownRef"
            v-if="showCityDropdown && !loadingCities"
            class="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            <button
              v-for="city in filteredCities"
              :key="city.id"
              type="button"
              class="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-slate-50"
              :class="draft.cityId === city.id ? 'bg-sky-50 text-sky-700' : 'text-slate-700'"
              @click="selectCity(city)"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium">{{ city.name }}</p>
                <p v-if="city.province" class="truncate text-xs text-slate-500">
                  {{ city.province.name }}
                </p>
              </div>
              <span class="ml-2 shrink-0 text-xs text-slate-400">{{ city.code }}</span>
            </button>

            <div
              v-if="filteredCities.length === 0"
              class="px-3 py-2 text-sm text-slate-400"
            >
              No city found
            </div>
          </div>
        </div>
      </section>

      <!-- Location -->
      <section class="grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Address <span class="text-red-500">*</span>
          </label>
          <Input
            variant="asset"
            v-model="draft.address"
            placeholder="Street, commune, district"
          />
        </div>

        <div class="grid grid-cols-2 gap-3 sm:col-span-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">
              Latitude <span class="text-red-500">*</span>
            </label>
            <Input
              variant="asset"
              v-model="draft.latitude"
              placeholder="11.5564"
              class="font-mono-num"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">
              Longitude <span class="text-red-500">*</span>
            </label>
            <Input
              variant="asset"
              v-model="draft.longitude"
              placeholder="104.9282"
              class="font-mono-num"
            />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Elevation (m)
          </label>
          <Input
            variant="asset"
            v-model="draft.elevation"
            type="number"
            step="0.1"
            placeholder="18.5"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            v-model="draft.description"
            rows="3"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500/30"
            placeholder="Access instructions, notes…"
          />
        </div>
      </section>

      <!-- Photos -->
      <section class="border-t border-slate-200 pt-5">
        <div class="flex items-baseline justify-between">
          <h3 class="text-sm font-semibold text-slate-900">Photos</h3>
          <span class="text-xs text-slate-500">{{ photos.length }} attached</span>
        </div>

        <div class="mt-3 flex flex-wrap gap-2.5">
          <figure
            v-for="photo in photos"
            :key="photo.id"
            class="group relative h-24 w-32 overflow-hidden rounded-lg border border-slate-200"
          >
            <img
              :src="photo.url"
              :alt="photo.name"
              class="h-full w-full object-cover"
            />
            <button
              type="button"
              class="absolute right-1 top-1 rounded-md bg-slate-900/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              @click="removeAttachment(photo.id!)"
            >
              <XIcon class="h-3.5 w-3.5" />
            </button>
            <figcaption
              class="absolute inset-x-0 bottom-0 truncate bg-slate-900/70 px-1.5 py-1 text-[10px] text-white"
            >
              {{ photo.name }}
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
              @change="onFileChange($event, 'photo')"
            />
          </label>
        </div>
      </section>

      <!-- Documents -->
      <section class="border-t border-slate-200 pt-5">
        <div class="flex items-baseline justify-between">
          <h3 class="text-sm font-semibold text-slate-900">Documents</h3>
          <span class="text-xs text-slate-500">{{ documents.length }} attached</span>
        </div>

        <ul class="mt-3 space-y-2">
          <li
            v-for="doc in documents"
            :key="doc.id"
            class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5"
          >
            <FileTextIcon class="h-4 w-4 shrink-0 text-slate-400" />
            <span class="min-w-0 flex-1 truncate text-sm text-slate-800">
              {{ doc.name }}
            </span>
            <span class="font-mono-num shrink-0 text-xs text-slate-500">
              {{ doc.size ?? '' }}
            </span>
            <button
              type="button"
              class="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              @click="removeAttachment(doc.id!)"
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
            @change="onFileChange($event, 'document')"
          />
        </label>
      </section>
    </form>

    <template #footer>
      <Button variant="secondary" @click="$emit('close')" class="rounded-xl border border-red-600 bg-red-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md">Cancel</Button>
      <Button
        :disabled="!canSubmit || saving"
        @click="submit"
        class="rounded-xl border border-blue-600 bg-blue-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
      >
        {{ saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create site' }}
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  FileTextIcon,
  ImagePlusIcon,
  PaperclipIcon,
  TrashIcon,
  XIcon,
} from 'lucide-vue-next'

import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Select from '@/components/ui/Select.vue'

import { useSitesStore } from '@/stores/sites'
import type { Site, SiteAttachment } from '@/types/site'

import { referenceDataApi } from '@/services/api/reference-data.api'
import type { City } from '@/types/reference-data'

const props = defineProps<{
  open: boolean
  site: Site | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useSitesStore()
const saving = ref(false)

type ModalAttachment = SiteAttachment & { size?: string }

const isEdit = computed(() => !!props.site)

const siteTypes = ['Exchange', 'Tower', 'Cabinet', 'Chamber', 'POP', 'Street Cabinet']

const emptyDraft = () => ({
  code: '',
  name: '',
  type: '',
  cityId: '',
  address: '',
  latitude: '',
  longitude: '',
  elevation: '',
  description: '',
})

const draft = reactive(emptyDraft())
const attachments = ref<ModalAttachment[]>([])

let attachmentSeq = 100

watch(
  () => [props.open, props.site],
  () => {
    if (!props.open) return

    if (props.site) {
      Object.assign(draft, {
        code: props.site.code ?? '',
        name: props.site.name,
        type: props.site.type ?? '',
        cityId: props.site.cityId,
        address: props.site.address ?? '',
        latitude: String(props.site.latitude ?? ''),
        longitude: String(props.site.longitude ?? ''),
        elevation: props.site.elevation != null ? String(props.site.elevation) : '',
        description: props.site.description ?? '',
      })
      attachments.value = [...(props.site.attachments ?? [])]
    } else {
      Object.assign(draft, emptyDraft())
      attachments.value = []
    }
  },
  { immediate: true },
)

const photos = computed(() => attachments.value.filter((a) => a.kind === 'photo'))
const documents = computed(() => attachments.value.filter((a) => a.kind === 'document'))

const canSubmit = computed(() => {
  return (
    draft.name.trim() &&
    draft.cityId.trim() &&
    draft.address.trim() &&
    draft.latitude.trim() &&
    draft.longitude.trim()
  )
})

function onFileChange(event: Event, kind: 'photo' | 'document') {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files) return

  const next: SiteAttachment[] = Array.from(files).map((file) => ({
    id: `AT-${attachmentSeq++}`,
    name: file.name,
    kind,
    size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    url: kind === 'photo' ? URL.createObjectURL(file) : '',
  }))

  attachments.value.push(...next)
  input.value = ''
}

function removeAttachment(id: string) {
  attachments.value = attachments.value.filter((a) => a.id !== id)
}

async function submit() {
  if (!canSubmit.value) return

  saving.value = true
  try {
    if (isEdit.value && props.site) {
      // ---------- UPDATE (PATCH) ----------
      const payload = {
        name: draft.name.trim(),
        address: draft.address.trim(),
        elevation: draft.elevation ? Number(draft.elevation) : undefined,
        description: draft.description.trim() || undefined,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            Number(draft.longitude),
            Number(draft.latitude),
          ] as [number, number],
        },
      }

      await store.updateSite(props.site.id, payload)
    } else {
      // ---------- CREATE (POST) ----------
      const payload = {
        cityId: draft.cityId,
        name: draft.name.trim(),
        address: draft.address.trim(),
        elevation: draft.elevation ? Number(draft.elevation) : undefined,
        description: draft.description.trim() || undefined,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            Number(draft.longitude),
            Number(draft.latitude),
          ] as [number, number],
        },
      }

      await store.createSite(payload)
    }

    emit('saved')
    emit('close')
  } catch (err) {
    console.error(err)
    alert('Failed to save site')
  } finally {
    saving.value = false
  }
}

// ---------- Cities ----------
const cities = ref<City[]>([])
const loadingCities = ref(false)
const citySearch = ref('')
const showCityDropdown = ref(false)

const filteredCities = computed(() => {
  const q = citySearch.value.toLowerCase().trim()
  if (!q) return cities.value

  return cities.value.filter((city) => {
    const cityName = city.name?.toLowerCase() ?? ''
    const cityCode = city.code?.toLowerCase() ?? ''
    const provinceName = city.province?.name?.toLowerCase() ?? ''
    const provinceCode = city.province?.name?.toLowerCase() ?? ''

    return (
      cityName.includes(q) ||
      cityCode.includes(q) ||
      provinceName.includes(q) ||
      provinceCode.includes(q)
    )
  })
})

async function loadCities() {
  loadingCities.value = true
  try {
    const res = await referenceDataApi.getCities()
    cities.value = (res as any).data ?? res ?? []
  } catch (err) {
    console.error('Failed to load cities', err)
    cities.value = []
  } finally {
    loadingCities.value = false
  }
}

function selectCity(city: City) {
  draft.cityId = city.id
  citySearch.value = city.province
    ? `${city.name} (${city.province.name})`
    : city.name
  showCityDropdown.value = false
}

function clearCity() {
  draft.cityId = ''
  citySearch.value = ''
}

// Load cities every time the modal opens
watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return 
    
    await loadCities()

    if (props.site?.cityId) {
      const city = cities.value.find((c) => c.id === props.site!.cityId)
      if (city) {
        citySearch.value = city.province
          ? `${city.name} (${city.province.name})`
          : city.name
      }
    } else {
      citySearch.value = ''
    }
  },
)

const cityWrapperRef = ref<HTMLElement | null>(null)
const cityDropdownRef = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  if (!showCityDropdown.value) return

  const target = event.target as Node
  if (
    (cityWrapperRef.value && cityWrapperRef.value.contains(target)) ||
    (cityDropdownRef.value && cityDropdownRef.value.contains(target))
  ) {
    return
  }

  showCityDropdown.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>