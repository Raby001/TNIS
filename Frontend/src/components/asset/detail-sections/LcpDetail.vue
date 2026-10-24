<template>
  <section class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
    <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      LCP Information
    </h3>

    <div v-if="lcpLoading" class="text-sm text-slate-500">Loading LCP details…</div>
    <div v-else-if="lcpError" class="text-sm text-red-600">{{ lcpError }}</div>

    <dl v-else-if="lcpDetail" class="space-y-2 text-sm">
      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Splitter Capacity</dt>
        <dd class="text-slate-800">
          {{ lcpDetail.splitterCapacity != null ? `${lcpDetail.splitterCapacity} ports` : '—' }}
        </dd>
      </div>
    </dl>

    <p v-else class="text-sm text-slate-400">No LCP details available.</p>
  </section>
</template>

<script setup lang="ts">
import type { LcpDetailResponse } from '@/types/lcp'

const props = defineProps<{
  asset: any
  lcpDetail: LcpDetailResponse | null
  lcpLoading: boolean
  lcpError: string
}>()
</script>