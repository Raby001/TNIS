<template>
  <section class="space-y-4">
    <div>
      <FormLabel
        label="Type"
        optional
      />

      <input
        v-model="model.closureType"
        type="text"
        placeholder="Enter closure type"
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>

    <div>
      <FormLabel
        label="Capacity"
        optional
      />

      <input
        v-model.number="model.capacity"
        type="number"
        min="0"
        step="1"
        placeholder="Enter capacity"
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SpliceClosureFormData } from '@/types/splice-closure'
import FormLabel from '@/components/common/FormLabel.vue';

const model = defineModel<SpliceClosureFormData>({
  required: true,
})
</script>