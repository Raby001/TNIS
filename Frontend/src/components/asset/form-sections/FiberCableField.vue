<template>
  <div class="space-y-4">
    <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      Fiber Cable Details
    </h3>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label required>Cable Type <span class="text-red-500">*</span></Label>
        <Select v-model="form.cableTypeId" variant="asset">
          <option value="" disabled>Select cable type</option>
          <option v-for="t in cableTypes" :key="t.id" :value="t.id">
            {{ t.name }}
          </option>
        </Select>
      </div>

      <div>
        <Label required>Core Count <span class="text-red-500">*</span></Label>
        <Select v-model="form.coreCountId" variant="asset">
          <option value="" disabled>Select core count</option>
          <option v-for="c in coreCounts" :key="c.id" :value="c.id">
            {{ c.displayCode }} ({{ c.coreCount }} cores)
          </option>
        </Select>
      </div>

      <div>
        <Label required>Installation Method <span class="text-red-500">*</span></Label>
        <Select v-model="form.installationMethodId" variant="asset">
          <option value="" disabled>Select method</option>
          <option v-for="m in installationMethods" :key="m.id" :value="m.id">
            {{ m.name }}
          </option>
        </Select>
      </div>

      <div>
        <Label required>Segment Type <span class="text-red-500">*</span></Label>
        <Select v-model="form.segmentTypeId" variant="asset">
          <option value="" disabled>Select segment type</option>
          <option v-for="s in segmentTypes" :key="s.id" :value="s.id">
            {{ s.name }}
          </option>
        </Select>
      </div>

      <div class="relative" data-start-asset-combo>
        <Label required>Start Asset <span class="text-red-500">*</span></Label>
        <Input
          :model-value="startAssetSearch"
          placeholder="Search for a start asset"
          variant="asset"
          @update:model-value="(value) => emit('update:startAssetSearch', String(value))"
          @focus="emit('focus:start')"
          @keydown.escape="emit('keydown:start', $event)"
        />
        <p v-if="loadingConnectableAssets" class="mt-1 text-xs text-slate-400">
          Loading assets from all sites…
        </p>
        <ul
          v-if="showStartList && !loadingConnectableAssets"
          class="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <li v-if="!filteredStartAssets.length" class="px-3 py-2 text-sm text-slate-400">
            No matches
          </li>
          <li
            v-for="a in filteredStartAssets"
            :key="a.id"
            class="cursor-pointer px-3 py-2 hover:bg-slate-50"
            @mousedown.prevent="emit('pick:start', a)"
          >
            <div class="text-sm font-medium text-slate-800">{{ a.name }}</div>
            <div class="text-xs text-slate-400">{{ a.siteName }}</div>
          </li>
        </ul>
      </div>

      <div class="relative" data-end-asset-combo>
        <Label required>End Asset <span class="text-red-500">*</span></Label>
        <Input
          :model-value="endAssetSearch"
          placeholder="Search for an end asset"
          variant="asset"
          @update:model-value="(value) => emit('update:endAssetSearch', String(value))"
          @focus="emit('focus:end')"
          @keydown.escape="emit('keydown:end', $event)"
        />
        <ul
          v-if="showEndList && !loadingConnectableAssets"
          class="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <li v-if="!filteredEndAssets.length" class="px-3 py-2 text-sm text-slate-400">
            No matches
          </li>
          <li
            v-for="a in filteredEndAssets"
            :key="a.id"
            class="cursor-pointer px-3 py-2 hover:bg-slate-50"
            @mousedown.prevent="emit('pick:end', a)"
          >
            <div class="text-sm font-medium text-slate-800">{{ a.name }}</div>
            <div class="text-xs text-slate-400">{{ a.siteName }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import Input from '@/components/ui/input.vue'
import Label from '@/components/ui/label.vue'
import Select from '@/components/ui/Select.vue'
import type { ConnectableAssetOption } from '@/types/site'
import type {
  CableCoreCount,
  CableType,
  FiberSegmentType,
  InstallationMethod,
} from '@/types/reference-data'

const props = defineProps<{
  form: Record<string, any>
  cableTypes: CableType[]
  coreCounts: CableCoreCount[]
  installationMethods: InstallationMethod[]
  segmentTypes: FiberSegmentType[]
  startAssetSearch: string
  endAssetSearch: string
  loadingConnectableAssets: boolean
  showStartList: boolean
  showEndList: boolean
  filteredStartAssets: ConnectableAssetOption[]
  filteredEndAssets: ConnectableAssetOption[]
}>()

const emit = defineEmits<{
  'update:startAssetSearch': [value: string]
  'update:endAssetSearch': [value: string]
  'focus:start': []
  'focus:end': []
  'keydown:start': [event: KeyboardEvent]
  'keydown:end': [event: KeyboardEvent]
  'pick:start': [item: ConnectableAssetOption]
  'pick:end': [item: ConnectableAssetOption]
}>()

const form = toRef(props, 'form')
</script>
