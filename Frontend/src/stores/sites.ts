import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sitesApi } from '@/services/api/sites.api'
import type {
  Site,
  SiteFilters,
  CreateSitePayload,
  UpdateSitePayload,
  PaginationMeta,
} from '@/types/site'

export const useSitesStore = defineStore('sites', () => {
  const sites = ref<Site[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })

  // ---------- Computed stats (for the cards) ----------
  const totalSites = computed(() => pagination.value.total || sites.value.length)

  const attachmentTotal = computed(() =>
    sites.value.reduce((sum, s) => sum + (s.attachments?.length ?? 0), 0),
  )

  // ---------- Actions ----------
  async function loadSites(filters: SiteFilters = {}) {
    isLoading.value = true
    error.value = null
    try {
      const result = await sitesApi.getAllPaginated({
        search: filters.search || undefined,
        cityId: filters.cityId || undefined,
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
      })
      sites.value = result.sites
      pagination.value = result.meta
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to load sites'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function createSite(payload: CreateSitePayload) {
    const res = await sitesApi.create(payload)
    const record = (res as any).data ?? res
    await loadSites()
    return record
  }

  async function updateSite(id: string, payload: UpdateSitePayload) {
    const res = await sitesApi.update(id, payload)
    const record = (res as any).data ?? res
    await loadSites()
    return record
  }

  async function deleteSite(id: string) {
    await sitesApi.delete(id)
    sites.value = sites.value.filter((s) => s.id !== id)
    if (pagination.value.total > 0) {
      pagination.value.total -= 1
    }
  }

  return {
    sites,
    isLoading,
    error,
    pagination,

    totalSites,
    attachmentTotal,

    loadSites,
    createSite,
    updateSite,
    deleteSite,
  }
})