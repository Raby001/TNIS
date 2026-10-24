<template>
  <section class="space-y-4">
    <!-- Depth -->
    <div>
      <FormLabel
        label="Depth"
        optional
      />

      <input
        v-model.number="model.depthM"
        type="number"
        min="0"
        step="0.01"
        placeholder="Enter depth"
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>

    <!-- Material -->
    <div>
      <FormLabel
        label="Material"
        optional
      />

      <input
        v-model="model.material"
        type="text"
        placeholder="Enter material"
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>

    <!-- Cover Type -->
    <div>
      <FormLabel
        label="Cover Type"
        optional
      />

      <input
        v-model="model.coverType"
        type="text"
        placeholder="Enter cover type"
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ManholeFormData } from '@/types/manhole'
import FormLabel from '@/components/common/FormLabel.vue';

const model = defineModel<ManholeFormData>({
  required: true,
})
</script>