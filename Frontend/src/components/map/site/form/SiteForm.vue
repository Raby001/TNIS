<template>
  <div class="space-y-4">
    <!-- Basic information -->
    <div class="space-y-3">
      <div>
          <p class="text-sm font-semibold text-slate-900">
          Site Information
          </p>

          <p class="mt-1 text-xs text-slate-500">
          Enter the information for this network site.
          </p>
      </div>

      <!-- Name -->
      <label class="grid gap-1.5 text-xs font-semibold text-slate-700">
        <span>
          Name
          <span class="text-red-500">*</span>
        </span>

        <input
          v-model="form.name"
          type="text"
          placeholder="Enter site name"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </label>

      <!-- City -->
      <label class="grid gap-1.5 text-xs font-semibold text-slate-700">
        <span>
          City / Province
          <span class="text-red-500">*</span>
        </span>

        <select
          v-model="form.cityId"
          :disabled="loadingCities"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option
            value=""
            disabled
          >
            {{
              loadingCities
                ? 'Loading cities...'
                : 'Select city / province'
            }}
          </option>

          <option
            v-for="city in cities"
            :key="city.id"
            :value="city.id"
          >
            {{ city.name }}
          </option>
        </select>

        <p
          v-if="cityError"
          class="text-xs font-normal text-red-500"
        >
          {{ cityError }}
        </p>
      </label>

      <!-- Address -->
      <label class="grid gap-1.5 text-xs font-semibold text-slate-700">
        <span>
          Address
          <span class="text-red-500">*</span>
        </span>

        <textarea
          v-model="form.address"
          rows="3"
          placeholder="Enter site address"
          class="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </label>

      <!-- Elevation -->
      <label class="grid gap-1.5 text-xs font-semibold text-slate-700">
        <span>Elevation</span>

        <input
          v-model.number="form.elevation"
          type="number"
          step="0.01"
          min="0"
          placeholder="Enter elevation"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </label>

      <!-- Description -->
      <label class="grid gap-1.5 text-xs font-semibold text-slate-700">
        <span>Description</span>

        <textarea
          v-model="form.description"
          rows="4"
          placeholder="Enter description"
          class="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </label>
    </div>

    <!-- Location -->
    <div class="rounded-2xl border border-blue-100 bg-blue-50 p-3">
      <div class="flex items-start gap-3">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600"
        >
          <MapPin :size="18" />
        </div>

        <!-- Location information -->
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-slate-900">
            Location
          </p>

          <p class="mt-1 text-xs leading-5 text-slate-500">
            Edit the coordinates of this site. The location is initially
            captured from the point selected on the map.
          </p>

          <!-- Coordinates -->
          <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="grid gap-1.5 text-xs font-semibold text-slate-700">
              <span>Latitude</span>

              <input
                v-model.number="form.latitude"
                type="number"
                step="0.000001"
                min="-90"
                max="90"
                placeholder="Enter latitude"
                class="w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </label>

            <label class="grid gap-1.5 text-xs font-semibold text-slate-700">
              <span>Longitude</span>

              <input
                v-model.number="form.longitude"
                type="number"
                step="0.000001"
                min="-180"
                max="180"
                placeholder="Enter longitude"
                class="w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  ref,
} from 'vue'

import { MapPin } from 'lucide-vue-next'

import type { CreateSiteForm } from '@/types/site'
import type { City } from '@/types/reference-data'

import { referenceDataApi } from '@/services/api/reference-data.api'

const form = defineModel<CreateSiteForm>({
  required: true,
})

const cities = ref<City[]>([])

const loadingCities = ref(false)
const cityError = ref('')

const loadCities = async () => {
  loadingCities.value = true
  cityError.value = ''

  try {
    const response =
      await referenceDataApi.getCities()

    cities.value = response.data
  } catch (error) {
    console.error(
      'Failed to load cities:',
      error,
    )

    cityError.value =
      'Unable to load cities.'
  } finally {
    loadingCities.value = false
  }
}

onMounted(() => {
  loadCities()
})
</script>
