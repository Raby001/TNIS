<template>
  <div
    v-if="open && assetPointType && draftAssetPoint"
    class="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4 py-6"
    @click.self="handleCancel"
  >
    <div
      class="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between border-b border-slate-200 px-5 py-4"
      >
        <div>
          <p
            class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"
          >
            {{ isEditMode ? 'Edit Asset Point' : 'Create Asset Point' }}
          </p>

          <h2 class="mt-1 text-lg font-semibold text-slate-900">
            {{ assetPointTypeLabel }}
          </h2>
        </div>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Close"
          @click="handleCancel"
        >
          <X :size="19" />
        </button>
      </div>

      <!-- Form body -->
      <div class="flex-1 overflow-y-auto px-5 py-5">
        <div class="space-y-5">

          <!-- General Asset Information -->
          <AssetForm
            v-model="assetForm"
            :edit-mode="isEditMode"
          />

          <!-- Location -->
          <LocationForm
            v-model="locationForm"
          />

          <!-- Asset-specific information -->
          <section
            v-if="currentFormComponent"
            class="border-t border-slate-200 pt-5"
          >
            <div class="mb-4">
              <h3 class="text-sm font-semibold text-slate-800">
                {{ assetPointTypeLabel }} Information
              </h3>

              <p class="mt-0.5 text-xs text-slate-400">
                Information specific to this asset type.
              </p>
            </div>

            <component
              :is="currentFormComponent"
              v-model="assetSpecificFormModel"
              v-bind="
                assetPointType === 'onu'
                  ? {
                      searchResults: customerSearchResults,
                      editMode: isEditMode,
                    }
                  : {}
              "
              v-on="
                assetPointType === 'onu'
                  ? {
                      searchCustomers: handleCustomerSearch,
                    }
                  : {}
              "
            />
          </section>

        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3"
      >
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isSaving"
          @click="handleCancel"
        >
          Cancel
        </button>

        <button
          type="button"
          class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isSaving"
          @click="handleSave"
        >
          {{ isSaving
            ? (isEditMode ? 'Updating...' : 'Creating...')
            : `${isEditMode ? 'Update' : 'Create'} ${assetPointTypeLabel}`
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  reactive,
  ref,
  watch,
  type Component,
} from 'vue'

import { X } from 'lucide-vue-next'

import type {
  AssetPoint,
  AssetPointDraftState,
  AssetPointFormModel,
  AssetPointFormModelMap,
  AssetPointType,
  CreateAssetPointRequest,
} from '@/types/asset-point'

import type { AssetType } from '@/types/reference-data'
import type { AssetFormData } from '@/types/asset'
import type { Customer } from '@/types/customer'

import AssetForm from './forms/AssetForm.vue'
import LocationForm from './forms/LocationForm.vue'

import { assetApi } from '@/services/api/asset.api'
import { customerApi } from '@/services/api/customer.api'
import { fieldObservationApi } from '@/services/api/field-observation.api.ts'

import {
  assetPointFormComponents,
  createDefaultAssetForm,
} from '@/config/asset-point-form.config.ts'

import { useMapStore } from '@/stores/map.store.ts'

import { buildAssetPointDetails } from '@/services/mappers/asset-point-payload.mapper.ts'
import type { OnuAssetData } from '@/types/onu.ts'

interface Props {
  open: boolean
  assetPointType: AssetType | null
  draftAssetPoint: AssetPointDraftState | null
  editingAssetPoint?: AssetPoint | null
}

const props = defineProps<Props>()

const mapStore = useMapStore()

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'save'): void
}>()

const assetPointTypeKey = computed<AssetPointType | null>(() => {
  if (!props.assetPointType) {
    return null
  }

  return props.assetPointType.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') as AssetPointType
})

const assetPointType = computed(() => {
  return assetPointTypeKey.value
})

const assetPointTypeLabel = computed(() => {
  return props.assetPointType?.name ?? 'Asset Point'
})

const isEditMode = computed(() => {
  return !!props.editingAssetPoint
})

const currentFormComponent = computed<Component | null>(() => {
  const key = assetPointTypeKey.value

  if (!key) {
    return null
  }

  const component =
    assetPointFormComponents[
      key as keyof typeof assetPointFormComponents
    ]

  return component
    ? (component as Component)
    : null
})

const assetForm = reactive<AssetFormData>({
  assetTypeId: null,
  statusId: null,
  siteId: null,
  code: '',

  assetTag: '',
  serialNumber: null,

  name: '',
  description: '',

  purchaseDate: null,
  installationDate: null,
  warrantyStart: null,
  warrantyEnd: null,
})

const locationForm = reactive({
  latitude: 0,
  longitude: 0,
})

const assetSpecificForm =
  ref<AssetPointFormModel | null>(null)

const isSaving = ref(false)

const customerSearchResults =
  ref<Customer[]>([])

const assetSpecificFormModel = computed({
  get: () => assetSpecificForm.value,

  set: (value: AssetPointFormModel | null) => {
    assetSpecificForm.value = value
  },
})

