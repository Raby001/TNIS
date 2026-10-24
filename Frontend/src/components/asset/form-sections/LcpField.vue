<template>
  <div class="space-y-4">
    <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      LCP Details
    </h3>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label required>Splitter Capacity <span class="text-red-500">*</span></Label>
        <div class="relative">
          <Input
            id="f-splitter-capacity"
            v-model.number="form.splitterCapacity"
            variant="asset"
            type="number"
            min="1"
            max="1000"
            step="1"
            placeholder="e.g. 8"
            class="pr-16"
          />
          <span
            class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400"
          >
            ports
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import Input from '@/components/ui/input.vue'
import Label from '@/components/ui/label.vue'

const props = defineProps<{
  form: Record<string, any>
}>()

const form = toRef(props, 'form')
</script>