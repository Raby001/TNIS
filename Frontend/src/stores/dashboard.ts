import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ActivityEntry,
  HealthRow,
  Metric,
  SystemHealthItem,
} from '../types/dashboard'
import { sitesApi } from '@/services/api/sites.api'
import { assetApi } from '@/services/api/asset.api'
import { referenceDataApi } from '@/services/api/reference-data.api'
import type { AssetStatus } from '@/types/reference-data'
// import { dashboardApi } from '../services/api/dashboard.api'

export const useDashboardStore = defineStore('dashboard', () => {

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const metrics = ref<Metric[]>([])

  const activity = ref<ActivityEntry[]>([
    {
        id: '1',
        user: 'Sarah Chen',
        action: 'Update',
        table: 'Assets',
        record: 'AST-10492',
        newValue: 'Status → In Service',
        timestamp: '14:22',
    },
    {
        id: '2',
        user: 'Keo Wong',
        action: 'Insert',
        table: 'Cables',
        record: 'CBL-8821',
        newValue: 'New fiber link',
        timestamp: '13:58',
    },
    {
        id: '3',
        user: 'Saly Phan',
        action: 'Update',
        table: 'Approvals',
        record: 'REQ-441',
        newValue: 'Equipment purchase',
        timestamp: '12:40',
    },
    {
        id: '4',
        user: 'Sros Tan',
        action: 'Update',
        table: 'POPs',
        record: 'POP-North-07',
        newValue: 'Capacity +20%',
        timestamp: '11:15',
    },
    {
        id: '5',
        user: 'Bopha Chum',
        action: 'Delete',
        table: 'Equipment',
        record: 'EQ-3391',
        newValue: 'End of life',
        timestamp: '09:47',
    },
    ])

  const healthRows = ref<HealthRow[]>([])

    const systemHealth = ref([
    { label: 'Last backup', value: '2 Aug 2026, 03:00' },
    { label: 'Database size', value: '4.7 GB' },
    { label: 'Active sessions', value: '23' },
    { label: 'Import jobs queued', value: '1' },
    ])

  const totalHealth = computed(() =>
    healthRows.value.reduce((sum, row) => sum + row.count, 0)
  )

  function percentOf(row: HealthRow) {
    if (!totalHealth.value) return 0
    return (row.count / totalHealth.value) * 100
  }

  async function loadStatusMix() {
    try {
      const statusRes = await referenceDataApi.getStatuses()
      const raw = statusRes.data ?? statusRes
      const statuses: AssetStatus[] = Array.isArray(raw) ? raw : []

      const rows = await Promise.all(
        statuses.map(async (status) => {
          try {
            const res = await assetApi.fetchAssets({
              statusId: status.id,
              page: 1,
              limit: 1,
            })
            return { name: status.name, count: res.meta?.total ?? 0 }
          } catch {
            return { name: status.name, count: 0 }
          }
        }),
      )

      // Drop zero-count rows so the legend only lists statuses that exist
      healthRows.value = rows.filter((row) => row.count > 0)
    } catch (err) {
      console.error('Failed to load status mix', err)
      healthRows.value = []
    }
  }

  function startOfThisMonth() {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  }

  function isCreatedThisMonth(createdAt?: string) {
    if (!createdAt) return false
    const created = new Date(createdAt)
    return created >= startOfThisMonth() && created <= new Date()
  }

  async function loadDashboard() {
    isLoading.value = true
    error.value = null

    try {
      const sitesResult = await sitesApi.getAllPaginated({
        page: 1,
        limit: 100,
      })

      const totalSites = sitesResult.meta?.total ?? sitesResult.sites.length
      const createdThisMonth = sitesResult.sites.filter((s) =>
        isCreatedThisMonth(s.createdAt),
      ).length

      let assetTotal: number | string = '—'
      try {
        const assetsResult = await assetApi.fetchAssets({ page: 1, limit: 1 })
        assetTotal = assetsResult.meta?.total ?? assetsResult.assets.length
      } catch {
        // ignore
      }

      metrics.value = [
        {
          label: 'Total Sites',
          value: totalSites,
          hint:
            createdThisMonth > 0
              ? `+${createdThisMonth} added this month`
              : 'No new sites this month',
          tone: 'emerald',
          to: '/app/data-management/sites',
        },
        {
          label: 'Total Cables',
          value: '—',
          hint: 'Cable API not wired yet',
          tone: 'blue',
        },
        {
          label: 'Total Equipment',
          value: assetTotal,
          hint: 'Assets in registry',
          tone: 'violet',
          to: '/app/data-management/assets',
        },
        {
          label: 'Pending Approvals',
          value: '—',
          hint: 'Approvals when API is available',
          tone: 'amber',
        },
      ]
      // Status mix for the "Network status mix" chart
      await loadStatusMix()
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to load dashboard'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    metrics,
    activity,
    healthRows,
    systemHealth,
    totalHealth,
    percentOf,
    loadStatusMix,
    loadDashboard,
  }
})