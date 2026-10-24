<template>
  <section class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
    <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      Tower Information
    </h3>

    <div v-if="towerLoading" class="text-sm text-slate-500">Loading tower details…</div>
    <div v-else-if="towerError" class="text-sm text-red-600">{{ towerError }}</div>

    <dl v-else-if="towerDetail" class="space-y-2 text-sm">
      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Height</dt>
        <dd class="text-slate-800">
          {{ towerDetail.heightM != null ? `${towerDetail.heightM} m` : '—' }}
        </dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Owner</dt>
        <dd class="text-slate-800">{{ towerDetail.owner ?? '—' }}</dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Foundation</dt>
        <dd class="text-slate-800">{{ towerDetail.foundation ?? '—' }}</dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Maximum Load</dt>
        <dd class="text-slate-800">
          {{ towerDetail.maximumLoad != null ? towerDetail.maximumLoad : '—' }}
        </dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Occupied Space</dt>
        <dd class="text-slate-800">
          {{ towerDetail.occupiedSpace != null ? towerDetail.occupiedSpace : '—' }}
        </dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Available Space</dt>
        <dd class="text-slate-800">
          {{ towerDetail.availableSpace != null ? towerDetail.availableSpace : '—' }}
        </dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Power</dt>
        <dd class="text-slate-800">{{ towerDetail.power ?? '—' }}</dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Generator</dt>
        <dd class="text-slate-800">{{ towerDetail.generator ? 'Yes' : 'No' }}</dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Battery</dt>
        <dd class="text-slate-800">{{ towerDetail.battery ? 'Yes' : 'No' }}</dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">GPS</dt>
        <dd class="text-slate-800">{{ towerDetail.gps ? 'Yes' : 'No' }}</dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Lease Expiry</dt>
        <dd class="text-slate-800">
          {{ towerDetail.leaseExpiry ? formatOrdinalDate(towerDetail.leaseExpiry) : '—' }}
        </dd>
      </div>
    </dl>

    <p v-else class="text-sm text-slate-400">No tower details available.</p>
  </section>
</template>

<script setup lang="ts">
import { formatOrdinalDate } from '@/utils/formatDate'
import type { TowerDetail } from '@/types/tower'

const props = defineProps<{
  asset: any
  towerDetail: TowerDetail | null
  towerLoading: boolean
  towerError: string
}>()
</script>
