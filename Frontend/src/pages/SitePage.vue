<template>
  <div class="h-full overflow-y-auto px-4 py-6 pb-10 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-slate-900">Directory</h1>
      </div>
      <Button @click="openAddModal" class="rounded-xl border border-blue-600 bg-blue-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md">
        <PlusIcon class="h-4 w-4" />
        Add Site
      </Button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MetricCard
        label="Total sites"
        :value="store.totalSites"
        :hint="`${store.sites.length} loaded`"
        :icon="BuildingIcon"
        tone="blue"
        :clickable="true"
        :class="siteSummaryFilter === 'all' ? 'border-blue-200 bg-blue-50 shadow-[0_0_0_3px_rgba(59,130,246,0.12)] ring-1 ring-blue-200' : ''"
        @click="selectSiteSummaryFilter('all')"
      />
      <MetricCard
        label="With attachments"
        :value="sitesWithAttachments"
        hint="Sites that have photos or documents"
        :icon="FileTextIcon"
        tone="emerald"
        :clickable="true"
        :class="siteSummaryFilter === 'with-attachments' ? 'border-emerald-200 bg-emerald-50 shadow-[0_0_0_3px_rgba(16,185,129,0.12)] ring-1 ring-emerald-200' : ''"
        @click="selectSiteSummaryFilter('with-attachments')"
      />
      <MetricCard
        label="Total attachments"
        :value="store.attachmentTotal"
        hint="Photos and documents across all sites"
        :icon="ImageIcon"
        tone="violet"
      />
    </div>

    <!-- Table section -->
    <section class="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
        <div class="relative max-w-xs flex-1">
          <SearchIcon
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <Input
            variant="asset"
            v-model="filters.search"
            placeholder="Search name, code…"
            class="border-slate-300 bg-white pl-9 shadow-sm"
          />
        </div>

        <!-- Province Combobox -->
        <SearchableSelection
          v-model="selectedProvinceId"
          :items="provinces"
          label-key="name"
          value-key="id"
          secondary-key="code"
          placeholder="Filter by province…"
        />

        <!-- <Select variant="asset" v-model="filters.type" class="max-w-[190px]">
          <option value="">All site types</option>
          <option v-for="t in siteTypes" :key="t" :value="t">{{ t }}</option>
        </Select> -->

        <span class="ml-auto text-xs text-slate-500">
          {{ visibleSites.length }} sites on this page · {{ totalItems }} total
        </span>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th class="px-4 py-2.5 font-medium">Site</th>
              <!-- <th class="px-4 py-2.5 font-medium">Type</th> -->
              <th class="px-4 py-2.5 font-medium">Location</th>
              <th class="px-4 py-2.5 font-medium">Files</th>
              <th class="px-4 py-2.5 font-medium">Updated</th>
              <th class="px-4.5 py-2.5 pl-6 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <tr v-if="store.isLoading">
              <td colspan="6" class="px-4 py-12 text-center text-sm text-slate-500">
                Loading sites…
              </td>
            </tr>

            <tr v-else-if="visibleSites.length === 0">
              <td colspan="6" class="px-4 py-12 text-center text-sm text-slate-500">
                No sites match those filters.
              </td>
            </tr>

            <tr
              v-for="site in visibleSites"
              v-else
              :key="site.id"
              class="transition hover:bg-slate-50"
            >
              <!-- Site -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="getCover(site)"
                    :src="getCover(site)!.url"
                    alt=""
                    class="h-9 w-12 shrink-0 rounded border border-slate-200 object-cover"
                  />
                  <span
                    v-else
                    class="flex h-9 w-12 shrink-0 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-slate-400"
                  >
                    <ImageIcon class="h-4 w-4" />
                  </span>

                  <div class="min-w-0">
                    <p class="truncate font-medium text-slate-900">{{ site.name }}</p>
                    <p class="font-mono-num text-xs text-slate-500">
                      {{ site.code ?? 'None' }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Type -->
              <!-- <td class="px-4 py-3 text-slate-600">
                {{ site.type ?? 'None' }}
              </td> -->

              <!-- Location -->
              <td class="px-4 py-3">
                <p class="text-slate-700">
                  {{ site.provinceName || site.cityName || 'None' }}
                </p>
                <p class="font-mono-num text-[11px] text-slate-400">
                  {{ site.latitude.toFixed(4) }}, {{ site.longitude.toFixed(4) }}
                </p>
              </td>

              <!-- Files -->
              <td class="px-4 py-3">
                <span class="flex items-center gap-3 text-xs text-slate-600">
                  <span class="inline-flex items-center gap-1">
                    <ImageIcon class="h-3.5 w-3.5 text-slate-400" />
                    {{ countPhotos(site) }}
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <FileTextIcon class="h-3.5 w-3.5 text-slate-400" />
                    {{ countDocs(site) }}
                  </span>
                </span>
              </td>

              <!-- Updated -->
              <td class="font-mono-num px-4 py-3 text-xs text-slate-500">
                {{ formatDate(site.updatedAt) }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-3 pr-5">
                <div class="flex items-center justify-end gap-1.5">
                  <Button variant="secondary" size="sm" @click="openEditModal(site)">
                    <PencilIcon class="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    class="text-red-600 hover:bg-red-50"
                    @click="openDeleteModal(site)"
                  >
                    <TrashIcon class="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        ref="paginationRef"
        class="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3"
      >
        <p class="text-sm text-slate-500">
          Showing
          <span class="font-medium text-slate-700">
            {{ totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1 }}
          </span>
          –
          <span class="font-medium text-slate-700">
            {{ Math.min(currentPage * pageSize, totalItems) }}
          </span>
          of
          <span class="font-medium text-slate-700">{{ totalItems }}</span>
          sites
        </p>

        <div class="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            :disabled="currentPage <= 1 || store.isLoading"
            @click="goToPage(currentPage - 1)"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </Button>

          <span class="px-3 text-sm text-slate-600">
            Page {{ currentPage }} / {{ totalPages }}
          </span>

          <Button
            variant="secondary"
            size="sm"
            :disabled="currentPage >= totalPages || store.isLoading"
            @click="goToPage(currentPage + 1)"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>

    <!-- Delete modal -->
    <Modal
      :open="!!deleting"
      title="Delete site"
      :description="deleting ? `${deleting.name} · ${deleting.code ?? ''}` : undefined"
      width-class="max-w-md"
      @close="deleting = null"
    >
      <div class="flex gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <TriangleAlertIcon class="h-4.5 w-4.5" />
        </span>
        <div class="text-sm text-slate-700">
          <p>
            This removes the site record along with
            <span class="font-medium">
              {{ deleting?.attachments?.length ?? 0 }} attachment(s)
            </span>.
            Cables and equipment referencing it will be left unassigned.
          </p>
          <p class="mt-2 text-xs text-slate-500">
            The deletion is recorded in the audit log and can be reversed by an
            Administrator within 30 days.
          </p>
        </div>
      </div>

      <p v-if="deleteError" class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
        {{ deleteError }}
      </p>

      <template #footer>
        <Button variant="secondary" @click="deleting = null">Cancel</Button>
        <Button
          class="bg-red-600 text-white hover:bg-red-700"
          :disabled="isDeleting"
          @click="confirmDelete"
        >
          {{ isDeleting ? 'Deleting…' : 'Delete site' }}
        </Button>
      </template>
    </Modal>

    <!-- Form modal -->
    <SiteFormModal
      :open="formOpen"
      :site="editing"
      @close="closeFormModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import {
  BuildingIcon,
  FileTextIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  TriangleAlertIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-vue-next'

import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import SearchableSelection from '@/components/ui/SearchableSelection.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import Modal from '@/components/ui/Modal.vue'
import SiteFormModal from '@/components/site/SiteFormModal.vue'
import { referenceDataApi } from '@/services/api/reference-data.api'
import type { Province } from '@/types/reference-data'

import { useSitesStore } from '@/stores/sites'
import type { Site } from '@/types/site'

const store = useSitesStore()

const filters = reactive({
  search: '',
  type: '',
})
const siteSummaryFilter = ref<'all' | 'with-attachments'>('all')

const formOpen = ref(false)
const editing = ref<Site | null>(null)
const deleting = ref<Site | null>(null)
const isDeleting = ref(false)
const deleteError = ref('')
const pageSize = 10
const paginationRef = ref<HTMLElement | null>(null)

const provinces = ref<Province[]>([])
const selectedProvinceId = ref('')
const selectedProvinceName = computed(
  () => provinces.value.find((p) => p.id === selectedProvinceId.value)?.name ?? '',
)

const siteTypes = ['Exchange', 'Tower', 'Cabinet', 'Chamber', 'POP', 'Street Cabinet']

const currentPage = computed(() => store.pagination.page)
const totalPages = computed(() => store.pagination.totalPages)
const totalItems = computed(() => store.pagination.total)

const sitesWithAttachments = computed(
  () => store.sites.filter((s) => (s.attachments?.length ?? 0) > 0).length,
)

const visibleSites = computed(() => {
  if (siteSummaryFilter.value === 'all') {
    return store.sites
  }

  return store.sites.filter((site) => (site.attachments?.length ?? 0) > 0)
})

function selectSiteSummaryFilter(filter: 'all' | 'with-attachments') {
  siteSummaryFilter.value = siteSummaryFilter.value === filter ? 'all' : filter
}

function getCover(site: Site) {
  return site.attachments?.find((a) => a.kind === 'photo')
}

function countPhotos(site: Site) {
  return site.attachments?.filter((a) => a.kind === 'photo').length ?? 0
}

function countDocs(site: Site) {
  return site.attachments?.filter((a) => a.kind === 'document').length ?? 0
}

function formatDate(value?: string) {
  if (!value) return 'None'
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

async function loadPage(page: number, keepPaginationVisible = false) {
  const searchText = [filters.search.trim(), selectedProvinceName.value.trim()]
    .filter(Boolean)
    .join(' ')

  await store.loadSites({
    search: searchText || undefined,
    type: filters.type || undefined,
    page,
    limit: pageSize,
    sortBy: 'updatedAt',
    sortOrder: 'DESC',
  })

  if (keepPaginationVisible) {
    await nextTick()
    paginationRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  loadPage(page, true)
}

function openAddModal() {
  editing.value = null
  formOpen.value = true
}

function openEditModal(site: Site) {
  editing.value = site
  formOpen.value = true
}

function closeFormModal() {
  formOpen.value = false
  editing.value = null
}

function openDeleteModal(site: Site) {
  deleting.value = site
}

async function loadProvinces() {
  try {
    const res = await referenceDataApi.getProvinces()
    provinces.value = (res as any).data ?? res ?? []
  } catch (err) {
    console.error('Failed to load provinces', err)
  }
}

async function confirmDelete() {
  if (!deleting.value) return
  deleteError.value = ''
  isDeleting.value = true
  try {
    await store.deleteSite(deleting.value.id)
    deleting.value = null
  } catch (err: any) {
    console.error(err)
    deleteError.value =
      err?.response?.data?.message ??
      err?.message ??
      'Failed to delete site. Please try again.'
  } finally {
    isDeleting.value = false
  }
}

function handleSaved() {
  closeFormModal()
  loadPage(1)
}

let searchTimeout: ReturnType<typeof setTimeout>

watch(
  () => [filters.search, filters.type, selectedProvinceId.value],
  () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      loadPage(1)
    }, 300)
  },
)

onMounted(() => {
  loadPage(1)
  loadProvinces()
})
</script>