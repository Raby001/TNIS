<template>
  <section class="space-y-3">
    <div>
      <h3 class="text-sm font-semibold text-slate-800">
        Location
      </h3>

      <p class="mt-0.5 text-xs text-slate-400">
        Coordinates are taken from the map. You can adjust them manually.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <!-- Latitude -->
      <div>
        <label
          class="mb-1.5 block text-xs font-semibold text-slate-600"
        >
          Latitude
        </label>

        <input
          v-model.number="form.latitude"
          type="number"
          step="any"
          placeholder="Latitude"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <!-- Longitude -->
      <div>
        <label
          class="mb-1.5 block text-xs font-semibold text-slate-600"
        >
          Longitude
        </label>

        <input
          v-model.number="form.longitude"
          type="number"
          step="any"
          placeholder="Longitude"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface LocationFormData {
  latitude: number
  longitude: number
}

const form = defineModel<LocationFormData>({
  required: true,
})
</script>