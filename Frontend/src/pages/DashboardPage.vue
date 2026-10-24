<template>
  <div class="h-full overflow-y-auto px-4 py-6 pb-10 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">System overview</h1>
        <p class="text-sm text-slate-500">{{ nowLabel }} · All regions</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button v-if="canViewLogs" appearance="secondary" @click="goToAudit">
          View audit log
        </Button>
        <Button appearance="primary" @click="goToMap">
          Open map
        </Button>
      </div>
    </div>

    <!-- Loading / Error states -->
    <div v-if="store.isLoading" class="py-20 text-center text-sm text-slate-500">
      Loading dashboard…
    </div>

    <div v-else-if="store.error" class="py-12 text-center text-sm text-red-600">
      {{ store.error }}
    </div>

    <template v-else>
      <!-- Top metrics -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          v-for="(card, idx) in store.metrics"
          :key="idx"
          :label="card.label"
          :value="card.value"
          :hint="card.hint"
          :tone="card.tone"
          :icon="metricIcons[idx]"
          :clickable="!!card.to"
          @click="card.to && router.push(card.to)"
        />
      </div>

      <!-- Main content -->
      <div
        class="mt-5 grid grid-cols-1 gap-5"
        :class="canViewSystemHealth ? 'xl:grid-cols-3' : 'xl:grid-cols-2'"
      >
        <!-- Recent activity -->
        <section
          class="overflow-hidden rounded-xl border border-slate-200 bg-white"
          :class="canViewSystemHealth ? 'xl:col-span-2' : 'xl:col-span-1'"
        >
          <header class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 class="text-sm font-semibold text-slate-900">Recent activity</h2>
              <p class="text-xs text-slate-500">{{ activitySubtitle }}</p>
            </div>
            <button
              v-if="canViewLogs"
              type="button"
              class="text-xs font-medium text-slate-600 hover:text-slate-900"
              @click="goToAudit"
            >
              View all
            </button>
          </header>

          <ul class="divide-y divide-slate-100">
            <li
              v-for="entry in visibleActivity"
              :key="entry.id"
              class="flex items-start gap-3 px-4 py-3"
            >
              <span
                class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600"
              >
                {{ getInitials(entry.user) }}
              </span>

              <div class="min-w-0 flex-1">
                <p class="text-sm text-slate-800">
                  <span class="font-medium text-slate-900">{{ entry.user }}</span>
                  <span
                    class="mx-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset"
                    :class="actionMeta[entry.action] ?? 'bg-slate-100 text-slate-700 ring-slate-500/20'"
                  >
                    {{ entry.action }}
                  </span>
                  in
                  <span class="font-medium text-slate-900">{{ entry.table }}</span>
                </p>
                <p class="mt-0.5 truncate text-xs text-slate-500">
                  {{ entry.record }} · {{ entry.newValue }}
                </p>
              </div>

              <time class="font-mono-num shrink-0 text-[11px] text-slate-400">
                {{ entry.timestamp }}
              </time>
            </li>
          </ul>
          <p
            v-if="!visibleActivity.length"
            class="px-4 py-6 text-center text-sm text-slate-500"
          >
            No recent activity yet.
          </p>
        </section>

        <!-- Right column -->
        <div class="space-y-5">
          <!-- Network status mix -->
          <section class="rounded-xl border border-slate-200 bg-white p-4">
            <h2 class="text-sm font-semibold text-slate-900">Network status mix</h2>
            <p class="text-xs text-slate-500">Share of records by status</p>

            <div
              v-if="store.healthRows.length"
              class="mt-4 flex h-2.5 overflow-hidden rounded-full bg-slate-100"
            >
              <span
                v-for="row in store.healthRows"
                :key="row.name"
                class="h-full"
                :class="getStatusMeta(row.name).dot"
                :style="{ width: `${store.percentOf(row)}%` }"
              />
            </div>

            <ul class="mt-4 space-y-2">
              <li
                v-for="row in store.healthRows"
                :key="row.name"
                class="flex items-center gap-2 text-sm"
              >
                <span
                  class="h-2 w-2 rounded-full"
                  :class="getStatusMeta(row.name).dot"
                />
                <span class="text-slate-700">{{ row.name }}</span>
                <span class="text-xs text-slate-400">
                  {{ row.count.toLocaleString() }}
                </span>
                <span class="font-mono-num ml-auto text-slate-500">
                  {{ Math.round(store.percentOf(row)) }}%
                </span>
              </li>
            </ul>

            <p v-if="!store.healthRows.length" class="mt-4 text-sm text-slate-500">
              No asset status data available.
            </p>
          </section>

          <!-- System health -->
          <!-- <section
            v-if="canViewSystemHealth"
            class="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div class="flex items-center gap-2">
              <ServerCogIcon class="h-4 w-4 text-slate-500" />
              <h2 class="text-sm font-semibold text-slate-900">System health</h2>
            </div>

            <dl class="mt-3 space-y-2.5 text-sm">
              <div
                v-for="item in store.systemHealth"
                :key="item.label"
                class="flex items-center justify-between"
              >
                <dt class="text-slate-600">{{ item.label }}</dt>
                <dd class="font-mono-num text-slate-900">{{ item.value }}</dd>
              </div>
            </dl>
          </section> -->

          <!-- Needs attention (viewer-safe) -->
          <section class="rounded-xl border border-slate-200 bg-white p-4">
            <h2 class="text-sm font-semibold text-slate-900">Needs attention</h2>
            <p class="text-xs text-slate-500">Assets that need action</p>

            <ul class="mt-3 space-y-2">
              <li
                v-for="row in attentionRows"
                :key="row.name"
                class="flex items-center gap-2 text-sm"
              >
                <span
                  class="h-2 w-2 rounded-full"
                  :class="getStatusMeta(row.name).dot"
                />
                <span class="text-slate-700">{{ row.name }}</span>
                <span class="font-mono-num ml-auto text-slate-500">
                  {{ row.count }}
                </span>
              </li>
            </ul>

            <p v-if="!attentionRows.length" class="mt-3 text-sm text-slate-500">
              Nothing needs attention.
            </p>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  CableIcon,
  ClockIcon,
  HardDriveIcon,
  HomeIcon,
  ServerCogIcon,
} from 'lucide-vue-next'
import Button from '../components/ui/button.vue'
import MetricCard from '../components/ui/MetricCard.vue'
import { useDashboardStore } from '../stores/dashboard'
import { getStatusMeta } from '../utils/statusMeta'
import { actionMeta } from '../utils/actionMeta'
import { useAuthStore } from '@/stores/auth.ts'

