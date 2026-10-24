<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <!-- Height -->
    <div>
      <FormLabel
        label="Height"
        optional
      />

      <input
        id="pole-height"
        v-model.number="model.heightM"
        type="number"
        min="0"
        step="0.01"
        placeholder="e.g. 12"
        class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>

    <!-- Material -->
    <div>
      <FormLabel
        label="Material"
        optional
      />

      <input
        id="pole-material"
        v-model="model.material"
        type="text"
        placeholder="e.g. Concrete"
        class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>

    <!-- Owner -->
    <div>
      <FormLabel
        label="Owner"
        optional
      />

      <input
        id="pole-owner"
        v-model="model.owner"
        type="text"
        placeholder="e.g. ABC Telecom"
        class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>

    <!-- Foundation -->
    <div>
      <FormLabel
        label="Foundation"
        optional
      />

      <input
        id="pole-foundation"
        v-model="model.foundation"
        type="text"
        placeholder="e.g. Concrete"
        class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PoleFormData } from '@/types/pole'
import FormLabel from '@/components/common/FormLabel.vue';

const model = defineModel<PoleFormData>({
  required: true,
})
</script>