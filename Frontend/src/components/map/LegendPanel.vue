<template>
  <AppCollapsible
    title="Legend"
    :icon="BookOpen"
    :default-open="false"
    compact
  >
    <div
      class="
        space-y-2
        overflow-y-auto
        overscroll-contain
        p-2.5
        max-h-[calc(100dvh-12rem)]
        xl:max-h-none
        xl:overflow-visible
      "
    >

      <!-- Sites -->
      <section
        class="grid gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5"
      >
        <p
          class="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
        >
          Sites
        </p>

        <LegendItem
          label="Site"
          color="#10b981"
          :icon="popIcon"
          variant="icon"
        />
      </section>

      <!-- Asset Points -->
      <section
        class="grid gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5"
      >
        <p
          class="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
        >
          Asset Points
        </p>

        <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          <LegendItem
            v-for="item in assetPointLegend"
            :key="item.type"
            :label="item.label"
            :color="item.color"
            :icon="item.icon"
            variant="icon"
          />
        </div>
      </section>

      <!-- Cores -->
      <section
        class="grid gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5"
      >
        <p
          class="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
        >
          Cores
        </p>

        <div class="grid grid-cols-2 gap-x-2 gap-y-1.5">
          <LegendItem
            v-for="core in cableCores"
            :key="core.value"
            :label="core.label"
            :color="core.color"
            variant="swatch"
          />
        </div>
      </section>

      <!-- Line -->
      <section
        class="grid gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5"
      >
        <p
          class="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
        >
          Line
        </p>

        <LegendItem
          label="Aerial"
          color="#2563eb"
          marker="none"
        />

        <LegendItem
          label="Direct Buried"
          color="#2563eb"
          marker="triangle"
        />

        <LegendItem
          label="Conduit"
          color="#2563eb"
          marker="square"
        />
      </section>

    </div>
  </AppCollapsible>
</template>

<script setup lang="ts">
import {
  BookOpen,
  Building2,
} from 'lucide-vue-next'

import type { AssetPointType } from '@/types/asset-point'

import AppCollapsible from '@/components/common/AppCollapsible.vue'
import LegendItem from './LegendItem.vue'

import { CABLE_CORE_OPTIONS } from '@/utils/cable-style'
import { getAssetPointIcon } from '@/services/map/asset-point/asset-point-icons.ts'
import { getAssetPointColor } from '@/services/map/asset-point/asset-point-colors.ts'
import { assetPointTypeLabels } from '@/config/asset-point-form.config.ts'

const cableCores = CABLE_CORE_OPTIONS

const popIcon = Building2

const assetPointLegend = (
  Object.entries(
    assetPointTypeLabels,
  ) as [
    AssetPointType,
    string,
  ][]
).map(([type, label]) => ({
  type,
  label,
  icon: getAssetPointIcon(type),
  color: getAssetPointColor(type),
}))
</script>
