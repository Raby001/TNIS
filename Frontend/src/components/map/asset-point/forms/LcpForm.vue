<template>
  <section class="space-y-4">
    <div>
      <FormLabel
        label="Splitter Capacity"
        required
      />

      <div class="relative">
        <input
          v-model.number="model.splitterCapacity"
          type="number"
          min="0"
          placeholder="Enter splitter capacity"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-16 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />

        <span
          class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400"
        >
          ports
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LcpFormData } from '@/types/lcp'
import FormLabel from '@/components/common/FormLabel.vue'

const model = defineModel<LcpFormData>({
  required: true,
})
</script>