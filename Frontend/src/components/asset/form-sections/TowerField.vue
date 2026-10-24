<template>
  <div class="space-y-4">
    <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      Tower Details
    </h3>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label for="f-height">Height (m)</Label>
        <Input
          id="f-height"
          v-model.number="form.heightM"
          variant="asset"
          type="number"
          min="0"
          step="0.1"
          placeholder="e.g. 45"
        />
      </div>

      <div>
        <Label for="f-foundation">Foundation</Label>
        <Input
          id="f-foundation"
          v-model="form.foundation"
          placeholder="e.g. Concrete pad"
          variant="asset"
        />
      </div>

      <div>
        <Label for="f-max-load">Maximum load</Label>
        <Input
          id="f-max-load"
          v-model.number="form.maximumLoad"
          type="number"
          min="0"
          placeholder="e.g. 1000"
          variant="asset"
        />
      </div>

      <div>
        <Label for="f-occupied">Occupied space</Label>
        <Input
          id="f-occupied"
          v-model.number="form.occupiedSpace"
          type="number"
          min="0"
          variant="asset"
          placeholder="e.g. 200"
        />
      </div>

      <div>
        <Label for="f-available">Available space</Label>
        <Input
          id="f-available"
          v-model.number="form.availableSpace"
          type="number"
          min="0"
          variant="asset"
        />
      </div>

      <div>
        <Label for="f-owner">Owner</Label>
        <Input id="f-owner" v-model="form.owner" placeholder="e.g. Telecom Cambodia" variant="asset" />
      </div>

      <div>
        <Label for="f-power">Power</Label>
        <Input id="f-power" v-model="form.power" placeholder="e.g. Grid / Hybrid" variant="asset" />
      </div>

      <div>
        <Label for="f-lease">Lease expiry</Label>
        <Input id="f-lease" v-model="form.leaseExpiry" type="date" variant="asset" />
      </div>

      <div class="sm:col-span-2 flex flex-wrap gap-6 pt-1">
        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input v-model="form.generator" type="checkbox" class="rounded border-slate-300" />
          Generator
        </label>
        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input v-model="form.battery" type="checkbox" class="rounded border-slate-300" />
          Battery
        </label>
        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input v-model="form.gps" type="checkbox" class="rounded border-slate-300" />
          GPS
        </label>
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
