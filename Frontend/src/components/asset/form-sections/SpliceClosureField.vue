<template>
  <div class="space-y-4">
    <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      Closure Details
    </h3>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label for="f-closure-type">Closure type</Label>
        <Input
          id="f-closure-type"
          v-model="form.closureType"
          variant="asset"
          placeholder="e.g. SPLICE CLOSURE"
        />
      </div>

      <div>
        <Label for="f-capacity">Capacity</Label>
        <Input
          id="f-capacity"
          v-model.number="form.capacity"
          variant="asset"
          type="number"
          min="0"
          step="1"
          placeholder="e.g. 100"
        />
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