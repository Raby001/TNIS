<template>
  <section class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
    <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      Fiber Cable Information
    </h3>

    <div v-if="fiberLoading" class="text-sm text-slate-500">Loading fiber details…</div>
    <div v-else-if="fiberError" class="text-sm text-red-600">{{ fiberError }}</div>

    <dl v-else-if="fiberDetail" class="space-y-2 text-sm">
      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Cable Type</dt>
        <dd class="text-slate-800">{{ fiberDetail.fiberCable.cableType?.name ?? '—' }}</dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Core Count</dt>
        <dd class="text-slate-800">
          {{ fiberDetail.fiberCable.coreCount?.name ?? '—' }}
        </dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Installation Method</dt>
        <dd class="text-slate-800">{{ fiberDetail.fiberCable.installationMethod?.name ?? '—' }}</dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Segment Type</dt>
        <dd class="text-slate-800">{{ fiberDetail.fiberCable.segmentType?.name ?? '—' }}</dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Installed Length</dt>
        <dd class="text-slate-800">
          {{ installedLength != null ? `${installedLength} m` : '—' }}
        </dd>
      </div>

      <div
        v-if="connections.length"
        class="flex items-center justify-between gap-4"
      >
        <dt class="text-slate-500">Connections</dt>
        <dd class="text-slate-800">{{ connections.length }}</dd>
      </div>

      <div
        v-for="c in connections"
        :key="c.key"
        class="flex items-start justify-between gap-4 border-t border-slate-200 pt-2 first:border-0 first:pt-0"
      >
        <dt class="shrink-0 text-slate-500">
          <span class="font-medium text-slate-600">{{ c.label }}</span>
          <span v-if="c.targetType === 'SITE'" class="ml-1 text-xs text-slate-400">(site)</span>
        </dt>
        <dd class="min-w-0 text-right text-slate-800">
          {{ c.name ?? '—' }}
          <span v-if="c.code" class="block text-xs text-slate-400">{{ c.code }}</span>
          <span v-if="c.segmentM != null" class="block text-xs text-slate-400">
            {{ formatDistance(c.segmentM) }} from previous
            <template v-if="c.cumulativeM != null">
              · {{ formatDistance(c.cumulativeM) }} total
            </template>
          </span>
        </dd>
      </div>

      <div
        v-if="splicePointCount > 0"
        class="flex items-center justify-between gap-4 border-t border-slate-200 pt-2"
      >
        <dt class="text-slate-500">Splice Points</dt>
        <dd class="text-slate-800">{{ splicePointCount }}</dd>
      </div>
    </dl>

    <p v-else class="text-sm text-slate-400">No fiber details available.</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CableDetailResponse } from '@/types/cable'

const props = defineProps<{
  asset: any
  fiberDetail: CableDetailResponse | null
  fiberLoading: boolean
  fiberError: string
}>()

// The API returns the full connection chain: `start`, then any number of
// `middle` targets, then `end`. All of them are shown here.
const roleLabels: Record<string, string> = {
  START: 'Start',
  MIDDLE: 'Intermediate',
  END: 'End',
}

const connections = computed(() => {
  const detail = props.fiberDetail
  if (!detail) return []

  return [detail.start, ...(detail.middle ?? []), detail.end].map(
    (endpoint) => ({
      key: `${endpoint.sequence}-${endpoint.connectionRole}`,
      label: roleLabels[endpoint.connectionRole] ?? endpoint.connectionRole,
      targetType: endpoint.targetType,
      name:
        endpoint.target.asset?.name ?? endpoint.target.site?.name ?? null,
      code: endpoint.target.asset?.code ?? endpoint.target.site?.code ?? null,
      segmentM: endpoint.distanceFromPreviousM,
      cumulativeM: endpoint.cumulativeDistanceM,
    }),
  )
})

const splicePointCount = computed(
  () => props.fiberDetail?.splicePoints?.length ?? 0,
)

function formatDistance(metres: number): string {
  if (metres == null || Number.isNaN(metres)) return '—'
  return metres >= 1000 ? `${(metres / 1000).toFixed(2)} km` : `${metres} m`
}

// `installedLengthM` is no longer returned on the cable itself; the running
// length to the last connection lives on the `end` endpoint.
const installedLength = computed(
  () => props.fiberDetail?.end.cumulativeDistanceM ?? null,
)
</script>
