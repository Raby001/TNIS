<template>
  <section class="space-y-4">
    <div>
      <FormLabel
        label="Size"
        optional
      />

      <input
        v-model="model.size"
        type="text"
        placeholder="Enter handhole size"
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>

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
import type { HandholeFormData } from '@/types/handhole'
import FormLabel from '@/components/common/FormLabel.vue';

const model = defineModel<HandholeFormData>({
  required: true,
})
</script>