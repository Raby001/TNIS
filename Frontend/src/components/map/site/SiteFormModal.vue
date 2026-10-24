<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4 py-6"
    >
      <!-- Overlay -->
      <button
        type="button"
        aria-label="Close Site form overlay"
        class="absolute inset-0"
        @click="close"
      />

      <!-- Centered modal -->
      <section
        class="relative z-[2200] flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <!-- Header -->
        <div
          class="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4"
        >
          <div class="min-w-0">
            <p
              class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"
            >
              Network Site
            </p>

            <h2
              class="mt-1 truncate text-lg font-semibold text-slate-900"
            >
              {{ isEditMode ? 'Edit Site' : 'Create Site' }}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close Site form"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            @click="close"
          >
            <X :size="19" />
          </button>
        </div>

        <!-- Scrollable form body -->
        <div class="flex-1 overflow-y-auto px-5 py-5">
          <SiteForm
            v-model="draftSite"
            :edit-mode="isEditMode"
          />

          <p
            v-if="saveError"
            class="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600"
          >
            {{ saveError }}
          </p>
        </div>

        <!-- Footer -->
        <div
          class="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3"
        >
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="saving"
            @click="close"
          >
            Cancel
          </button>

          <button
            type="button"
            class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canSave || saving"
            @click="save"
          >
            {{ saving
              ? 'Saving...'
              : isEditMode
                ? 'Update Site'
                : 'Create Site'
            }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { X } from 'lucide-vue-next'

import SiteForm from './form/SiteForm.vue'

import { useMapStore } from '@/stores/map.store'
import { sitesApi } from '@/services/api/sites.api.ts'
import { mapService } from '@/services/index.ts'

interface Props {
  open: boolean
}

defineProps<Props>()

const mapStore = useMapStore()

const { 
  draftSite,
  editingSite
} = storeToRefs(mapStore)

const saving = ref(false)
const saveError = ref('')

const isEditMode = computed(() => !!editingSite.value)

const canSave = computed(() => {
  const site = draftSite.value

  return (
    site.name.trim().length > 0 &&
    site.cityId.trim().length > 0 &&
    site.address.trim().length > 0
  )
})

const close = () => {
  if (saving.value) return

  mapStore.closeSiteForm()
}

const save = async () => {
  if (!canSave.value || saving.value) {
    return
  }

  saveError.value = ''
  saving.value = true

  try {
    const site = draftSite.value

    if (isEditMode.value) {
      // City cannot be updated.
      const payload = {
        name: site.name.trim(),
        address: site.address.trim(),
        elevation: site.elevation ?? undefined,
        description: site.description?.trim() || undefined,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            site.longitude,
            site.latitude,
          ] as [number, number],
        },
      }

      const response = await sitesApi.update(
        editingSite.value!.id,
        payload,
      )

      mapStore.updateSiteFromSite(response.data)

      mapService.closePopup()
    } else {
      // City is required when creating a site.
      const payload = {
        cityId: site.cityId,
        name: site.name.trim(),
        address: site.address.trim(),
        elevation: site.elevation ?? undefined,
        description: site.description?.trim() || undefined,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            site.longitude,
            site.latitude,
          ] as [number, number],
        },
      }

      const response = await sitesApi.create(payload)

      mapStore.addSiteFromSite(response.data)
    }

    mapStore.closeSiteForm()
  } catch (error) {
    console.error(
      `Failed to ${isEditMode.value ? 'update' : 'create'} Site:`,
      error,
    )

    saveError.value =
      `Failed to ${isEditMode.value ? 'update' : 'create'} Site. Please try again.`
  } finally {
    saving.value = false
  }
}
</script>