watch(
  [
    () => props.draftAssetPoint,
    () => props.assetPointType,
    () => props.editingAssetPoint,
  ],
  ([draft, assetType, editingAsset]) => {
    if (!assetType) {
      assetSpecificForm.value = null
      return
    }

    const sourceAsset =
      editingAsset?.asset ?? draft?.asset

    if (editingAsset) {
      locationForm.latitude = editingAsset.latitude
      locationForm.longitude = editingAsset.longitude
    } else if (draft) {
      locationForm.latitude = draft.latitude
      locationForm.longitude = draft.longitude
    }

    if (sourceAsset) {
      Object.assign(assetForm, {
        assetTypeId:
          sourceAsset.assetTypeId ?? assetType.id,

        statusId:
          sourceAsset.statusId ?? null,

        siteId:
          sourceAsset.siteId ?? null,

        assetTag:
          sourceAsset.assetTag ?? '',

        serialNumber:
          sourceAsset.serialNumber ?? null,

        code:
          sourceAsset.code ?? '',

        name:
          sourceAsset.name ?? '',

        description:
          sourceAsset.description ?? '',

        purchaseDate:
          sourceAsset.purchaseDate ?? null,

        installationDate:
          sourceAsset.installationDate ?? null,

        warrantyStart:
          sourceAsset.warrantyStart ?? null,

        warrantyEnd:
          sourceAsset.warrantyEnd ?? null,
      })
    }

    assetForm.assetTypeId = assetType.id

    const typeKey =
      assetType.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-') as AssetPointType

    const emptyForm =
      createDefaultAssetForm(typeKey)

    const specificData =
      editingAsset?.assetData ??
      draft?.assetData

    if (!specificData) {
      assetSpecificForm.value = emptyForm
      return
    }

    if (typeKey === 'onu') {
      const onuData =
        specificData as OnuAssetData

      const onuForm =
        emptyForm as AssetPointFormModelMap['onu']

      onuForm.macAddressONU =
        onuData.macAddressONU ?? ''

      onuForm.macAddressRouter =
        onuData.macAddressRouter ?? ''

      onuForm.ponType =
        onuData.ponType ?? ''

      onuForm.downloadSpeedMbps =
        onuData.downloadSpeedMbps ?? null

      onuForm.uploadSpeedMbps =
        onuData.uploadSpeedMbps ?? null

      onuForm.dataAllowanceGb =
        onuData.dataAllowanceGb ?? null

      // Existing customer
      onuForm.customerId =
        onuData.customerId ?? null

      onuForm.customerMode =
        onuData.customerId
          ? 'existing'
          : 'new'

      onuForm.customer = {
        name: onuData.customerName ?? '',
        phone: onuData.customerPhone ?? '',
        email: '',
        address: '',
        description: '',
      }

      assetSpecificForm.value = onuForm

      return
    }

    assetSpecificForm.value = {
      ...emptyForm,
      ...specificData,
    } as AssetPointFormModel
  },
  {
    immediate: true,
  },
)

const handleCustomerSearch = async (
  search: string,
) => {
  const value = search.trim()

  if (!value) {
    customerSearchResults.value = []
    return
  }

  try {
    customerSearchResults.value =
      await customerApi.searchCustomers(value)
  } catch (error) {
    console.error(
      'Failed to search customers:',
      error,
    )

    customerSearchResults.value = []
  }
}

const handleCancel = () => {
  if (isSaving.value) {
    return
  }

  emit('cancel')
}

const handleUpdate = async (
  type: AssetPointType,
  id: string,
) => {
  if (!assetSpecificForm.value) {
    throw new Error(
      'Cannot update asset: specific asset data is missing.',
    )
  }

  await assetApi.updateAssetPoint(
    type,
    id,
    assetForm,
    assetSpecificForm.value,
    {
      latitude: locationForm.latitude,
      longitude: locationForm.longitude,
    },
  )
}

const handleSave = async () => {
  const type = assetPointTypeKey.value

  if (!type) {
    console.error(
      'Cannot save asset: asset type is missing.',
    )
    return
  }

  if (!isEditMode.value && !assetForm.assetTypeId) {
    console.error(
      'Cannot create asset: asset type ID is missing.',
    )
    return
  }

  if (!isEditMode.value && !assetForm.siteId) {
    console.error(
      'Cannot create asset: site ID is missing.',
    )
    return
  }

  if (!assetForm.statusId) {
    console.error(
      'Cannot save asset: status ID is missing.',
    )
    return
  }

  if (isSaving.value) {
    return
  }

  isSaving.value = true

  try {
    // UPDATE
    if (isEditMode.value) {
      const id = props.editingAssetPoint?.id

      if (!id) {
        throw new Error(
          'Cannot update asset: asset ID is missing.',
        )
      }

      await handleUpdate(type, id)

      console.log(
        `Successfully updated ${type} ${id}`,
      )

      emit('save')

      return
    }

    // CREATE
    const assetPointData: CreateAssetPointRequest = {
      type,
      asset: assetForm,
      location: {
        latitude: locationForm.latitude,
        longitude: locationForm.longitude,
      },
      specific: assetSpecificForm.value,
    }

    const observation =
      mapStore.fieldObservationToConvert

    if (observation) {
      const details =
        buildAssetPointDetails(assetPointData)

      await fieldObservationApi.convert(
        observation.id,
        {
          assetTypeId: assetForm.assetTypeId!,
          details,
        },
      )

      console.log(
        `Successfully converted field observation ${observation.id} to ${type}`,
      )

      mapStore.clearFieldObservationConversion()

      emit('save')

      return
    }

    await assetApi.createAssetPoint(
      assetPointData,
    )

    console.log(
      `Successfully created ${type}`,
    )

    emit('save')
  } catch (error) {
    console.error(
      `Failed to ${
        isEditMode.value
          ? 'update'
          : 'create'
      } asset point:`,
      error,
    )
  } finally {
    isSaving.value = false
  }
}
</script>