const store = useDashboardStore()
const auth = useAuthStore()
const router = useRouter()
const canViewLogs = computed(() => auth.can('LOG_READ'))
const canViewSystemHealth = computed(() => auth.can('SETTING_READ'))

const ATTENTION_STATUSES = ['Under Repair', 'Faulty', 'Under Maintenance']
const attentionRows = computed(() =>
  store.healthRows.filter((row) => ATTENTION_STATUSES.includes(row.name)),
)

// Viewers see only their own edits; LOG_READ users see the global feed.
const myActivity = computed(() => {
  const me = auth.user?.fullName ?? 'You'
  return [
    {
      id: 'mine-1',
      user: me,
      action: 'Update',
      table: 'Assets',
      record: 'AST-10492',
      newValue: 'Status → In Service',
      timestamp: '14:22',
    },
    {
      id: 'mine-2',
      user: me,
      action: 'Update',
      table: 'Sites',
      record: 'SIT-0211',
      newValue: 'Address corrected',
      timestamp: '11:05',
    },
    {
      id: 'mine-3',
      user: me,
      action: 'Insert',
      table: 'Cables',
      record: 'CBL-8821',
      newValue: 'New fiber link',
      timestamp: '09:47',
    },
  ]
})

const visibleActivity = computed(() =>
  canViewLogs.value ? store.activity : myActivity.value,
)

const activitySubtitle = computed(() =>
  canViewLogs.value ? 'Latest edits across all tables' : 'Your recent edits',
)


const metricIcons = [HomeIcon, CableIcon, HardDriveIcon, ClockIcon]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
}

function goToAudit() {
  router.push('/app/system-logs')
}

function goToMap() {
  router.push('/app/map')
}

const nowLabel = ref('')

function updateNowLabel() {
  const now = new Date()
  nowLabel.value = now.toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

let clockTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateNowLabel()
  clockTimer = setInterval(updateNowLabel, 1000)
  store.loadDashboard()
})
</script>