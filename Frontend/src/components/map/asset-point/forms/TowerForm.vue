<template>
  <section class="space-y-4">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <!-- Height -->
      <div>
        <FormLabel
          label="Height"
          optional
        />

        <input
          v-model.number="model.heightM"
          type="number"
          min="0"
          step="any"
          placeholder="Enter height"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <!-- Foundation -->
      <div>
        <FormLabel
          label="Foundation"
          optional
        />

        <input
          v-model="model.foundation"
          type="text"
          placeholder="Enter foundation"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <!-- Maximum Load -->
      <div>
        <FormLabel
          label="Maximum Load"
          optional
        />

        <input
          v-model.number="model.maximumLoad"
          type="number"
          min="0"
          step="any"
          placeholder="Enter maximum load"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <!-- Occupied Space -->
      <div>
        <FormLabel
          label="Occupied Space"
          optional
        />

        <input
          v-model.number="model.occupiedSpace"
          type="number"
          min="0"
          step="any"
          placeholder="Enter occupied space"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <!-- Available Space -->
      <div>
        <FormLabel
          label="Available Space"
          optional
        />

        <input
          v-model.number="model.availableSpace"
          type="number"
          min="0"
          step="any"
          placeholder="Enter available space"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <!-- Owner -->
      <div>
        <FormLabel
          label="Owner"
          optional
        />

        <input
          v-model="model.owner"
          type="text"
          placeholder="Enter owner"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <!-- Power -->
      <div>
        <FormLabel
          label="Power"
          optional
        />

        <input
          v-model="model.power"
          type="text"
          placeholder="Enter power source"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <!-- Lease Expiry -->
      <div>
        <FormLabel
          label="Lease Expiry"
          optional
        />

        <input
          v-model="model.leaseExpiry"
          type="date"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>
    </div>

    <!-- Boolean options -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <!-- Generator -->
      <label
        class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
      >
        <input
          v-model="model.generator"
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300"
        />

        <span class="text-sm font-medium text-slate-700">
          Generator
        </span>
      </label>

      <!-- Battery -->
      <label
        class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
      >
        <input
          v-model="model.battery"
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300"
        />

        <span class="text-sm font-medium text-slate-700">
          Battery
        </span>
      </label>

      <!-- GPS -->
      <label
        class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
      >
        <input
          v-model="model.gps"
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300"
        />

        <span class="text-sm font-medium text-slate-700">
          GPS
        </span>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TowerFormData } from '@/types/tower'
import FormLabel from '@/components/common/FormLabel.vue';

const model = defineModel<TowerFormData>({
  required: true,
})
</script>