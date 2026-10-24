<template>
  <section class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
    <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      Closure Information
    </h3>

    <div v-if="spliceLoading" class="text-sm text-slate-500">Loading closure details…</div>
    <div v-else-if="spliceError" class="text-sm text-red-600">{{ spliceError }}</div>

    <dl v-else-if="spliceDetail" class="space-y-2 text-sm">
      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Closure Type</dt>
        <dd class="text-slate-800">{{ spliceDetail.closureType ?? '—' }}</dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Capacity</dt>
        <dd class="text-slate-800">
          {{ spliceDetail.capacity != null ? spliceDetail.capacity : '—' }}
        </dd>
      </div>

      <div v-if="spliceDetail.containerAsset" class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Container Asset</dt>
        <dd class="text-right text-slate-800">
          {{ spliceDetail.containerAsset.name }}
          <span
            v-if="spliceDetail.containerAsset.assetTag"
            class="block text-xs text-slate-400"
          >
            {{ spliceDetail.containerAsset.assetTag }}
          </span>
        </dd>
      </div>
    </dl>

    <p v-else class="text-sm text-slate-400">No closure details available.</p>
  </section>
</template>

<script setup lang="ts">
import type { SpliceClosureDetailResponse } from '@/types/splice-closure'

const props = defineProps<{
  asset: any
  spliceDetail: SpliceClosureDetailResponse | null
  spliceLoading: boolean
  spliceError: string
}>()
</script>